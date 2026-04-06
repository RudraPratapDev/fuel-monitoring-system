import { useData } from '../context/DataContext';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

export default function Security() {
  const { sensor } = useData();

  if (!sensor) {
    return <div className="p-8 text-center text-gray-500">Waiting for security sensors...</div>;
  }

  return (
    <div className="dashboard-grid">
      <div className="card col-6">
        <div className="card-title">Tank Lid Access (Reed Switch)</div>
        <div style={{ padding: '24px', textAlign: 'center', backgroundColor: 'var(--bg-hover)', borderRadius: '8px', border: `1px solid ${sensor.reedSwitch === 0 ? 'var(--status-success)' : 'var(--status-danger)'}` }}>
           {sensor.reedSwitch === 0 ? <ShieldCheck size={48} color="var(--status-success)" style={{ margin: '0 auto' }} /> : <ShieldAlert size={48} color="var(--status-danger)" style={{ margin: '0 auto' }} />}
           <div className="metric-value" style={{ marginTop: '16px', color: sensor.reedSwitch === 0 ? 'var(--status-success)' : 'var(--status-danger)' }}>
             {sensor.reedSwitch === 0 ? 'LID SECURED' : 'LID OPEN'}
           </div>
           <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
             The structural access point to the fuel system is currently {sensor.reedSwitch === 0 ? 'closed and secure' : 'open. Unauthorized access may be occurring'}.
           </p>
        </div>
      </div>

      <div className="card col-6">
        <div className="card-title">Vibration & Tampering</div>
        <div style={{ padding: '24px', textAlign: 'center', backgroundColor: 'var(--bg-hover)', borderRadius: '8px', border: `1px solid ${sensor.vibration === 0 ? 'var(--status-success)' : 'var(--status-warning)'}` }}>
           {sensor.vibration === 0 ? <ShieldCheck size={48} color="var(--status-success)" style={{ margin: '0 auto' }} /> : <ShieldAlert size={48} color="var(--status-warning)" style={{ margin: '0 auto' }} />}
           <div className="metric-value" style={{ marginTop: '16px', color: sensor.vibration === 0 ? 'var(--status-success)' : 'var(--status-warning)' }}>
             {sensor.vibration === 0 ? 'NO TAMPERING DETECTED' : 'VIBRATION DETECTED'}
           </div>
           <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
             The physical vibration monitor shows {sensor.vibration === 0 ? 'no signs of drilling, cutting, or forced entry' : 'active signs of physical disturbance'}.
           </p>
        </div>
      </div>
      
      <div className="card col-12">
        <div className="card-title">MULTI-SENSOR THREAT MATRIX</div>
        <div style={{ overflowX: 'auto', marginTop: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-strong)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <th style={{ padding: '12px 16px' }}>Scenario</th>
                <th style={{ padding: '12px 16px' }}>Fuel Level</th>
                <th style={{ padding: '12px 16px' }}>Flow Rate</th>
                <th style={{ padding: '12px 16px' }}>Reed Switch</th>
                <th style={{ padding: '12px 16px' }}>Vibration</th>
                <th style={{ padding: '12px 16px' }}>Turbidity</th>
                <th style={{ padding: '12px 16px' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>Normal Operation</td>
                <td style={{ padding: '12px 16px' }}>Stable</td>
                <td style={{ padding: '12px 16px' }}>{'>'} 0</td>
                <td style={{ padding: '12px 16px' }}>Closed</td>
                <td style={{ padding: '12px 16px' }}>None</td>
                <td style={{ padding: '12px 16px' }}>Normal</td>
                <td style={{ padding: '12px 16px', color: 'var(--status-success)', fontWeight: 'bold' }}>SAFE</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>Fuel Theft</td>
                <td style={{ padding: '12px 16px', color: 'var(--status-danger)' }}>Dropping</td>
                <td style={{ padding: '12px 16px', color: 'var(--status-danger)' }}>0</td>
                <td style={{ padding: '12px 16px', color: 'var(--status-danger)' }}>Open</td>
                <td style={{ padding: '12px 16px', color: 'var(--status-danger)' }}>Detected</td>
                <td style={{ padding: '12px 16px' }}>Any</td>
                <td style={{ padding: '12px 16px', color: 'var(--status-danger)', fontWeight: 'bold' }}>CRITICAL</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>Silent Leak</td>
                <td style={{ padding: '12px 16px', color: 'var(--status-warning)' }}>Dropping</td>
                <td style={{ padding: '12px 16px' }}>0</td>
                <td style={{ padding: '12px 16px' }}>Closed</td>
                <td style={{ padding: '12px 16px' }}>None</td>
                <td style={{ padding: '12px 16px' }}>Any</td>
                <td style={{ padding: '12px 16px', color: 'var(--status-warning)', fontWeight: 'bold' }}>WARNING</td>
              </tr>
              <tr>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>Adulteration</td>
                <td style={{ padding: '12px 16px' }}>Any</td>
                <td style={{ padding: '12px 16px' }}>Any</td>
                <td style={{ padding: '12px 16px' }}>Any</td>
                <td style={{ padding: '12px 16px' }}>Any</td>
                <td style={{ padding: '12px 16px', color: 'var(--status-danger)' }}>High</td>
                <td style={{ padding: '12px 16px', color: 'var(--status-danger)', fontWeight: 'bold' }}>ALERT</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
