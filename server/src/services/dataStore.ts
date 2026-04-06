// ─── Fuel Sentinel — Data Store (MongoDB) ───────────────────────────

import { SensorReading } from '../models/SensorReading';
import { ReportRecord } from '../models/ReportRecord';
import { HistoricalDataPoint } from '../types';

export async function insertSensorData(data: HistoricalDataPoint): Promise<void> {
  await SensorReading.create({
    timestamp: new Date(data.timestamp),
    fuelLevel: data.fuelLevel,
    flowRate: data.flowRate,
    turbidity: data.turbidity,
    reedSwitch: data.reedSwitch,
    vibration: data.vibration,
    systemStatus: data.systemStatus,
  });
}

export async function getHistoricalData(hours: number = 24): Promise<HistoricalDataPoint[]> {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  const docs = await SensorReading.find({ timestamp: { $gte: cutoff } })
    .sort({ timestamp: 1 })
    .lean();

  return docs.map((d) => ({
    timestamp: d.timestamp.toISOString(),
    fuelLevel: d.fuelLevel,
    flowRate: d.flowRate,
    turbidity: d.turbidity,
    reedSwitch: d.reedSwitch,
    vibration: d.vibration,
    systemStatus: d.systemStatus,
  }));
}

export async function getHistoricalDataRange(
  start: string,
  end: string
): Promise<HistoricalDataPoint[]> {
  const docs = await SensorReading.find({
    timestamp: { $gte: new Date(start), $lte: new Date(end) },
  })
    .sort({ timestamp: 1 })
    .lean();

  return docs.map((d) => ({
    timestamp: d.timestamp.toISOString(),
    fuelLevel: d.fuelLevel,
    flowRate: d.flowRate,
    turbidity: d.turbidity,
    reedSwitch: d.reedSwitch,
    vibration: d.vibration,
    systemStatus: d.systemStatus,
  }));
}

export async function getDailyStats(days: number = 7) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const pipeline = [
    { $match: { timestamp: { $gte: cutoff } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
        },
        readings: { $sum: 1 },
        avgFuelLevel: { $avg: '$fuelLevel' },
        minFuelLevel: { $min: '$fuelLevel' },
        maxFuelLevel: { $max: '$fuelLevel' },
        avgFlowRate: { $avg: '$flowRate' },
        avgTurbidity: { $avg: '$turbidity' },
        anomalies: {
          $sum: { $cond: [{ $ne: ['$systemStatus', 'NORMAL'] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: -1 as const } },
    {
      $project: {
        date: '$_id',
        readings: 1,
        avgFuelLevel: { $round: ['$avgFuelLevel', 1] },
        minFuelLevel: { $round: ['$minFuelLevel', 1] },
        maxFuelLevel: { $round: ['$maxFuelLevel', 1] },
        avgFlowRate: { $round: ['$avgFlowRate', 1] },
        avgTurbidity: { $round: ['$avgTurbidity', 1] },
        anomalies: 1,
        _id: 0,
      },
    },
  ];

  return SensorReading.aggregate(pipeline);
}

export async function saveReportRecord(report: {
  id: string;
  name: string;
  type: string;
  dateRange: string;
  generatedAt: string;
  size: string;
  format: string;
  data: string;
}): Promise<void> {
  await ReportRecord.create({
    reportId: report.id,
    name: report.name,
    type: report.type,
    dateRange: report.dateRange,
    generatedAt: new Date(report.generatedAt),
    size: report.size,
    format: report.format,
    data: report.data,
  });
}

export async function getReportRecords() {
  const docs = await ReportRecord.find()
    .sort({ generatedAt: -1 })
    .limit(50)
    .lean();

  return docs.map((d) => ({
    id: d.reportId,
    name: d.name,
    type: d.type,
    dateRange: d.dateRange,
    generatedAt: d.generatedAt.toISOString(),
    size: d.size,
    format: d.format,
  }));
}

export async function getReportData(reportId: string): Promise<string | null> {
  const doc = await ReportRecord.findOne({ reportId }).lean();
  return doc?.data ?? null;
}

export async function deleteReport(reportId: string): Promise<boolean> {
  const result = await ReportRecord.deleteOne({ reportId });
  return result.deletedCount > 0;
}

export async function getDataCount(): Promise<number> {
  return SensorReading.countDocuments();
}
