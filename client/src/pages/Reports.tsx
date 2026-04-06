import { useState, useEffect } from 'react';
import { FileText, Download, Trash2 } from 'lucide-react';
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
    if (!window.confirm('Delete this report?')) return;
    try {
      await api.deleteReport(id);
      await loadReports();
    } catch (err) {
      console.error('Failed to delete report', err);
    }
  };

  return (
    <div className="dashboard-grid">
      <div className="card col-12">
        <div className="card-title flex items-center gap-2">
          <FileText size={16} /> GENERATE REPORT
        </div>
        
        <form onSubmit={handleGenerate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '16px', alignItems: 'end', marginTop: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Report Type</label>
            <select 
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}
              value={generateForm.type}
              onChange={(e) => setGenerateForm(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="daily">Daily Summary</option>
              <option value="weekly">Weekly Analysis</option>
              <option value="incident">Incident Report</option>
              <option value="audit">Fuel Audit</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Format</label>
            <select 
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}
              value={generateForm.format}
              onChange={(e) => setGenerateForm(prev => ({ ...prev, format: e.target.value }))}
            >
              <option value="pdf">PDF Document</option>
              <option value="csv">CSV Export</option>
              <option value="json">JSON Data</option>
            </select>
          </div>

          <div>
             <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Start Date</label>
             <input type="date" value={generateForm.startDate} onChange={(e) => setGenerateForm(prev => ({ ...prev, startDate: e.target.value }))} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'var(--bg-main)', color: 'var(--text-primary)' }} />
          </div>

          <div>
             <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>End Date</label>
             <input type="date" value={generateForm.endDate} onChange={(e) => setGenerateForm(prev => ({ ...prev, endDate: e.target.value }))} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'var(--bg-main)', color: 'var(--text-primary)' }} />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ height: '37px', display: 'flex', alignItems: 'center', gap: '8px' }}>
             {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </form>
      </div>

      <div className="card col-12">
        <div className="card-title">RECENT REPORTS</div>
        <div style={{ overflowX: 'auto', marginTop: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-strong)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <th style={{ padding: '12px 16px' }}>Report Name</th>
                <th style={{ padding: '12px 16px' }}>Type</th>
                <th style={{ padding: '12px 16px' }}>Date Range</th>
                <th style={{ padding: '12px 16px' }}>Generated On</th>
                <th style={{ padding: '12px 16px' }}>Size</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{report.name}</td>
                  <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>{report.type}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{report.dateRange}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{new Date(report.generatedAt).toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{report.size}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <a href={api.getReportDownloadUrl(report.id)} download className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '6px 12px' }}>
                        <Download size={14} /> Download
                      </a>
                      <button className="icon-btn" style={{ color: 'var(--status-danger)' }} onClick={() => handleDelete(report.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No reports generated yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
