import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Alert } from '../types';
import { ShieldAlert, Info, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<string>('all');
  
  const loadAlerts = async () => {
    try {
      const data = await api.getAlerts(filter === 'all' ? undefined : filter);
      setAlerts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAlerts();
    // Poll for alerts every 5 seconds
    const timer = setInterval(loadAlerts, 5000);
    return () => clearInterval(timer);
  }, [filter]);

  const handleAcknowledge = async (id: string) => {
    await api.acknowledgeAlert(id);
    loadAlerts();
  };

  const handleClearAll = async () => {
    if (window.confirm("Clear all alerts?")) {
      await api.clearAlerts();
      loadAlerts();
    }
  };

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <ShieldAlert size={16} style={{ color: 'var(--status-danger)' }} />;
      case 'warning': return <AlertTriangle size={16} style={{ color: 'var(--status-warning)' }} />;
      default: return <Info size={16} style={{ color: 'var(--status-info)' }} />;
    }
  };

  return (
    <div className="dashboard-grid">
      <div className="card col-12 flex justify-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className={`btn-outline ${filter === 'all' ? 'active' : ''}`} style={filter === 'all' ? { backgroundColor: 'var(--bg-hover)' } : {}} onClick={() => setFilter('all')}>All Alerts</button>
          <button className={`btn-outline ${filter === 'critical' ? 'active' : ''}`} style={{ borderColor: 'var(--status-danger)', color: filter === 'critical' ? 'var(--status-danger)' : undefined }} onClick={() => setFilter('critical')}>Critical</button>
          <button className={`btn-outline ${filter === 'warning' ? 'active' : ''}`} style={{ borderColor: 'var(--status-warning)', color: filter === 'warning' ? 'var(--status-warning)' : undefined }} onClick={() => setFilter('warning')}>Warnings</button>
        </div>
        <button className="btn-outline" style={{ color: 'var(--status-danger)', borderColor: 'var(--status-danger)' }} onClick={handleClearAll}>
          <Trash2 size={16} style={{ display: 'inline', marginRight: '8px' }} /> Clear All
        </button>
      </div>

      <div className="card col-12">
        <div className="card-title">ALERT HISTORY LOG</div>
        <div style={{ overflowX: 'auto', marginTop: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-strong)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <th style={{ padding: '12px 16px' }}>Timestamp</th>
                <th style={{ padding: '12px 16px' }}>Severity</th>
                <th style={{ padding: '12px 16px' }}>Source</th>
                <th style={{ padding: '12px 16px' }}>Message</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id} style={{ borderBottom: '1px solid var(--border-subtle)', opacity: alert.acknowledged ? 0.6 : 1 }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                    {new Date(alert.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getIcon(alert.severity)}
                      <span style={{ textTransform: 'capitalize' }}>{alert.severity}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{alert.source.replace('_', ' ')}</td>
                  <td style={{ padding: '12px 16px' }}>{alert.message}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    {!alert.acknowledged ? (
                      <button className="btn-outline" onClick={() => handleAcknowledge(alert.id)} style={{ padding: '4px 12px', fontSize: '0.75rem' }}>
                        Acknowledge
                      </button>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--status-success)', fontSize: '0.875rem' }}>
                        <CheckCircle size={14} /> Ack'd
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No alerts found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
