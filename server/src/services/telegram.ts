import fetch from 'node-fetch';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

interface TelegramPayload {
  chat_id: string;
  text: string;
  parse_mode: string;
}

export async function sendTelegramAlert(source: string, message: string, severity: 'critical' | 'warning' | 'info') {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('[Telegram] Skipping alert: Telegram tokens not configured in .env');
    return;
  }

  const timestamp = new Date().toLocaleString('en-IN', { 
    timeZone: process.env.TIMEZONE || 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'medium'
  });
  
  // Clean, professional formatting (no emojis)
  const severityTag = severity.toUpperCase();
  const text = `*F.A.S.T. SYSTEM ALERT: ${severityTag}*
Source: ${source.replace('_', ' ').toUpperCase()}
Time: ${timestamp}

${message}

Please log into the dashboard to acknowledge viewing this alert.`;

  const payload: TelegramPayload = {
    chat_id: TELEGRAM_CHAT_ID,
    text,
    parse_mode: 'Markdown',
  };

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[Telegram] Failed to send message:', res.status, errorText);
    } else {
      console.log(`[Telegram] Successfully dispatched ${severity} alert.`);
    }
  } catch (error) {
    console.error('[Telegram] Error dispatching message:', error);
  }
}
