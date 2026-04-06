// ─── F.A.S.T. — Report Generation Service ──────────────────────

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

    // ── Header (F.A.S.T. Branding) ──
    doc
      .fontSize(28)
      .font('Helvetica-Bold')
      .fillColor('#2563eb')
      .text('F.A.S.T.', { align: 'center', characterSpacing: 2 });
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#6b7280')
      .text('Fuel Analytics & Security Tracking Engine', { align: 'center', characterSpacing: 1.5 });
    doc.moveDown(0.5);

    // Thick Divider
    doc
      .strokeColor('#2563eb')
      .lineWidth(2)
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke();
    doc.moveDown(1);

    // ── Document Metadata Box ──
    const infoY = doc.y;
    doc.roundedRect(50, infoY, 495, 75, 6).fillOpacity(0.05).fillAndStroke('#3b82f6', '#cbd5e1');
    doc.fillOpacity(1);
    
    doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text(`${reportType.toUpperCase()} SECURITY DIGEST`, 65, infoY + 15);
    doc.fontSize(10).font('Helvetica').fillColor('#475569');
    doc.text(`Target Extraction Period: ${dateRange}`, 65, infoY + 35);
    doc.text(`Compilation Timestamp: ${new Date().toLocaleString()}`, 65, infoY + 50);
    doc.text(`Registered Telemetry Packets: ${data.length}`, 300, infoY + 35);
    doc.text(`Confidentiality Level: HIGH`, 300, infoY + 50);
    
    doc.y = infoY + 90;

    if (data.length === 0) {
      doc.fontSize(12).font('Helvetica-Oblique').fillColor('#9ca3af').text('No telemetry data available for the selected security constraint.', 50, doc.y, { align: 'center' });
      doc.end();
      return;
    }

    // ── Statistical Aggregation ──
    const fuelLevels = data.map((d) => d.fuelLevel);
    const flowRates = data.map((d) => d.flowRate);
    const turbidities = data.map((d) => d.turbidity);
    const anomalies = data.filter((d) => d.systemStatus !== 'NORMAL');

    doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text('Executive Aggregation', 50, doc.y);
    doc.moveDown(0.5);

    const statY = doc.y;
    const avg = (arr: number[]) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : '0.0';

    // Helper to draw a stat box
    const drawStatBox = (x: number, y: number, title: string, value: string, subtitle: string) => {
      doc.roundedRect(x, y, 155, 60, 4).fillAndStroke('#f8fafc', '#e2e8f0');
      doc.fillColor('#64748b').fontSize(9).font('Helvetica-Bold').text(title, x + 10, y + 10);
      doc.fillColor('#0f172a').fontSize(18).font('Helvetica-Bold').text(value, x + 10, y + 25);
      doc.fillColor('#94a3b8').fontSize(8).font('Helvetica').text(subtitle, x + 10, y + 45);
    };

    drawStatBox(50, statY, 'AVERAGE FUEL LEVEL', `${avg(fuelLevels)}%`, `Min ${Math.min(...fuelLevels)}% / Max ${Math.max(...fuelLevels)}%`);
    drawStatBox(220, statY, 'AVG EXTRACT FLOW', `${avg(flowRates)} L/min`, `Peak Flow ${Math.max(...flowRates)} L/min`);
    const anomalyColor = anomalies.length > 0 ? '#ef4444' : '#10b981';
    
    doc.roundedRect(390, statY, 155, 60, 4).fillAndStroke('#f8fafc', '#e2e8f0');
    doc.fillColor('#64748b').fontSize(9).font('Helvetica-Bold').text('SECURITY INCIDENTS', 400, statY + 10);
    doc.fillColor(anomalyColor).fontSize(18).font('Helvetica-Bold').text(`${anomalies.length}`, 400, statY + 25);
    doc.fillColor('#94a3b8').fontSize(8).font('Helvetica').text('Recorded Anomalies', 400, statY + 45);

    doc.y = statY + 85;

    // ── Vector Graphical Analytics ──
    const drawLineGraph = (x: number, y: number, width: number, height: number, values: number[], color: string, title: string) => {
        if(values.length === 0) return;
        doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text(title, x, y - 20);
        
        doc.rect(x, y, width, height).fill('#fafafa');
        doc.rect(x, y, width, height).stroke('#e5e7eb');
        
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;
        
        doc.lineWidth(0.5).strokeColor('#e5e7eb');
        for(let i=0; i<=4; i++) {
            const lineY = y + (height * i / 4);
            doc.moveTo(x, lineY).lineTo(x + width, lineY).stroke();
        }
        
        doc.lineWidth(2).strokeColor(color);
        const stepX = width / Math.max(values.length - 1, 1);
        
        values.forEach((val, i) => {
            const px = x + i * stepX;
            const py = y + height - ((val - min) / range) * height;
            if(i === 0) doc.moveTo(px, py);
            else doc.lineTo(px, py);
        });
        doc.stroke();
    };

    // Subsample data if it's too large to prevent a massive messy vector path
    const sampleSize = Math.min(data.length, 100);
    const step = Math.ceil(data.length / sampleSize);
    const sampledData = data.filter((_, i) => i % step === 0);

    const graphY = doc.y + 20;
    drawLineGraph(50, graphY, 235, 100, sampledData.map(d => d.fuelLevel), '#3b82f6', 'Volumetric Depletion Map');
    drawLineGraph(310, graphY, 235, 100, sampledData.map(d => d.flowRate), '#8b5cf6', 'Flow Rate Velocity');
    
    doc.y = graphY + 140;

    // ── Telemetry Matrix Table ──
    doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text('Detailed Telemetry Ledger', 50, doc.y);
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const colWidths = [100, 60, 60, 60, 60, 60, 85];
    const headers = ['System Time', 'Volume %', 'Flow', 'NTU', 'Hatch', 'Vibr', 'Clearance'];

    // Table Context Header
    doc.roundedRect(50, tableTop, 495, 20, 2).fill('#f1f5f9');
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#475569');
    
    let xPos = 55;
    const headerY = tableTop + 6;
    headers.forEach((h, i) => {
      doc.text(h, xPos, headerY, { width: colWidths[i], align: 'left' });
      xPos += colWidths[i];
    });

    // We only print the latest 70 rows to avoid blowing up the PDF pages for massive ranges
    // Usually reports would export full data in CSV, PDF is for executive summary
    const displayData = data.slice(-70);
    let rowY = tableTop + 24;
    
    for (const [index, row] of displayData.entries()) {
      if (rowY > 750) {
        doc.addPage();
        rowY = 50;
      }

      if (index % 2 === 0) {
        doc.rect(50, rowY - 4, 495, 18).fill('#f8fafc');
      }

      xPos = 55;
      doc.font('Helvetica').fontSize(8).fillColor('#334155');
      
      const ts = new Date(row.timestamp).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      });
      
      const statusColor = row.systemStatus === 'NORMAL' ? '#10b981' : '#ef4444';

      const vals = [
        ts,
        `${row.fuelLevel.toFixed(1)}`,
        `${row.flowRate.toFixed(1)}`,
        `${row.turbidity.toFixed(1)}`,
        row.reedSwitch === 1 ? 'VIOLATED' : 'Secured',
        row.vibration === 1 ? 'DETECTED' : 'None',
      ];

      vals.forEach((v, i) => {
        doc.fillColor(i >= 4 && v === 'VIOLATED' ? '#ef4444' : '#334155');
        doc.text(v, xPos, rowY, { width: colWidths[i], align: 'left' });
        xPos += colWidths[i];
      });

      // Special handling for System Status column to give it a colored indicator badge look
      doc.fillColor(statusColor).font('Helvetica-Bold');
      doc.text(row.systemStatus, xPos, rowY, { width: colWidths[6], align: 'left' });

      rowY += 18;
    }

    // ── Footer ──
    doc.moveDown(2);
    doc
      .fontSize(8)
      .fillColor('#94a3b8')
      .text(`Generated securely by the F.A.S.T. Engine v1.0.0 — Page 1/...`, { align: 'center' });

    doc.end();
  });
}
