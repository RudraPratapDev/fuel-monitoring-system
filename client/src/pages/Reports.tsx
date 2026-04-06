import { useState, useEffect } from 'react';
import { FileText, Download, Trash2, Server, Activity, FileArchive, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import type { ReportRecord } from '../types';

export default function Reports() {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    type: 'daily',
    format: 'pdf',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const loadReports = async () => {
    try {
      const data = await api.getReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports', err);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.generateReport(generateForm.type, generateForm.startDate, generateForm.endDate, generateForm.format);
      await loadReports();
    } catch (err) {
      console.error('Failed to generate report', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this historical F.A.S.T. report?')) return;
    try {
      await api.deleteReport(id);
      await loadReports();
    } catch (err) {
      console.error('Failed to delete report', err);
    }
  };

  return (
    <div className="dashboard-grid">
      
      {/* OVERVIEW HEADER */}
      <div className="card col-12" style={{ padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
           <FileText size={18} color="var(--accent-primary)" />
           <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>F.A.S.T. Reporting Engine</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '800px', lineHeight: 1.5, marginBottom: 0 }}>
          Fuel Analytics &amp; Security Tracking framework. Generate comprehensive, legally-compliant security digests, incident breakdowns, and long-term fluid conservation auditing.
        </p>
      </div>

      {/* GENERATE CARD */}
      <div className="card col-12" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
           <div style={{ padding: '6px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '6px' }}>
              <Server size={16} color="var(--accent-primary)" />
           </div>
           <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Create Analytics Protocol</h2>
        </div>
        
        <form onSubmit={handleGenerate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' }}>Report Framework</label>
            <select 
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-strong)', background: 'rgba(15, 23, 42, 0.6)', color: 'var(--text-primary)', fontSize: '0.875rem', transition: 'all 0.2s', outline: 'none' }}
              value={generateForm.type}
              onChange={(e) => setGenerateForm(prev => ({ ...prev, type: e.target.value }))}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'}
            >
              <option value="daily">Daily Summary</option>
              <option value="weekly">Weekly Analysis</option>
              <option value="incident">Critical Incident Report</option>
              <option value="audit">Full System Fuel Audit</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' }}>Export Medium</label>
            <select 
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-strong)', background: 'rgba(15, 23, 42, 0.6)', color: 'var(--text-primary)', fontSize: '0.875rem', transition: 'all 0.2s', outline: 'none' }}
              value={generateForm.format}
              onChange={(e) => setGenerateForm(prev => ({ ...prev, format: e.target.value }))}
            >
              <option value="pdf">PDF Encrypted Document</option>
              <option value="csv">CSV Raw Dataset</option>
              <option value="json">JSON API Compatible</option>
            </select>
          </div>

          <div>
             <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' }}>Period Target Start</label>
             <input type="date" value={generateForm.startDate} onChange={(e) => setGenerateForm(prev => ({ ...prev, startDate: e.target.value }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-strong)', background: 'rgba(15, 23, 42, 0.6)', color: 'var(--text-primary)', colorScheme: 'dark' }} />
          </div>

          <div>
             <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' }}>Period Target End</label>
             <input type="date" value={generateForm.endDate} onChange={(e) => setGenerateForm(prev => ({ ...prev, endDate: e.target.value }))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-strong)', background: 'rgba(15, 23, 42, 0.6)', color: 'var(--text-primary)', colorScheme: 'dark' }} />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ height: '36px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 500, boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)' }}>
             {loading ? <Activity size={16} className="spin" /> : <CheckCircle2 size={16} />}
             {loading ? 'Compiling...' : 'Execute Build'}
          </button>
        </form>
      </div>

      {/* REPOSITORY CARD */}
      <div className="card col-12" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
           <FileArchive size={16} color="var(--text-muted)" />
           <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>F.A.S.T. Document Repository</h2>
        </div>

        <div style={{ overflowX: 'auto', marginTop: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-strong)' }}>Document Hierarchy Name</th>
                <th style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-strong)' }}>Classification</th>
                <th style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-strong)' }}>Date Range Enforced</th>
                <th style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-strong)' }}>Compile Timestamp</th>
                <th style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-strong)' }}>Metric Size</th>
                <th style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-strong)', textAlign: 'right' }}>Management</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="hover-highlight" style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'all 0.2s', fontSize: '0.875rem' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={14} color="var(--accent-primary)" />
                    {report.name}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {report.type}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{report.dateRange}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{new Date(report.generatedAt).toLocaleString()}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{report.size}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <a href={api.getReportDownloadUrl(report.id)} download style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none', background: 'rgba(56, 189, 248, 0.1)', padding: '6px 12px', borderRadius: '20px', transition: 'all 0.2s' }}>
                        <Download size={14} /> Fetch File
                      </a>
                      <button className="icon-btn" style={{ color: 'var(--text-muted)', '&:hover': { color: 'var(--status-danger)' } } as any} onClick={() => handleDelete(report.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '32px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                      <FileArchive size={32} opacity={0.3} />
                      <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>No historical documents exist in the primary repository.</div>
                      <div style={{ fontSize: '0.75rem' }}>Configure targets above and execute build to compile logs.</div>
                    </div>
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
