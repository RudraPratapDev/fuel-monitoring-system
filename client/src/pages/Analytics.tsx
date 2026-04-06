import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { DailyStat } from '../types';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { Activity, LayoutGrid, Droplet, ArrowRightLeft } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Analytics() {
  const [stats, setStats] = useState<DailyStat[]>([]);
  const { rollingHistory } = useData();

  useEffect(() => {
    api.getDailyStats(7).then(data => setStats(data)).catch(console.error);
    // We are now fetching the live 10-minute simulation rolling data array from DataContext
    // instead of historical API data, to instantly render our local simulation calculations 
  }, []);

  const displayHistory = rollingHistory || [];

  return (
    <div className="dashboard-grid">
      {/* ── ROW 1: Principal Fuel Level Chart ── */}
      <div className="card col-12">
        <div className="card-title flex items-center gap-2">
          <Droplet size={18} /> LIVE FUEL LEVEL SIMULATION TREND & INCIDENTS (ROLLING 10 MINS)
        </div>
        
        <div style={{ height: '300px', width: '100%', marginTop: '24px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayHistory} syncId="telemetry" margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--border-subtle)" vertical={false} />
              
              <XAxis dataKey="timeString" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickMargin={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} domain={[0, 100]} />
              
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', border: '1px solid var(--border-strong)', borderRadius: '12px', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', color: 'white' }}
                itemStyle={{ fontWeight: 500 }}
              />
              
              <Area type="monotone" dataKey="mappedFuelLevel" name="Fuel Level (%)" stroke="var(--accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorFuel)" />
              
              {displayHistory.map((point: any, index: number) => {
                if (point.isTheft && (index === 0 || !displayHistory[index-1].isTheft)) {
                  return (
                    <ReferenceLine key={`theft-${index}`} x={point.timeString} stroke="var(--status-danger)" strokeWidth={2} strokeDasharray="5 5" label={{ position: 'insideTopLeft', value: 'THEFT DETECTED', fill: 'var(--status-danger)', fontSize: 11, fontWeight: 700 }} />
                  );
                }
                return null;
              })}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── ROW 2: Flow Rate and Turbidity Side-by-side ── */}
      <div className="card col-6">
        <div className="card-title flex items-center gap-2">
          <ArrowRightLeft size={18} /> LIVE FLOW RATE
        </div>
        <div style={{ height: '220px', width: '100%', marginTop: '24px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayHistory} syncId="telemetry" margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFlowArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--status-success)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--status-success)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="timeString" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickMargin={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', border: '1px solid var(--border-strong)', borderRadius: '12px', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', color: 'white' }} itemStyle={{ fontWeight: 500 }} />
              <Area type="monotone" dataKey="flowRate" name="Flow Rate (L/m)" stroke="var(--status-success)" strokeWidth={2} fill="url(#colorFlowArea)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card col-6">
        <div className="card-title flex items-center gap-2">
          <Activity size={18} /> LIVE TURBIDITY
        </div>
        <div style={{ height: '220px', width: '100%', marginTop: '24px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayHistory} syncId="telemetry" margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="timeString" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickMargin={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', border: '1px solid var(--border-strong)', borderRadius: '12px', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', color: 'white' }} itemStyle={{ fontWeight: 500 }} />
              <Line type="stepAfter" dataKey="turbidity" name="Turbidity (NTU)" stroke="var(--status-warning)" strokeWidth={2} dot={false} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* ── ROW 3: Daily Table ── */}
      <div className="card col-12">
         <div className="card-title flex items-center gap-2">
            <LayoutGrid size={16} /> Daily Data Breakdown
         </div>
         <div style={{ overflowX: 'auto' }}>
           <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '16px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-strong)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px' }}>Readings</th>
                  <th style={{ padding: '12px 16px' }}>Avg Fuel %</th>
                  <th style={{ padding: '12px 16px' }}>Avg Flow (L/m)</th>
                  <th style={{ padding: '12px 16px' }}>Avg Turbidity</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Anomalies</th>
                </tr>
              </thead>
              <tbody>
                {stats.length > 0 ? stats.map((stat, i) => (
                  <tr key={i} className="hover-highlight" style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{stat.date}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{stat.readings}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{stat.avgFuelLevel}%</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{stat.avgFlowRate}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{stat.avgTurbidity} NTU</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: stat.anomalies > 0 ? 'var(--status-danger)' : 'var(--status-success)', fontWeight: 600 }}>
                      {stat.anomalies}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No data entries found yet since the database was cleared.
                    </td>
                  </tr>
                )}
              </tbody>
           </table>
         </div>
      </div>
    </div>
  );
}
