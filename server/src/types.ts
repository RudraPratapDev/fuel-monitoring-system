// ─── Fuel Sentinel — Type Definitions ────────────────────────────────

export interface SensorData {
  fuelLevel: number;       // V0: 0-100 (%)
  flowRate: number;        // V1: 0-100 (L/min)
  turbidity: number;       // V2: 0-100 (NTU)
  reedSwitch: number;      // V3: 0 (closed) | 1 (open)
  vibration: number;       // V4: 0 (none) | 1 (detected)
  buzzer: number;          // V5: 0 (off) | 1 (on)
  lcdDisplay: string;      // V6: string message
  systemState: number;     // V7: 0-100
  timestamp: string;
}

export type SystemStatus =
  | 'NORMAL'
  | 'FUEL_THEFT'
  | 'SILENT_LEAK'
  | 'TANK_OPEN'
  | 'TAMPERING'
  | 'ADULTERATION'
  | 'CRITICAL';

export interface Alert {
  id: string;
  timestamp: string;
  severity: 'critical' | 'warning' | 'info';
  source: string;
  message: string;
  status: SystemStatus;
  acknowledged: boolean;
}

export interface ThreatAssessment {
  status: SystemStatus;
  label: string;
  description: string;
  severity: 'critical' | 'warning' | 'info' | 'safe';
  conditions: {
    fuelDropping: boolean;
    flowActive: boolean;
    tankOpen: boolean;
    vibrationDetected: boolean;
    turbidityHigh: boolean;
  };
}

export interface HistoricalDataPoint {
  id?: number;
  timestamp: string;
  fuelLevel: number;
  flowRate: number;
  turbidity: number;
  reedSwitch: number;
  vibration: number;
  systemStatus: string;
}

export interface ReportConfig {
  type: 'daily' | 'weekly' | 'incident' | 'audit';
  startDate: string;
  endDate: string;
  sections: string[];
  format: 'pdf' | 'csv' | 'json';
}

export interface ReportRecord {
  id: string;
  name: string;
  type: string;
  dateRange: string;
  generatedAt: string;
  size: string;
  filePath: string;
}

export const BLYNK_CONFIG = {
  token: 'dgRTmKdoTEgI8TMVHqlfXs8RpAYuyERA',
  baseUrl: 'https://blynk.cloud/external/api',
  pins: {
    fuelLevel: 'V0',
    flowRate: 'V1',
    turbidity: 'V2',
    reedSwitch: 'V3',
    vibration: 'V4',
    buzzer: 'V5',
    lcdDisplay: 'V6',
    systemState: 'V7',
  },
} as const;
