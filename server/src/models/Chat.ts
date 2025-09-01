import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  type: 'private' | 'group' | 'channel';
  participants: mongoose.Types.ObjectId[];
  admins: mongoose.Types.ObjectId[];
  name?: string;
  description?: string;
  avatar?: string;
  isActive: boolean;
  lastMessage?: {
    content: string;
    sender: mongoose.Types.ObjectId;
    timestamp: Date;
    type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'sticker';
  };
  pinnedMessages: mongoose.Types.ObjectId[];
  settings: {
    onlyAdminsCanSendMessages: boolean;
    onlyAdminsCanEditInfo: boolean;
    slowMode: boolean;
    slowModeInterval?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>({
  type: {
    type: String,
    enum: ['private', 'group', 'channel'],
    required: true
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  admins: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  name: {
    type: String,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  avatar: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessage: {
    content: String,
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date,
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'file', 'sticker']
    }
  },
  pinnedMessages: [{
    type: Schema.Types.ObjectId,
    ref: 'Message'
  }],
  settings: {
    onlyAdminsCanSendMessages: {
      type: Boolean,
      default: false
    },
    onlyAdminsCanEditInfo: {
      type: Boolean,
      default: false
    },
    slowMode: {
      type: Boolean,
      default: false
    },
    slowModeInterval: {
      type: Number,
      min: 0,
      max: 3600
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
chatSchema.index({ participants: 1 });
chatSchema.index({ type: 1 });
chatSchema.index({ isActive: 1 });
chatSchema.index({ 'lastMessage.timestamp': -1 });

// Ensure private chats have exactly 2 participants
chatSchema.pre('save', function(next) {
  if (this.type === 'private' && this.participants.length !== 2) {
    return next(new Error('Private chats must have exactly 2 participants'));
  }
  
  if (this.type === 'group' && this.participants.length < 2) {
    return next(new Error('Group chats must have at least 2 participants'));
  }
  
  next();
});

export const Chat = mongoose.model<IChat>('Chat', chatSchema);
