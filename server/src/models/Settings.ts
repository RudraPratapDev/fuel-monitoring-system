import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  telegramAlerts: {
    critical: boolean;
    warning: boolean;
    info: boolean;
  };
  blynkPolling: boolean;
}

const SettingsSchema = new Schema<ISettings>(
  {
    telegramAlerts: {
      critical: { type: Boolean, required: true, default: true },
      warning: { type: Boolean, required: true, default: false },
      info: { type: Boolean, required: true, default: false },
    },
    blynkPolling: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);
