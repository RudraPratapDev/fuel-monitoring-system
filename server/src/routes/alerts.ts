// ─── Fuel Sentinel — Alert API Routes ───────────────────────────────

import { Router, Request, Response } from 'express';
import { getAlerts, acknowledgeAlert, clearAlerts, getAlertStats } from '../services/alertEngine';

const router = Router();

// GET /api/alerts — list alerts with optional severity filter
router.get('/', async (req: Request, res: Response) => {
  try {
    const severity = req.query.severity as string | undefined;
    const limit = parseInt(req.query.limit as string) || 100;
    const skip = parseInt(req.query.skip as string) || 0;
    const filter = severity ? { severity } : undefined;
    const alerts = await getAlerts(filter, limit, skip);
    res.json(alerts);
  } catch (err) {
    console.error('[Alerts] Error fetching alerts:', err);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// GET /api/alerts/stats — summary counts
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await getAlertStats();
    res.json(stats);
  } catch (err) {
    console.error('[Alerts] Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch alert stats' });
  }
});

// PUT /api/alerts/:id/acknowledge
router.put('/:id/acknowledge', async (req: Request, res: Response) => {
  try {
    const ok = await acknowledgeAlert(req.params.id);
    res.json({ success: ok });
  } catch (err) {
    console.error('[Alerts] Error acknowledging alert:', err);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

// DELETE /api/alerts — clear all
router.delete('/', async (_req: Request, res: Response) => {
  try {
    await clearAlerts();
    res.json({ success: true });
  } catch (err) {
    console.error('[Alerts] Error clearing alerts:', err);
    res.status(500).json({ error: 'Failed to clear alerts' });
  }
});

export default router;
