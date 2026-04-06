// ─── Fuel Sentinel — Blynk Cloud API Service ──────────────────────────

import { BLYNK_CONFIG, SensorData } from '../types';

const { token, baseUrl, pins } = BLYNK_CONFIG;

async function fetchPin(pin: string): Promise<string> {
  try {
    const res = await fetch(`${baseUrl}/get?token=${token}&${pin}`);
    if (!res.ok) throw new Error(`Blynk API error: ${res.status}`);
    const text = await res.text();
    // Blynk returns JSON array like ["value"] or just a number
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed[0]?.toString() ?? '0';
      return parsed.toString();
    } catch {
      return text.replace(/"/g, '').trim();
    }
  } catch (err) {
    console.error(`[Blynk] Failed to fetch ${pin}:`, err);
    return '0';
  }
}

export async function fetchAllSensorData(): Promise<SensorData> {
  const [fuelLevel, flowRate, turbidity, reedSwitch, vibration, buzzer, lcdDisplay, systemState] =
    await Promise.all([
      fetchPin(pins.fuelLevel),
      fetchPin(pins.flowRate),
      fetchPin(pins.turbidity),
      fetchPin(pins.reedSwitch),
      fetchPin(pins.vibration),
      fetchPin(pins.buzzer),
      fetchPin(pins.lcdDisplay),
      fetchPin(pins.systemState),
    ]);

  return {
    fuelLevel: Number(fuelLevel) || 0,
    flowRate: Number(flowRate) || 0,
    turbidity: Number(turbidity) || 0,
    reedSwitch: Number(reedSwitch) || 0,
    vibration: Number(vibration) || 0,
    buzzer: Number(buzzer) || 0,
    lcdDisplay: lcdDisplay || '',
    systemState: Number(systemState) || 0,
    timestamp: new Date().toISOString(),
  };
}

export async function updatePin(pin: string, value: string | number): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/update?token=${token}&${pin}=${value}`);
    return res.ok;
  } catch (err) {
    console.error(`[Blynk] Failed to update ${pin}:`, err);
    return false;
  }
}
