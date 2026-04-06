import mongoose, { Schema, Document } from 'mongoose';

export interface ISensorReading extends Document {
  timestamp: Date;
  fuelLevel: number;
  flowRate: number;
  turbidity: number;
  reedSwitch: number;
  vibration: number;
  systemStatus: string;
}

const SensorReadingSchema = new Schema<ISensorReading>(
  {
    timestamp: { type: Date, required: true },
    fuelLevel: { type: Number, required: true },
    flowRate: { type: Number, required: true },
    turbidity: { type: Number, required: true },
    reedSwitch: { type: Number, required: true },
    vibration: { type: Number, required: true },
    systemStatus: { type: String, required: true, default: 'NORMAL' },
  },
  { timestamps: false }
);

// TTL index: auto-delete readings older than 30 days
SensorReadingSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const SensorReading = mongoose.model<ISensorReading>('SensorReading', SensorReadingSchema);
