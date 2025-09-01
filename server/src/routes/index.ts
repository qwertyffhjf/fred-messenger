import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import chatRoutes from './chats';
import messageRoutes from './messages';
import mediaRoutes from './media';
import botRoutes from './bots';
import pluginRoutes from './plugins';

const router = Router();

// API version prefix
const API_PREFIX = '/api/v1';

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'LGMU Messenger API'
  });
});

// Mount route modules
router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/users`, userRoutes);
router.use(`${API_PREFIX}/chats`, chatRoutes);
router.use(`${API_PREFIX}/messages`, messageRoutes);
router.use(`${API_PREFIX}/media`, mediaRoutes);
router.use(`${API_PREFIX}/bots`, botRoutes);
router.use(`${API_PREFIX}/plugins`, pluginRoutes);

// 404 handler for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

export function setupRoutes(app: any): void {
  app.use(router);
}
