# F.A.S.T. (Fuel Anomaly & Security Tracker)

F.A.S.T. is an enterprise-grade IoT command center designed for continuous fuel tank monitoring, advanced anomaly detection, and data fusion. The system ingests high-frequency telemetry from remote ESP32 microcontrollers, processes the data through a localized threat assessment engine, and pushes actionable alerts to a hardened React dashboard and mobile supervisors via Telegram.

## System Architecture

The ecosystem operates through three primary layers:

1. **Hardware / Data Acquisition**
   - **Ultrasonic Level Sensor:** Tracks absolute fuel volume.
   - **Hall Effect Flow Sensor:** Distinguishes legitimate fluid consumption from static anomalies.
   - **Turbidity Sensor:** Measures fluid clarity to identify fuel adulteration.
   - **Vibration & Reed Switch:** Detects physical tampering, tank drilling, and unauthorized lid access.
   - **Microcontroller:** ESP32 running Blynk IoT for reliable data transmission.

2. **Backend & Threat Engine**
   - **Environment:** Node.js, Express, and local WebSockets.
   - **Database:** MongoDB (Mongoose) handling historical telemetry sweeps and TTL-indexed alerts.
   - **Threat Processing:** A deterministic heuristics engine that cross-references sensor states (e.g., fuel dropping with zero flow and activated vibration indicates aggressive theft).
   - **API Integrations:** Native Telegram Dispatcher to route severity-filtered alerts out of the localized network.

3. **Frontend Dashboard**
   - **Technologies:** React, TypeScript, Vite.
   - **Visual Identity:** Sophisticated dark-mode command center, built around monochromatic precision gradients and JetBrains Mono typographic scales for tabular metrics. No generic templates; strictly utilitarian aesthetics.
   - **Capabilities:** Live telemetry streaming, alert acknowledgment pipelines, automated PDF report generation, and dispatcher configuration.

## Features

- **Multi-Factor Threat Verification:** Eliminates false positives by linking physical breaches (lid open) to analytical changes (level drop).
- **Silent Leak Protection:** Flags continuous slow-drains that do not trigger anti-tamper sensors.
- **Dynamic Bot Routing:** Configure precise severity parameters (Critical, Warning, Info) directly from the dashboard to prevent Telegram alert fatigue.
- **Data Provenance:** Historical log exporting directly to comprehensive PDF ledgers.

## Environment Configuration

The backend server strictly requires a `.env` file at `server/.env` containing the following operational parameters:

```env
PORT=3001
POLL_INTERVAL_MS=5000
MONGODB_URI="mongodb://localhost:27017/fuel-sentinel"
BLYNK_TOKEN="<Your_Blynk_IoT_Hardware_Token>"
BLYNK_BASE_URL="http://blynk.cloud/external/api"

TELEGRAM_BOT_TOKEN="<Your_BotFather_Token>"
TELEGRAM_CHAT_ID="<Your_Target_Chat_Id>"
```

## Setup & Deployment Instructions

### Prerequisites
- Node.js v18 or higher
- MongoDB instance running locally on port 27017 (or configure the MONGODB_URI)

### 1. Backend Initialization
```bash
cd server
npm install
npm run dev
```

### 2. Frontend Initialization
Open a second terminal window:
```bash
cd client
npm install
npm run dev
```

### 3. Usage
Navigate to `http://localhost:5173` in your browser. 
Once successfully connected, the system will begin fetching live sensor artifacts over the WebSocket proxy and actively surveying the data streams for system threats.


