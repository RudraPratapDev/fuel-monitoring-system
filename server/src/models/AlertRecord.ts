import mongoose, { Schema, Document } from 'mongoose';

export interface IAlertRecord extends Document {
  alertId: string;
  timestamp: Date;
  severity: 'critical' | 'warning' | 'info';
  source: string;
  message: string;
  status: string;
  acknowledged: boolean;
}

const AlertRecordSchema = new Schema<IAlertRecord>(
  {
    alertId: { type: String, required: true, unique: true },
    timestamp: { type: Date, required: true },
    severity: { type: String, required: true, enum: ['critical', 'warning', 'info'] },
    source: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, required: true },
    acknowledged: { type: Boolean, default: false },
  },
  { timestamps: false }
);

AlertRecordSchema.index({ severity: 1 });
AlertRecordSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const AlertRecord = mongoose.model<IAlertRecord>('AlertRecord', AlertRecordSchema);
