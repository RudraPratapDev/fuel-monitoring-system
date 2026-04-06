import type { Alert, DailyStat, HistoricalDataPoint, ReportRecord } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  async getHistoricalData(hours: number = 24): Promise<HistoricalDataPoint[]> {
    const res = await fetch(`${API_BASE_URL}/sensors/history?hours=${hours}`);
    return res.json();
  }

  async getHistoricalDataRange(start: string, end: string): Promise<HistoricalDataPoint[]> {
    const res = await fetch(`${API_BASE_URL}/sensors/range?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
    return res.json();
  }

  async getDailyStats(days: number = 7): Promise<DailyStat[]> {
    const res = await fetch(`${API_BASE_URL}/sensors/stats?days=${days}`);
    return res.json();
  }

  async toggleBuzzer(value: boolean): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/sensors/buzzer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
    const data = await res.json();
    return data.success;
  }

  async getAlerts(severity?: string): Promise<Alert[]> {
    const url = severity ? `${API_BASE_URL}/alerts?severity=${severity}` : `${API_BASE_URL}/alerts`;
    const res = await fetch(url);
    return res.json();
  }

  async getAlertStats(): Promise<{ total: number; critical: number; warning: number; info: number; unacknowledged: number }> {
    const res = await fetch(`${API_BASE_URL}/alerts/stats`);
    return res.json();
  }

  async acknowledgeAlert(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/alerts/${id}/acknowledge`, { method: 'PUT' });
    const data = await res.json();
    return data.success;
  }

  async clearAlerts(): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/alerts`, { method: 'DELETE' });
    const data = await res.json();
    return data.success;
  }

  async getReports(): Promise<ReportRecord[]> {
    const res = await fetch(`${API_BASE_URL}/reports`);
    return res.json();
  }

  async deleteReport(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/reports/${id}`, { method: 'DELETE' });
    const data = await res.json();
    return data.success;
  }

  async generateReport(type: string, startDate: string, endDate: string, format: string): Promise<ReportRecord> {
    const res = await fetch(`${API_BASE_URL}/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, startDate, endDate, format }),
    });
    return res.json();
  }

  getReportDownloadUrl(id: string): string {
    return `${API_BASE_URL}/reports/${id}/download`;
  }
}

export const api = new ApiService();
