import mongoose, { Schema, Document } from 'mongoose';

export interface IReportRecord extends Document {
  reportId: string;
  name: string;
  type: string;
  dateRange: string;
  generatedAt: Date;
  size: string;
  format: string;
  data: string; // Base64 encoded file content
}

const ReportRecordSchema = new Schema<IReportRecord>(
  {
    reportId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    dateRange: { type: String, required: true },
    generatedAt: { type: Date, required: true, index: true },
    size: { type: String, required: true },
    format: { type: String, required: true },
    data: { type: String, required: true },
  },
  { timestamps: false }
);

export const ReportRecord = mongoose.model<IReportRecord>('ReportRecord', ReportRecordSchema);
