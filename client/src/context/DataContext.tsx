import { createContext, useContext, useEffect, useState } from 'react';
import type { SensorData, ThreatAssessment } from '../types';

interface RealtimeData {
  sensor: SensorData | null;
  threat: ThreatAssessment | null;
  isConnected: boolean;
  lastUpdated: Date | null;
}

const DataContext = createContext<RealtimeData | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<RealtimeData>({
    sensor: null,
    threat: null,
    isConnected: false,
    lastUpdated: null,
  });

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: number;

    const connect = () => {
      ws = new WebSocket('ws://localhost:3001/ws');

      ws.onopen = () => {
        setData((prev) => ({ ...prev, isConnected: true }));
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'sensor_update') {
            setData((prev) => ({
              ...prev,
              sensor: payload.sensor,
              threat: payload.threat,
              lastUpdated: new Date(),
            }));
          }
        } catch (err) {
          console.error('Failed to parse WS message:', err);
        }
      };

      ws.onclose = () => {
        setData((prev) => ({ ...prev, isConnected: false }));
        // Try to reconnect in 3s
        reconnectTimer = window.setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
      };
    };

    connect();

    return () => {
      window.clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, []);

  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
