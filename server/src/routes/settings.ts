import { Router } from 'express';
import { Settings } from '../models/Settings';

const router = Router();

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        telegramAlerts: { critical: true, warning: false, info: false }
      });
    }
    res.json(settings);
  } catch (error) {
    console.error('[API] Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/settings
router.put('/', async (req, res) => {
  try {
    const { telegramAlerts } = req.body;
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings({ telegramAlerts });
    } else {
      if (telegramAlerts) settings.telegramAlerts = telegramAlerts;
    }
    
    await settings.save();
    res.json({ success: true, settings });
  } catch (error) {
    console.error('[API] Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
