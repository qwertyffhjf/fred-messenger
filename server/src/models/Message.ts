import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'sticker' | 'voice' | 'location' | 'contact';
  content: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  fileSize?: number;
  duration?: number;
  width?: number;
  height?: number;
  mimeType?: string;
  fileName?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  contact?: {
    name: string;
    phoneNumber: string;
    email?: string;
  };
  replyTo?: mongoose.Types.ObjectId;
  forwardedFrom?: mongoose.Types.ObjectId;
  isEdited: boolean;
  editHistory: {
    content: string;
    editedAt: Date;
  }[];
  isDeleted: boolean;
  deletedAt?: Date;
  readBy: {
    user: mongoose.Types.ObjectId;
    readAt: Date;
  }[];
  reactions: {
    user: mongoose.Types.ObjectId;
    emoji: string;
    timestamp: Date;
  }[];
  isPinned: boolean;
  pinnedAt?: Date;
  pinnedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  chatId: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'file', 'sticker', 'voice', 'location', 'contact'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 4096
  },
  mediaUrl: String,
  thumbnailUrl: String,
  fileSize: Number,
  duration: Number,
  width: Number,
  height: Number,
  mimeType: String,
  fileName: String,
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  contact: {
    name: String,
    phoneNumber: String,
    email: String
  },
  replyTo: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  forwardedFrom: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  readBy: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  reactions: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  pinnedAt: Date,
  pinnedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for performance
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ type: 1 });
messageSchema.index({ isDeleted: 1 });
messageSchema.index({ isPinned: 1 });

// Update chat's lastMessage when message is created
messageSchema.post('save', async function(doc) {
  if (!doc.isDeleted) {
    const Chat = mongoose.model('Chat');
    await Chat.findByIdAndUpdate(doc.chatId, {
      lastMessage: {
        content: doc.content,
        sender: doc.sender,
        timestamp: doc.createdAt,
        type: doc.type
      }
    });
  }
});

export const Message = mongoose.model<IMessage>('Message', messageSchema);
