import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen: Date;
  bio?: string;
  location?: string;
  birthDate?: Date;
  language: string;
  timezone: string;
  isOnline: boolean;
  isVerified: boolean;
  isBlocked: boolean;
  contacts: mongoose.Types.ObjectId[];
  blockedUsers: mongoose.Types.ObjectId[];
  settings: {
    notifications: {
      messages: boolean;
      calls: boolean;
      mentions: boolean;
      sound: boolean;
      vibration: boolean;
    };
    privacy: {
      lastSeen: 'everyone' | 'contacts' | 'nobody';
      profilePhoto: 'everyone' | 'contacts' | 'nobody';
      status: 'everyone' | 'contacts' | 'nobody';
      readReceipts: boolean;
    };
    appearance: {
      theme: 'light' | 'dark' | 'system';
      fontSize: 'small' | 'medium' | 'large';
      compactMode: boolean;
    };
    security: {
      twoFactorEnabled: boolean;
      twoFactorSecret?: string;
      sessionTimeout: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  avatar: {
    type: String
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'away', 'busy'],
    default: 'offline'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  bio: {
    type: String,
    maxlength: 500
  },
  location: {
    type: String,
    maxlength: 100
  },
  birthDate: {
    type: Date
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'ru', 'de', 'fr', 'es', 'zh', 'ja', 'ko']
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  contacts: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  blockedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  settings: {
    notifications: {
      messages: { type: Boolean, default: true },
      calls: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true },
      sound: { type: Boolean, default: true },
      vibration: { type: Boolean, default: true }
    },
    privacy: {
      lastSeen: { type: String, enum: ['everyone', 'contacts', 'nobody'], default: 'contacts' },
      profilePhoto: { type: String, enum: ['everyone', 'contacts', 'nobody'], default: 'contacts' },
      status: { type: String, enum: ['everyone', 'contacts', 'nobody'], default: 'contacts' },
      readReceipts: { type: Boolean, default: true }
    },
    appearance: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
      compactMode: { type: Boolean, default: false }
    },
    security: {
      twoFactorEnabled: { type: Boolean, default: false },
      twoFactorSecret: { type: String },
      sessionTimeout: { type: Number, default: 30 }
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ isOnline: 1 });
userSchema.index({ lastSeen: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
