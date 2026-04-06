export type SystemStatus =
  | 'NORMAL'
  | 'FUEL_THEFT'
  | 'SILENT_LEAK'
  | 'TANK_OPEN'
  | 'TAMPERING'
  | 'ADULTERATION'
  | 'CRITICAL';

export interface SensorData {
  fuelLevel: number;
  flowRate: number;
  turbidity: number;
  reedSwitch: number;
  vibration: number;
  buzzer: number;
  lcdDisplay: string;
  systemState: number;
  timestamp: string;
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

export interface Alert {
  id: string;
  timestamp: string;
  severity: 'critical' | 'warning' | 'info';
  source: string;
  message: string;
  status: SystemStatus;
  acknowledged: boolean;
}

export interface HistoricalDataPoint {
  timestamp: string;
  fuelLevel: number;
  flowRate: number;
  turbidity: number;
  reedSwitch: number;
  vibration: number;
  systemStatus: string;
}

export interface ReportRecord {
  id: string;
  name: string;
  type: string;
  dateRange: string;
  generatedAt: string;
  size: string;
  format: string;
}

export interface DailyStat {
  date: string;
  readings: number;
  avgFuelLevel: number;
  minFuelLevel: number;
  maxFuelLevel: number;
  avgFlowRate: number;
  avgTurbidity: number;
  anomalies: number;
}
