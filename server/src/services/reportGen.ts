// ─── Fuel Sentinel — Report Generation Service ──────────────────────

import PDFDocument from 'pdfkit';
import { HistoricalDataPoint } from '../types';

export function generateCSV(data: HistoricalDataPoint[]): string {
  const headers = [
    'Timestamp',
    'Fuel Level (%)',
    'Flow Rate (L/min)',
    'Turbidity (NTU)',
    'Reed Switch',
    'Vibration',
    'System Status',
  ];

  const rows = data.map((d) =>
    [
      d.timestamp,
      d.fuelLevel,
      d.flowRate,
      d.turbidity,
      d.reedSwitch === 1 ? 'Open' : 'Closed',
      d.vibration === 1 ? 'Detected' : 'None',
      d.systemStatus,
    ].join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

export function generateJSON(data: HistoricalDataPoint[]): string {
  return JSON.stringify(
    {
      report: {
        generatedAt: new Date().toISOString(),
        totalReadings: data.length,
        dateRange: data.length
          ? { start: data[0].timestamp, end: data[data.length - 1].timestamp }
          : null,
      },
      data,
    },
    null,
    2
  );
}

export function generatePDF(
  data: HistoricalDataPoint[],
  reportType: string,
  dateRange: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ── Header ──
    doc
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('Fuel Sentinel Pro', { align: 'center' });
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#6b7280')
      .text('IoT Fuel Theft Monitoring & Alert System', { align: 'center' });
    doc.moveDown(0.5);

    // Divider
    doc
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke();
    doc.moveDown(1);

    // ── Report Info ──
    doc.fillColor('#111827').fontSize(14).font('Helvetica-Bold').text(`${reportType} Report`);
    doc.fontSize(10).font('Helvetica').fillColor('#6b7280');
    doc.text(`Date Range: ${dateRange}`);
    doc.text(`Generated: ${new Date().toLocaleString()}`);
    doc.text(`Total Readings: ${data.length}`);
    doc.moveDown(1);

    if (data.length === 0) {
      doc.fontSize(12).fillColor('#9ca3af').text('No data available for the selected range.');
      doc.end();
      return;
    }

    // ── Summary Stats ──
    const fuelLevels = data.map((d) => d.fuelLevel);
    const flowRates = data.map((d) => d.flowRate);
    const turbidities = data.map((d) => d.turbidity);
    const anomalies = data.filter((d) => d.systemStatus !== 'NORMAL').length;

    doc.fillColor('#111827').fontSize(13).font('Helvetica-Bold').text('Summary');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica').fillColor('#374151');

    const avg = (arr: number[]) => (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);

    doc.text(`Fuel Level — Avg: ${avg(fuelLevels)}%  Min: ${Math.min(...fuelLevels)}%  Max: ${Math.max(...fuelLevels)}%`);
    doc.text(`Flow Rate — Avg: ${avg(flowRates)} L/min`);
    doc.text(`Turbidity — Avg: ${avg(turbidities)} NTU`);
    doc.text(`Anomalies Detected: ${anomalies}`);
    doc.moveDown(1);

    // ── Data Table ──
    doc.fillColor('#111827').fontSize(13).font('Helvetica-Bold').text('Sensor Readings');
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const colWidths = [110, 55, 55, 55, 55, 55, 80];
    const headers = ['Timestamp', 'Fuel %', 'Flow', 'NTU', 'Lid', 'Vib', 'Status'];

    // Table header
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#6b7280');
    let xPos = 50;
    headers.forEach((h, i) => {
      doc.text(h, xPos, tableTop, { width: colWidths[i], align: 'left' });
      xPos += colWidths[i];
    });

    doc
      .strokeColor('#e5e7eb')
      .lineWidth(0.5)
      .moveTo(50, tableTop + 12)
      .lineTo(545, tableTop + 12)
      .stroke();

    // Table rows (max 50 to fit in PDF)
    const displayData = data.slice(-50);
    let rowY = tableTop + 16;
    doc.font('Helvetica').fontSize(7).fillColor('#374151');

    for (const row of displayData) {
      if (rowY > 750) {
        doc.addPage();
        rowY = 50;
      }

      xPos = 50;
      const ts = new Date(row.timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      const vals = [
        ts,
        String(row.fuelLevel),
        String(row.flowRate),
        String(row.turbidity),
        row.reedSwitch === 1 ? 'Open' : 'Closed',
        row.vibration === 1 ? 'Yes' : 'No',
        row.systemStatus,
      ];

      vals.forEach((v, i) => {
        doc.text(v, xPos, rowY, { width: colWidths[i], align: 'left' });
        xPos += colWidths[i];
      });
      rowY += 11;
    }

    // ── Footer ──
    doc.moveDown(2);
    doc
      .fontSize(8)
      .fillColor('#9ca3af')
      .text('Generated by Fuel Sentinel Pro — Confidential', { align: 'center' });

    doc.end();
  });
}
