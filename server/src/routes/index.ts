import { Router, Express } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'LGMU Messenger API'
  });
});

export function setupRoutes(app: Express): void {
  app.use(router);
}

export default router;
