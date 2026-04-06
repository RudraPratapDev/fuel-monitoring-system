// ─── Fuel Sentinel — Sensor API Routes ──────────────────────────────

import { Router, Request, Response } from 'express';
import { fetchAllSensorData, updatePin } from '../services/blynk';
import { getHistoricalData, getHistoricalDataRange, getDailyStats } from '../services/dataStore';
import { assessThreat } from '../services/alertEngine';
import { BLYNK_CONFIG } from '../types';

const router = Router();

// GET /api/sensors/current — live data from Blynk
router.get('/current', async (_req: Request, res: Response) => {
  try {
    const data = await fetchAllSensorData();
    const threat = assessThreat(data);
    res.json({ sensor: data, threat });
  } catch (err) {
    console.error('[Sensors] Error fetching current data:', err);
    res.status(500).json({ error: 'Failed to fetch sensor data' });
  }
});

// GET /api/sensors/history?hours=24
router.get('/history', async (req: Request, res: Response) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const data = await getHistoricalData(hours);
    res.json(data);
  } catch (err) {
    console.error('[Sensors] Error fetching history:', err);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// GET /api/sensors/range?start=...&end=...
router.get('/range', async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      res.status(400).json({ error: 'start and end query params required' });
      return;
    }
    const data = await getHistoricalDataRange(start as string, end as string);
    res.json(data);
  } catch (err) {
    console.error('[Sensors] Error fetching range:', err);
    res.status(500).json({ error: 'Failed to fetch range data' });
  }
});

// GET /api/sensors/stats?days=7
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const stats = await getDailyStats(days);
    res.json(stats);
  } catch (err) {
    console.error('[Sensors] Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// POST /api/sensors/buzzer — toggle buzzer
router.post('/buzzer', async (req: Request, res: Response) => {
  try {
    const { value } = req.body;
    const v = value ? 1 : 0;
    const ok = await updatePin(BLYNK_CONFIG.pins.buzzer, v);
    res.json({ success: ok, buzzer: v });
  } catch (err) {
    console.error('[Sensors] Error toggling buzzer:', err);
    res.status(500).json({ error: 'Failed to toggle buzzer' });
  }
});

export default router;
