import { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { SensorData, ThreatAssessment } from '../types';

interface RealtimeData {
  sensor: SensorData | null;
  threat: ThreatAssessment | null;
  isConnected: boolean;
  lastUpdated: Date | null;
  rollingHistory: any[];
}

const DataContext = createContext<RealtimeData | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<RealtimeData>({
    sensor: null,
    threat: null,
    isConnected: false,
    lastUpdated: null,
    rollingHistory: [],
  });

  const lastApiFuelLevelRef = useRef<number | null>(null);
  const currentFuelLevelRef = useRef<number>(0);
  const currentFlowRateRef = useRef<number>(0);
  const currentTurbidityRef = useRef<number>(0);
  const currentStatusRef = useRef<string>('NORMAL');

  const historyPointsRef = useRef<any[]>([]);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: number;

    const connect = () => {
      const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws';
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        setData((prev) => ({ ...prev, isConnected: true }));
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'sensor_update') {
            // Map 0-400 to 0-100%
            const rawFuelLevel = typeof payload.sensor.fuelLevel === 'number' ? payload.sensor.fuelLevel : 0;
            const mappedApiFuelLevel = Math.max(0, Math.min(100, rawFuelLevel / 4)) || 0;
            
            // If API sends a different value, snap to it. 
            // If it's the "still" value, we keep our current locally decreased value.
            if (lastApiFuelLevelRef.current !== mappedApiFuelLevel) {
              lastApiFuelLevelRef.current = mappedApiFuelLevel;
              currentFuelLevelRef.current = mappedApiFuelLevel;
            }
            
            currentFlowRateRef.current = payload.sensor.flowRate || 0;
            currentTurbidityRef.current = payload.sensor.turbidity || 0;
            currentStatusRef.current = payload.threat?.status || 'NORMAL';

            const newSensor = {
              ...payload.sensor,
              // Overwrite with locally tracked fuel level (mapped or decremented)
              fuelLevel: currentFuelLevelRef.current
            };

            setData((prev) => ({
              ...prev,
              sensor: newSensor,
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

  // Interval for reducing fuel level when API value is still and flow is > 0
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentFlowRateRef.current > 0 && currentFuelLevelRef.current > 0) {
        // Decrease by flowRate / 100 % per sec (e.g. flow of 3 = 0.03/sec)
        // For 100ms interval (10x per sec), reduction per tick is flowRate / 1000
        const decrement = currentFlowRateRef.current / 1000;
        
        const newFuelLevel = Math.max(0, currentFuelLevelRef.current - decrement);
        
        if (newFuelLevel !== currentFuelLevelRef.current) {
          currentFuelLevelRef.current = newFuelLevel;
          setData((prev) => {
            if (!prev.sensor) return prev;
            return {
              ...prev,
              sensor: { ...prev.sensor, fuelLevel: newFuelLevel }
            };
          });
        }
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  // Interval for capturing rolling history every 2 seconds
  useEffect(() => {
    const historyInterval = setInterval(() => {
      // Do not push artificial zero points before the first connection payload
      if (lastApiFuelLevelRef.current !== null) {
        const now = new Date();
        const stat = currentStatusRef.current;
        const isTheft = stat === 'FUEL_THEFT' || stat === 'ACTIVE_BREACH' || stat === 'FORCED_EXTRACTION';

        const point = {
          timeString: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          mappedFuelLevel: currentFuelLevelRef.current || 0,
          flowRate: currentFlowRateRef.current || 0,
          turbidity: currentTurbidityRef.current || 0,
          systemStatus: stat,
          isTheft
        };

        historyPointsRef.current = [...historyPointsRef.current, point];
        
        // Keep last 300 points (approx 10 minutes at 2s interval)
        if (historyPointsRef.current.length > 300) {
          historyPointsRef.current.shift();
        }

        setData((prev) => ({
          ...prev,
          rollingHistory: [...historyPointsRef.current]
        }));
      }
    }, 2000);

    return () => clearInterval(historyInterval);
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
