// ─── Fuel Sentinel — Main Server Entry ──────────────────────────────

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import mongoose from 'mongoose';

import sensorRoutes from './routes/sensors';
import alertRoutes from './routes/alerts';
import reportRoutes from './routes/reports';
import settingsRoutes from './routes/settings';

import { fetchAllSensorData } from './services/blynk';
import { insertSensorData } from './services/dataStore';
import { assessThreat } from './services/alertEngine';

const PORT = parseInt(process.env.PORT || '3001', 10);
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fuel-sentinel';
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL_MS || '5000', 10);

// ── Express Setup ──
const app = express();
app.use(cors());
app.use(express.json());

// ── Routes ──
app.use('/api/sensors', sensorRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// ── HTTP + WebSocket Server ──
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`[WS] Client connected (${clients.size} total)`);
  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[WS] Client disconnected (${clients.size} total)`);
  });
});

function broadcast(data: object): void {
  const payload = JSON.stringify(data);
  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

// ── Polling Loop: Blynk → Assess → Store → Broadcast ──
let pollTimer: ReturnType<typeof setInterval>;

async function pollSensors(): Promise<void> {
  try {
    // Check global settings before polling exactly to save Blynk API limits
    const { Settings } = await import('./models/Settings');
    const config = await Settings.findOne();
    if (config && config.blynkPolling === false) {
      // Skipping poll to save tokens
      return;
    }

    const sensorData = await fetchAllSensorData();
    const threat = assessThreat(sensorData);

    // Store in MongoDB
    await insertSensorData({
      timestamp: sensorData.timestamp,
      fuelLevel: sensorData.fuelLevel,
      flowRate: sensorData.flowRate,
      turbidity: sensorData.turbidity,
      reedSwitch: sensorData.reedSwitch,
      vibration: sensorData.vibration,
      systemStatus: threat.status,
    });

    // Broadcast to WebSocket clients
    broadcast({ type: 'sensor_update', sensor: sensorData, threat });
  } catch (err) {
    console.error('[Poll] Error in sensor polling loop:', err);
  }
}

// ── Start ──
async function main(): Promise<void> {
  console.log('[Server] Connecting to MongoDB...');
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`[Server] MongoDB connected: ${MONGO_URI}`);
  } catch (err) {
    console.error('[Server] MongoDB connection failed:', err);
    console.log('[Server] Starting without database — data will not be persisted');
  }

  server.listen(PORT, () => {
    console.log(`[Server] Fuel Sentinel API running on http://localhost:${PORT}`);
    console.log(`[Server] WebSocket on ws://localhost:${PORT}/ws`);
    console.log(`[Server] Polling Blynk every ${POLL_INTERVAL}ms`);
  });

  // Start polling
  pollTimer = setInterval(pollSensors, POLL_INTERVAL);
  // Initial poll
  pollSensors();
}

main().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n[Server] Shutting down...');
  clearInterval(pollTimer);
  await mongoose.disconnect();
  server.close();
  process.exit(0);
});
