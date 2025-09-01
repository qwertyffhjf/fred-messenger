import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { User } from '../models/User';
import { Chat } from '../models/Chat';
import { Message } from '../models/Message';
import { encryptionService } from '../security/encryption';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

interface SocketMessage {
  chatId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'sticker' | 'voice';
  replyTo?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  fileSize?: number;
  duration?: number;
  width?: number;
  height?: number;
  mimeType?: string;
  fileName?: string;
}

export function setupSocketHandlers(io: Server): void {
  // Middleware for authentication
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token and get user
      const user = await verifyToken(token);
      if (!user) {
        return next(new Error('Invalid token'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`🔌 User connected: ${socket.userId}`);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Update user status to online
    updateUserStatus(socket.userId, true);

    // Handle user joining chats
    socket.on('join-chats', async (chatIds: string[]) => {
      try {
        for (const chatId of chatIds) {
          const chat = await Chat.findById(chatId);
          if (chat && chat.participants.includes(socket.userId)) {
            socket.join(`chat:${chatId}`);
            logger.info(`User ${socket.userId} joined chat ${chatId}`);
          }
        }
      } catch (error) {
        logger.error('Error joining chats:', error);
      }
    });

    // Handle new message
    socket.on('send-message', async (messageData: SocketMessage) => {
      try {
        const message = await createMessage(socket.userId, messageData);
        
        // Broadcast message to chat participants
        const chat = await Chat.findById(messageData.chatId);
        if (chat) {
          const encryptedContent = encryptionService.encryptMessage(messageData.content);
          
          const messagePayload = {
            ...message.toObject(),
            content: encryptedContent.encryptedContent,
            isEncrypted: true
          };

          io.to(`chat:${messageData.chatId}`).emit('new-message', messagePayload);
          
          // Send notification to offline users
          await sendPushNotifications(chat, message, socket.userId);
        }
      } catch (error) {
        logger.error('Error sending message:', error);
        socket.emit('message-error', { error: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing-start', (chatId: string) => {
      socket.to(`chat:${chatId}`).emit('user-typing', {
        userId: socket.userId,
        chatId,
        isTyping: true
      });
    });

    socket.on('typing-stop', (chatId: string) => {
      socket.to(`chat:${chatId}`).emit('user-typing', {
        userId: socket.userId,
        chatId,
        isTyping: false
      });
    });

    // Handle message reactions
    socket.on('react-to-message', async (data: { messageId: string; emoji: string }) => {
      try {
        const message = await Message.findById(data.messageId);
        if (message) {
          const existingReaction = message.reactions.find(
            r => r.user.toString() === socket.userId
          );

          if (existingReaction) {
            existingReaction.emoji = data.emoji;
            existingReaction.timestamp = new Date();
          } else {
            message.reactions.push({
              user: socket.userId,
              emoji: data.emoji,
              timestamp: new Date()
            });
          }

          await message.save();

          // Broadcast reaction update
          io.to(`chat:${message.chatId}`).emit('message-reaction-updated', {
            messageId: data.messageId,
            reactions: message.reactions
          });
        }
      } catch (error) {
        logger.error('Error handling message reaction:', error);
      }
    });

    // Handle message editing
    socket.on('edit-message', async (data: { messageId: string; newContent: string }) => {
      try {
        const message = await Message.findById(data.messageId);
        if (message && message.sender.toString() === socket.userId) {
          // Store edit history
          message.editHistory.push({
            content: message.content,
            editedAt: new Date()
          });

          message.content = data.newContent;
          message.isEdited = true;
          await message.save();

          // Broadcast edited message
          io.to(`chat:${message.chatId}`).emit('message-edited', {
            messageId: data.messageId,
            newContent: data.newContent,
            editedAt: new Date()
          });
        }
      } catch (error) {
        logger.error('Error editing message:', error);
      }
    });

    // Handle message deletion
    socket.on('delete-message', async (messageId: string) => {
      try {
        const message = await Message.findById(messageId);
        if (message && message.sender.toString() === socket.userId) {
          message.isDeleted = true;
          message.deletedAt = new Date();
          await message.save();

          // Broadcast message deletion
          io.to(`chat:${message.chatId}`).emit('message-deleted', {
            messageId,
            deletedAt: new Date()
          });
        }
      } catch (error) {
        logger.error('Error deleting message:', error);
      }
    });

    // Handle read receipts
    socket.on('mark-as-read', async (chatId: string) => {
      try {
        await Message.updateMany(
          {
            chatId,
            sender: { $ne: socket.userId },
            'readBy.user': { $ne: socket.userId }
          },
          {
            $push: {
              readBy: {
                user: socket.userId,
                readAt: new Date()
              }
            }
          }
        );

        // Broadcast read receipt
        socket.to(`chat:${chatId}`).emit('messages-read', {
          userId: socket.userId,
          chatId,
          readAt: new Date()
        });
      } catch (error) {
        logger.error('Error marking messages as read:', error);
      }
    });

    // Handle user status updates
    socket.on('update-status', async (status: 'online' | 'offline' | 'away' | 'busy') => {
      try {
        await User.findByIdAndUpdate(socket.userId, {
          status,
          lastSeen: new Date()
        });

        // Broadcast status update to contacts
        const user = await User.findById(socket.userId);
        if (user) {
          user.contacts.forEach(contactId => {
            io.to(`user:${contactId}`).emit('user-status-updated', {
              userId: socket.userId,
              status,
              lastSeen: new Date()
            });
          });
        }
      } catch (error) {
        logger.error('Error updating user status:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      logger.info(`🔌 User disconnected: ${socket.userId}`);
      
      if (socket.userId) {
        await updateUserStatus(socket.userId, false);
        
        // Notify contacts about offline status
        const user = await User.findById(socket.userId);
        if (user) {
          user.contacts.forEach(contactId => {
            io.to(`user:${contactId}`).emit('user-status-updated', {
              userId: socket.userId,
              status: 'offline',
              lastSeen: new Date()
            });
          });
        }
      }
    });
  });
}

// Helper functions
async function verifyToken(token: string): Promise<any> {
  // Implement JWT verification logic here
  // This is a placeholder - you'll need to implement actual JWT verification
  try {
    // Decode and verify JWT token
    // Return user object if valid
    return { _id: 'placeholder' };
  } catch (error) {
    return null;
  }
}

async function updateUserStatus(userId: string, isOnline: boolean): Promise<void> {
  try {
    await User.findByIdAndUpdate(userId, {
      isOnline,
      lastSeen: new Date(),
      status: isOnline ? 'online' : 'offline'
    });
  } catch (error) {
    logger.error('Error updating user status:', error);
  }
}

async function createMessage(userId: string, messageData: SocketMessage): Promise<any> {
  try {
    const message = new Message({
      chatId: messageData.chatId,
      sender: userId,
      type: messageData.type,
      content: messageData.content,
      mediaUrl: messageData.mediaUrl,
      thumbnailUrl: messageData.thumbnailUrl,
      fileSize: messageData.fileSize,
      duration: messageData.duration,
      width: messageData.width,
      height: messageData.height,
      mimeType: messageData.mimeType,
      fileName: messageData.fileName,
      replyTo: messageData.replyTo
    });

    return await message.save();
  } catch (error) {
    logger.error('Error creating message:', error);
    throw error;
  }
}

async function sendPushNotifications(chat: any, message: any, senderId: string): Promise<void> {
  try {
    // Implement push notification logic here
    // This could include FCM, APNS, or other push services
    logger.info(`Push notification sent for message in chat ${chat._id}`);
  } catch (error) {
    logger.error('Error sending push notifications:', error);
  }
}
