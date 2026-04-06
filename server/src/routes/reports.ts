// ─── Fuel Sentinel — Report API Routes ──────────────────────────────

import { Router, Request, Response } from 'express';
import { getHistoricalDataRange } from '../services/dataStore';
import { saveReportRecord, getReportRecords, getReportData, deleteReport } from '../services/dataStore';
import { generateCSV, generateJSON, generatePDF } from '../services/reportGen';
import { v4Fallback } from '../utils';

const router = Router();

// POST /api/reports/generate — create a new report
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { type, startDate, endDate, format } = req.body;

    if (!type || !startDate || !endDate || !format) {
      res.status(400).json({ error: 'type, startDate, endDate, and format are required' });
      return;
    }

    const data = await getHistoricalDataRange(startDate, endDate);
    const dateRange = `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
    const reportId = v4Fallback();

    let fileContent: string;
    let mimeType: string;

    switch (format) {
      case 'csv':
        fileContent = generateCSV(data);
        mimeType = 'text/csv';
        break;
      case 'json':
        fileContent = generateJSON(data);
        mimeType = 'application/json';
        break;
      case 'pdf': {
        const pdfBuffer = await generatePDF(data, type, dateRange);
        fileContent = pdfBuffer.toString('base64');
        mimeType = 'application/pdf';
        break;
      }
      default:
        res.status(400).json({ error: 'Invalid format. Use pdf, csv, or json.' });
        return;
    }

    const reportName = `${type.charAt(0).toUpperCase() + type.slice(1)} Report — ${dateRange}`;
    const sizeBytes = Buffer.byteLength(format === 'pdf' ? Buffer.from(fileContent, 'base64') : fileContent);
    const size = sizeBytes > 1024 * 1024
      ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
      : `${(sizeBytes / 1024).toFixed(1)} KB`;

    await saveReportRecord({
      id: reportId,
      name: reportName,
      type,
      dateRange,
      generatedAt: new Date().toISOString(),
      size,
      format,
      data: format === 'pdf' ? fileContent : Buffer.from(fileContent).toString('base64'),
    });

    res.json({
      id: reportId,
      name: reportName,
      type,
      dateRange,
      size,
      format,
      readings: data.length,
    });
  } catch (err) {
    console.error('[Reports] Error generating report:', err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// GET /api/reports — list previous reports
router.get('/', async (_req: Request, res: Response) => {
  try {
    const reports = await getReportRecords();
    res.json(reports);
  } catch (err) {
    console.error('[Reports] Error listing reports:', err);
    res.status(500).json({ error: 'Failed to list reports' });
  }
});

// GET /api/reports/:id/download — download a report
router.get('/:id/download', async (req: Request, res: Response) => {
  try {
    const data = await getReportData(req.params.id);
    if (!data) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    const reports = await getReportRecords();
    const report = reports.find((r: any) => r.id === req.params.id);
    const format = report?.format || 'json';
    const buffer = Buffer.from(data, 'base64');

    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      csv: 'text/csv',
      json: 'application/json',
    };

    const extensions: Record<string, string> = {
      pdf: '.pdf',
      csv: '.csv',
      json: '.json',
    };

    res.setHeader('Content-Type', mimeTypes[format] || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="fuel-sentinel-report${extensions[format] || '.dat'}"`
    );
    res.send(buffer);
  } catch (err) {
    console.error('[Reports] Error downloading report:', err);
    res.status(500).json({ error: 'Failed to download report' });
  }
});

// DELETE /api/reports/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const ok = await deleteReport(req.params.id);
    res.json({ success: ok });
  } catch (err) {
    console.error('[Reports] Error deleting report:', err);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

export default router;
