import { useData } from '../context/DataContext';
import './LiveAnimation.css';
import { Activity } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function LiveAnimation() {
  const { sensor, isConnected } = useData();

  // Fallback defaults or mock data if not connected
  // Realistic values: fuelLevel 0-100, flowRate 0-100, reedSwitch 0/1 (0=open, 1=closed), vibration 0/1, turbidity 0-100
  const fuelLevel = sensor?.fuelLevel ?? 85; 
  const flowRate = sensor?.flowRate ?? 0;
  const reedSwitch = sensor?.reedSwitch ?? 0; 
  const vibration = sensor?.vibration ?? 0;
  const turbidity = sensor?.turbidity ?? 10;
  
  // Logic reversed: 1 means lid is open, 0 means lid is closed.
  const isLidOpen = reedSwitch === 1;
  const isVibrating = vibration > 0;
  const isFlowing = flowRate > 0;
  
  // Refueling & Anomaly simulation
  const [isRefueling, setIsRefueling] = useState(false);
  const [isSuspiciousFill, setIsSuspiciousFill] = useState(false);
  const prevFuelRef = useRef(fuelLevel);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (sensor) {
       if (sensor.fuelLevel > prevFuelRef.current + 0.1) { // Buffer to ignore noise
          if (sensor.flowRate > 0) {
            // Fuel increasing while flowRate > 0 (vehicle is moving/engine on)
            setIsSuspiciousFill(true);
            setIsRefueling(false);
          } else {
            // Normal refueling while stopped
            setIsRefueling(true);
            setIsSuspiciousFill(false);
          }
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
             setIsRefueling(false);
             setIsSuspiciousFill(false);
          }, 3000);
       }
       prevFuelRef.current = sensor.fuelLevel;
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [sensor]);
  
  // Smoothly transition fluid color based on turbidity (0 = Blue, 100 = Murky Brown)
  const getFluidColor = (t: number) => {
    const ratio = Math.min(Math.max(t, 0), 100) / 100;
    // Hue: 210 (Blue) -> 30 (Brown)
    const h = 210 - (ratio * 180);
    // Saturation: 90% -> 70%
    const s = 90 - (ratio * 20);
    // Lightness: 60% -> 35%
    const l = 60 - (ratio * 25);
    return `hsl(${h}, ${s}%, ${l}%)`;
  };
  const fluidColor = getFluidColor(turbidity);

  return (
    <div className="animation-page fade-in">
      <div className="animation-header">
        <h2>Live Tank Simulation</h2>
        <p>Real-time visual representation of sensor states</p>
      </div>

      <div className="simulation-container">
        
        {/* Environment / Background Info */}
        <div className="simulation-stats box-panel">
          <h3>Real-time Metrics</h3>
          <div className="stat-grid">
            <div className="stat-box">
              <span className="stat-label">Fuel Level</span>
              <span className="stat-value">{fuelLevel.toFixed(1)}%</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Flow Rate</span>
              <span className="stat-value">{flowRate.toFixed(1)} L/min</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Lid Status</span>
              <span className={`stat-value ${isLidOpen ? 'danger' : 'safe'}`}>
                {isLidOpen ? 'OPEN' : 'SECURE'}
              </span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Turbidity</span>
              <span className="stat-value">{turbidity.toFixed(1)} NTU</span>
            </div>
          </div>
        </div>

        {/* 2D Canvas Area */}
        <div className="canvas-area box-panel">
          
          <div className={`tank-wrapper ${isVibrating ? 'anim-shake' : ''}`}>
            
            {/* Shockwaves if vibrating */}
            {isVibrating && (
              <div className="shockwaves">
                <div className="shockwave sw-1"></div>
                <div className="shockwave sw-2"></div>
              </div>
            )}

            {/* System Status Indicators above tank */}
            <div className="tank-status-indicators">
              {isSuspiciousFill && <span className="badge danger anim-pulse">UNAUTHORIZED FILL (MOVING)</span>}
              {isRefueling && <span className="badge safe anim-pulse">ACTIVE REFUELING</span>}
              {isVibrating && <span className="badge danger anim-pulse"><Activity size={14}/> Vibration</span>}
              {!isConnected && <span className="badge warning anim-pulse">Disconnected</span>}
            </div>

            {/* The Tank */}
            <div className="tank">
              
              {/* Optional Refuel Hose that drops in */}
              <div className={`refuel-hose ${isRefueling ? 'hose-active' : ''}`}>
                 <div className="hose-nozzle"></div>
                 {isRefueling && <div className="refuel-drops"></div>}
              </div>
              
              {/* Lid */}
              <div className={`tank-lid ${isLidOpen ? 'lid-open' : ''}`}>
                <div className="lid-handle"></div>
                <div className="reed-sensor">
                  <div className={`sensor-light ${isLidOpen ? 'red' : 'green'}`}></div>
                </div>
              </div>
              
              {/* Tank Body */}
              <div className="tank-body">
                {/* Level Marks */}
                <div className="level-marks">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>

                {/* Liquid Area */}
                <div className="liquid-container">
                  <div 
                    className={`liquid ${isFlowing ? 'liquid-flowing' : ''} ${isVibrating ? 'liquid-vibrating' : ''}`}
                    style={{ 
                      height: `${fuelLevel}%`,
                      backgroundColor: fluidColor 
                    }}
                  >
                    {/* Bubbles if flowing */}
                    {isFlowing && (
                      <>
                        <div className="bubble b1"></div>
                        <div className="bubble b2"></div>
                        <div className="bubble b3"></div>
                      </>
                    )}
                    <div className="liquid-surface"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Outlet Pipe */}
            <div className="tank-outlet">
              <div className="pipe">
                {/* Flow Animation */}
                <div className={`pipe-flow ${isFlowing ? 'flow-active' : ''}`} style={{ backgroundColor: fluidColor }}>
                   {isFlowing && <div className="flow-lines"></div>}
                </div>
              </div>
              <div className="valve">
                <div className={`valve-handle ${isFlowing ? 'valve-open' : ''}`}></div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
