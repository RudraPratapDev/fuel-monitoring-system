import { useData } from '../context/DataContext';
import { Activity, Droplet, ArrowRightLeft, ShieldCheck, ShieldAlert } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Overview() {
  const { sensor, threat } = useData();

  // Safe fallback while loading
  if (!sensor) {
    return <div className="p-8 text-center text-gray-500">Connecting to telemetry stream...</div>;
  }

  // Determine threat colors
  let statusColor = 'var(--status-success)';
  if (threat?.severity === 'warning') statusColor = 'var(--status-warning)';
  if (threat?.severity === 'critical') statusColor = 'var(--status-danger)';

  // Static mock data for the 24h chart if API history is not immediately loaded
  const chartData = [
    { time: '00:00', value: 85 },
    { time: '04:00', value: 83 },
    { time: '08:00', value: 80 },
    { time: '12:00', value: 78 },
    { time: '16:00', value: 76 },
    { time: '20:00', value: 74 },
    { time: 'Now', value: sensor.fuelLevel },
  ];

  return (
    <div className="dashboard-grid">
      {/* ── ROW 1: Metrics ── */}
      <div className="card col-3">
        <div className="card-title flex items-center justify-between">
          <span>Fuel Level</span>
          <Droplet size={16} />
        </div>
        <div className="metric-value">{sensor.fuelLevel.toFixed(1)}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>%</span></div>
        <div className="mt-4 w-full bg-gray-700 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
          <div className="h-full rounded-full" style={{ width: `${sensor.fuelLevel}%`, backgroundColor: 'var(--accent-primary)' }}></div>
        </div>
      </div>

      <div className="card col-3">
        <div className="card-title flex items-center justify-between">
          <span>Flow Rate</span>
          <ArrowRightLeft size={16} />
        </div>
        <div className="metric-value">{sensor.flowRate.toFixed(1)}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}> L/m</span></div>
        <div className="mt-4 w-full bg-gray-700 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, (sensor.flowRate / 50) * 100)}%`, backgroundColor: 'var(--status-success)' }}></div>
        </div>
      </div>

      <div className="card col-3">
        <div className="card-title flex items-center justify-between">
          <span>Fuel Quality</span>
          <Activity size={16} />
        </div>
        <div className="metric-value tabular-data">{sensor.turbidity.toFixed(1)}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}> NTU</span></div>
        <div className="mt-4">
          <span className="status-badge" style={{ borderColor: sensor.turbidity > 70 ? 'var(--status-danger)' : 'var(--status-success)', color: sensor.turbidity > 70 ? 'var(--status-danger)' : 'var(--status-success)' }}>
            <span className="status-dot" style={{ backgroundColor: sensor.turbidity > 70 ? 'var(--status-danger)' : 'var(--status-success)' }}></span>
            {sensor.turbidity > 70 ? 'Contaminated' : 'Clean'}
          </span>
        </div>
      </div>

      <div className="card col-3" style={{ borderLeft: `4px solid ${statusColor}` }}>
        <div className="card-title flex items-center justify-between">
          <span>System Threat Assessment</span>
          {threat?.severity === 'safe' ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
        </div>
        <div className="metric-value" style={{ fontSize: '1.25rem', color: statusColor, marginBottom: '0.5rem' }}>
          {threat?.label || 'NORMAL'}
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {threat?.description || 'All systems operating within acceptable parameters.'}
        </p>
      </div>

      {/* ── ROW 2: Charts & Security ── */}
      <div className="card col-8">
        <div className="card-title">Fuel Level Trend (Last 24h)</div>
        <div style={{ height: '300px', width: '100%', marginTop: '20px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Area type="monotone" dataKey="value" stroke="var(--accent-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card col-4">
        <div className="card-title">Physical Security Status</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Tank Lid (Reed Switch)</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Main access port</div>
            </div>
            <span className="status-badge" style={{ borderColor: sensor.reedSwitch === 0 ? 'var(--status-success)' : 'var(--status-danger)', color: sensor.reedSwitch === 0 ? 'var(--status-success)' : 'var(--status-danger)' }}>
              <span className="status-dot" style={{ backgroundColor: sensor.reedSwitch === 0 ? 'var(--status-success)' : 'var(--status-danger)' }}></span>
              {sensor.reedSwitch === 0 ? 'Secured' : 'Opened'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Vibration Sensor</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Tamper detection</div>
            </div>
            <span className="status-badge" style={{ borderColor: sensor.vibration === 0 ? 'var(--status-success)' : 'var(--status-warning)', color: sensor.vibration === 0 ? 'var(--status-success)' : 'var(--status-warning)' }}>
              <span className="status-dot" style={{ backgroundColor: sensor.vibration === 0 ? 'var(--status-success)' : 'var(--status-warning)' }}></span>
              {sensor.vibration === 0 ? 'None' : 'Detected'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Alarm Buzzer</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Local audible alert</div>
            </div>
            <span className="status-badge" style={{ borderColor: sensor.buzzer === 1 ? 'var(--status-danger)' : 'var(--text-muted)', color: sensor.buzzer === 1 ? 'var(--status-danger)' : 'var(--text-muted)' }}>
              <span className="status-dot" style={{ backgroundColor: sensor.buzzer === 1 ? 'var(--status-danger)' : 'var(--text-muted)' }}></span>
              {sensor.buzzer === 1 ? 'Active' : 'Off'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
