// ─── Fuel Sentinel — Alert Engine (Multi-Sensor Conditional Logic) ──────

import { SensorData, SystemStatus, ThreatAssessment, Alert } from '../types';
import { AlertRecord } from '../models/AlertRecord';
import { Settings } from '../models/Settings';
import { sendTelegramAlert } from './telegram';
import { v4Fallback } from '../utils';

const TURBIDITY_THRESHOLD = 70;
const FUEL_DROP_THRESHOLD = 5;

let previousFuelLevel: number | null = null;

// In-memory cache of recent alerts for fast access
let alertCache: Alert[] = [];

export function assessThreat(data: SensorData): ThreatAssessment {
  const fuelDropping =
    previousFuelLevel !== null && previousFuelLevel - data.fuelLevel >= FUEL_DROP_THRESHOLD;
  const flowActive = data.flowRate > 0;
  const tankOpen = data.reedSwitch === 1;
  const vibrationDetected = data.vibration === 1;
  const turbidityHigh = data.turbidity > TURBIDITY_THRESHOLD;

  previousFuelLevel = data.fuelLevel;

  const conditions = { fuelDropping, flowActive, tankOpen, vibrationDetected, turbidityHigh };

  // ── CRITICAL: Multi-indicator theft event ──
  if (fuelDropping && !flowActive && (tankOpen || vibrationDetected)) {
    const assessment: ThreatAssessment = {
      status: 'CRITICAL',
      label: 'Critical Theft Event',
      description:
        'Multiple high-risk indicators: rapid fuel drop with zero flow and physical access/tampering detected.',
      severity: 'critical',
      conditions,
    };
    persistAlert(assessment, data);
    return assessment;
  }

  // ── FUEL THEFT: Dropping + no flow + tank open ──
  if (fuelDropping && !flowActive && tankOpen) {
    const assessment: ThreatAssessment = {
      status: 'FUEL_THEFT',
      label: 'Fuel Theft Detected',
      description: 'Fuel level dropping rapidly with zero flow and unauthorized tank access.',
      severity: 'critical',
      conditions,
    };
    persistAlert(assessment, data);
    return assessment;
  }

  // ── SILENT LEAK: Dropping + no flow + no physical access ──
  if (fuelDropping && !flowActive && !tankOpen && !vibrationDetected) {
    const assessment: ThreatAssessment = {
      status: 'SILENT_LEAK',
      label: 'Possible Silent Leak',
      description:
        'Fuel level decreasing without flow or physical access — possible hidden siphoning or pipeline leak.',
      severity: 'warning',
      conditions,
    };
    persistAlert(assessment, data);
    return assessment;
  }

  // ── TANK OPEN ──
  if (tankOpen && !fuelDropping) {
    const assessment: ThreatAssessment = {
      status: 'TANK_OPEN',
      label: 'Tank Lid Open',
      description: 'Fuel tank lid is open. No fuel level change detected yet.',
      severity: 'warning',
      conditions,
    };
    persistAlert(assessment, data);
    return assessment;
  }

  // ── TAMPERING ──
  if (vibrationDetected && !tankOpen) {
    const assessment: ThreatAssessment = {
      status: 'TAMPERING',
      label: 'Tampering Detected',
      description:
        'Physical disturbance detected without tank access — possible drilling or forced entry attempt.',
      severity: 'warning',
      conditions,
    };
    persistAlert(assessment, data);
    return assessment;
  }

  // ── ADULTERATION ──
  if (turbidityHigh) {
    const assessment: ThreatAssessment = {
      status: 'ADULTERATION',
      label: 'Fuel Contaminated',
      description: `Turbidity reading (${data.turbidity} NTU) exceeds safe threshold of ${TURBIDITY_THRESHOLD}. Possible fuel adulteration.`,
      severity: 'critical',
      conditions,
    };
    persistAlert(assessment, data);
    return assessment;
  }

  // ── NORMAL ──
  return {
    status: 'NORMAL',
    label: 'Normal Operation',
    description: 'All sensors reading within acceptable parameters. System operating normally.',
    severity: 'safe',
    conditions,
  };
}

async function persistAlert(assessment: ThreatAssessment, data: SensorData): Promise<void> {
  const alert: Alert = {
    id: v4Fallback(),
    timestamp: data.timestamp,
    severity: assessment.severity === 'safe' ? 'info' : assessment.severity,
    source: assessment.status,
    message: assessment.description,
    status: assessment.status,
    acknowledged: false,
  };

  // Update in-memory cache
  alertCache.unshift(alert);
  if (alertCache.length > 500) alertCache.pop();

  // Persist to MongoDB (fire and forget)
  try {
    await AlertRecord.create({
      alertId: alert.id,
      timestamp: new Date(alert.timestamp),
      severity: alert.severity,
      source: alert.source,
      message: alert.message,
      status: alert.status,
      acknowledged: false,
    });
    
    // Check telegram settings
    const settings = await Settings.findOne();
    if (settings) {
      const { critical, warning, info } = settings.telegramAlerts;
      if (
        (alert.severity === 'critical' && critical) ||
        (alert.severity === 'warning' && warning) ||
        (alert.severity === 'info' && info)
      ) {
        // Fire and forget
        sendTelegramAlert(alert.source, alert.message, alert.severity as any).catch(console.error);
      }
    }
  } catch (err) {
    console.error('[AlertEngine] Failed to persist alert:', err);
  }
}

export async function getAlerts(
  filter?: { severity?: string },
  limit: number = 100,
  skip: number = 0
): Promise<Alert[]> {
  const query: Record<string, unknown> = {};
  if (filter?.severity) query.severity = filter.severity;

  const docs = await AlertRecord.find(query)
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return docs.map((d) => ({
    id: d.alertId,
    timestamp: d.timestamp.toISOString(),
    severity: d.severity,
    source: d.source,
    message: d.message,
    status: d.status as any,
    acknowledged: d.acknowledged,
  }));
}

export async function acknowledgeAlert(id: string): Promise<boolean> {
  const result = await AlertRecord.updateOne({ alertId: id }, { acknowledged: true });
  // Also update cache
  const cached = alertCache.find((a) => a.id === id);
  if (cached) cached.acknowledged = true;
  return result.modifiedCount > 0;
}

export async function clearAlerts(): Promise<void> {
  await AlertRecord.deleteMany({});
  alertCache = [];
}

export async function getAlertStats() {
  const [total, critical, warning, info, unacknowledged] = await Promise.all([
    AlertRecord.countDocuments(),
    AlertRecord.countDocuments({ severity: 'critical' }),
    AlertRecord.countDocuments({ severity: 'warning' }),
    AlertRecord.countDocuments({ severity: 'info' }),
    AlertRecord.countDocuments({ acknowledged: false }),
  ]);

  return { total, critical, warning, info, unacknowledged };
}
