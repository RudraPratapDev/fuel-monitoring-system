import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Settings as SettingsIcon, Save, Send } from 'lucide-react';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alerts, setAlerts] = useState({
    critical: true,
    warning: false,
    info: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setAlerts(data.telegramAlerts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateSettings({ telegramAlerts: alerts });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
      alert('Settings saved successfully.');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="dashboard-grid">
      <div className="card col-12">
        <div className="card-title flex items-center gap-2">
          <SettingsIcon size={16} /> SYSTEM CONFIGURATION
        </div>
        
        <div style={{ marginTop: '24px', maxWidth: '600px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={18} /> Telegram Dispatcher Routing
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.875rem' }}>
            Configure which alert severity levels are pushed to your registered Telegram device. Avoid enabling non-critical alerts to prevent excessive noise.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', border: '1px solid var(--border-strong)', borderRadius: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={alerts.critical} 
                onChange={(e) => setAlerts(prev => ({ ...prev, critical: e.target.checked }))}
                style={{ width: '20px', height: '20px', marginTop: '2px', accentColor: 'var(--text-primary)' }}
              />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--status-danger)' }}>Critical Events</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Fuel theft, lid breaches, rapid unapproved drain detected.</div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', border: '1px solid var(--border-subtle)', borderRadius: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={alerts.warning} 
                onChange={(e) => setAlerts(prev => ({ ...prev, warning: e.target.checked }))}
                style={{ width: '20px', height: '20px', marginTop: '2px', accentColor: 'var(--text-primary)' }}
              />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--status-warning)' }}>Warning Anomalies</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Slow silent leaks, minor vibration anomalies.</div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', border: '1px solid var(--border-subtle)', borderRadius: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={alerts.info} 
                onChange={(e) => setAlerts(prev => ({ ...prev, info: e.target.checked }))}
                style={{ width: '20px', height: '20px', marginTop: '2px', accentColor: 'var(--text-primary)' }}
              />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--status-info)' }}>General Logs & Info</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Standard scheduled polls and parameter shifts. Not recommended.</div>
              </div>
            </label>

          </div>

          <button 
            type="button" 
            className="btn-primary" 
            onClick={handleSave} 
            disabled={saving}
            style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={16} /> {saving ? 'Saving Config...' : 'Apply Configurations'}
          </button>
        </div>
      </div>
    </div>
  );
}
