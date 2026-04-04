import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'LGMU Messenger API'
  });
});

export default router;    path: req.originalUrl,
    method: req.method
  });
});

export function setupRoutes(app: any): void {
  app.use(router);
}
