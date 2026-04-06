import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { DailyStat } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BarChart2 } from 'lucide-react';

export default function Analytics() {
  const [stats, setStats] = useState<DailyStat[]>([]);

  useEffect(() => {
    api.getDailyStats(7).then(data => setStats(data)).catch(console.error);
  }, []);

  return (
    <div className="dashboard-grid">
      <div className="card col-12">
        <div className="card-title flex items-center gap-2">
          <BarChart2 size={16} /> CONSUMPTION STATISTICS (LAST 7 DAYS)
        </div>
        
        <div style={{ height: '300px', width: '100%', marginTop: '20px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[...stats].reverse()} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Bar dataKey="avgFuelLevel" name="Avg Fuel Level (%)" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="card col-12">
         <div className="card-title">Daily Data Breakdown</div>
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
              {stats.map((stat, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{stat.date}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{stat.readings}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{stat.avgFuelLevel}%</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{stat.avgFlowRate}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{stat.avgTurbidity} NTU</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: stat.anomalies > 0 ? 'var(--status-danger)' : 'var(--status-success)' }}>
                    {stat.anomalies}
                  </td>
                </tr>
              ))}
            </tbody>
         </table>
      </div>
    </div>
  );
}
