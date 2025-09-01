// MongoDB initialization script for Docker
// This script runs when the MongoDB container starts for the first time

print('Starting MongoDB initialization...');

// Switch to admin database
db = db.getSiblingDB('admin');

// Create admin user if it doesn't exist
if (!db.getUser('admin')) {
    print('Creating admin user...');
    db.createUser({
        user: 'admin',
        pwd: 'secure_password_123',
        roles: [
            { role: 'userAdminAnyDatabase', db: 'admin' },
            { role: 'readWriteAnyDatabase', db: 'admin' },
            { role: 'dbAdminAnyDatabase', db: 'admin' }
        ]
    });
    print('Admin user created successfully');
}

// Switch to LGMU Messenger database
db = db.getSiblingDB('lgmu_messenger');

// Create collections with proper indexes
print('Creating collections and indexes...');

// Users collection
db.createCollection('users');
db.users.createIndex({ 'username': 1 }, { unique: true });
db.users.createIndex({ 'email': 1 }, { unique: true });
db.users.createIndex({ 'isOnline': 1 });
db.users.createIndex({ 'lastSeen': 1 });

// Chats collection
db.createCollection('chats');
db.chats.createIndex({ 'participants': 1 });
db.chats.createIndex({ 'type': 1 });
db.chats.createIndex({ 'isActive': 1 });
db.chats.createIndex({ 'lastMessage.timestamp': -1 });

// Messages collection
db.createCollection('messages');
db.messages.createIndex({ 'chatId': 1, 'createdAt': -1 });
db.messages.createIndex({ 'sender': 1 });
db.messages.createIndex({ 'type': 1 });
db.messages.createIndex({ 'isDeleted': 1 });
db.messages.createIndex({ 'isPinned': 1 });

// Create text indexes for search functionality
db.messages.createIndex({ 'content': 'text' });
db.users.createIndex({ 'firstName': 'text', 'lastName': 'text', 'username': 'text' });

// Create capped collection for real-time events
db.createCollection('events', { capped: true, size: 10000000, max: 10000 });

// Create collection for system settings
db.createCollection('system_settings');
db.system_settings.insertOne({
    _id: 'app_config',
    version: '1.0.0',
    features: {
        encryption: true,
        webrtc: true,
        bots: true,
        plugins: true,
        twoFactorAuth: true
    },
    limits: {
        maxFileSize: 52428800,
        maxMessageLength: 4096,
        maxParticipants: 1000,
        maxGroupSize: 200
    },
    createdAt: new Date(),
    updatedAt: new Date()
});

// Create collection for plugins
db.createCollection('plugins');
db.plugins.createIndex({ 'name': 1 }, { unique: true });
db.plugins.createIndex({ 'isActive': 1 });
db.plugins.createIndex({ 'category': 1 });

// Create collection for bots
db.createCollection('bots');
db.bots.createIndex({ 'username': 1 }, { unique: true });
db.bots.createIndex({ 'isActive': 1 });
db.bots.createIndex({ 'owner': 1 });

// Create collection for file uploads
db.createCollection('files');
db.files.createIndex({ 'uploadedBy': 1 });
db.files.createIndex({ 'chatId': 1 });
db.files.createIndex({ 'uploadedAt': -1 });
db.files.createIndex({ 'mimeType': 1 });

// Create collection for user sessions
db.createCollection('sessions');
db.sessions.createIndex({ 'userId': 1 });
db.sessions.createIndex({ 'token': 1 }, { unique: true });
db.sessions.createIndex({ 'expiresAt': 1 });

// Create collection for notifications
db.createCollection('notifications');
db.notifications.createIndex({ 'userId': 1 });
db.notifications.createIndex({ 'isRead': 1 });
db.notifications.createIndex({ 'createdAt': -1 });

// Create collection for call logs
db.createCollection('call_logs');
db.call_logs.createIndex({ 'participants': 1 });
db.call_logs.createIndex({ 'startTime': -1 });
db.call_logs.createIndex({ 'type': 1 });

// Create collection for encryption keys
db.createCollection('encryption_keys');
db.encryption_keys.createIndex({ 'keyId': 1 }, { unique: true });
db.encryption_keys.createIndex({ 'expiresAt': 1 });

// Create collection for audit logs
db.createCollection('audit_logs');
db.audit_logs.createIndex({ 'userId': 1 });
db.audit_logs.createIndex({ 'action': 1 });
db.audit_logs.createIndex({ 'timestamp': -1 });

// Insert default admin user
print('Creating default admin user...');
db.users.insertOne({
    username: 'admin',
    email: 'admin@lgmu-messenger.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqKqKq', // 'admin123'
    firstName: 'System',
    lastName: 'Administrator',
    isVerified: true,
    isOnline: false,
    status: 'offline',
    lastSeen: new Date(),
    language: 'en',
    timezone: 'UTC',
    settings: {
        notifications: {
            messages: true,
            calls: true,
            mentions: true,
            sound: true,
            vibration: true
        },
        privacy: {
            lastSeen: 'everyone',
            profilePhoto: 'everyone',
            status: 'everyone',
            readReceipts: true
        },
        appearance: {
            theme: 'system',
            fontSize: 'medium',
            compactMode: false
        },
        security: {
            twoFactorEnabled: false,
            sessionTimeout: 30
        }
    },
    createdAt: new Date(),
    updatedAt: new Date()
});

// Insert default bot
print('Creating default bot...');
db.bots.insertOne({
    username: 'help_bot',
    firstName: 'Help',
    lastName: 'Bot',
    description: 'Official help bot for LGMU Messenger',
    isActive: true,
    owner: db.users.findOne({ username: 'admin' })._id,
    commands: [
        {
            command: '/start',
            description: 'Start the bot',
            handler: 'start'
        },
        {
            command: '/help',
            description: 'Show help information',
            handler: 'help'
        },
        {
            command: '/about',
            description: 'About LGMU Messenger',
            handler: 'about'
        }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
});

// Insert default plugin
print('Creating default plugin...');
db.plugins.insertOne({
    name: 'emoji-picker',
    displayName: 'Emoji Picker',
    description: 'Enhanced emoji picker with categories and search',
    version: '1.0.0',
    author: 'LGMU Team',
    category: 'ui',
    isActive: true,
    isOfficial: true,
    permissions: ['read_messages', 'send_messages'],
    settings: {
        enableSearch: true,
        showCategories: true,
        recentEmojis: true
    },
    createdAt: new Date(),
    updatedAt: new Date()
});

print('MongoDB initialization completed successfully!');
print('Database: lgmu_messenger');
print('Collections created: users, chats, messages, events, system_settings, plugins, bots, files, sessions, notifications, call_logs, encryption_keys, audit_logs');
print('Default admin user: admin / admin123');
print('Default bot: @help_bot');
print('Default plugin: emoji-picker');
