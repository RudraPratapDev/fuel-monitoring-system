import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { useData } from '../context/DataContext';
import './Location.css';
import { MapPin, Navigation, Clock } from 'lucide-react';
import { NH48_ROUTE } from '../constants/routeData';

// Professional Top-down Truck SVG (data URI)
const truckSvgUri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 200" width="32" height="64">
  <!-- Cab -->
  <rect x="25" y="10" width="50" height="30" rx="5" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
  <rect x="30" y="15" width="40" height="15" rx="2" fill="#1e293b"/>
  <!-- Trailer Body -->
  <rect x="20" y="45" width="60" height="140" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
  <!-- Tank Details -->
  <rect x="30" y="55" width="40" height="120" rx="20" fill="#cbd5e1"/>
  <circle cx="50" cy="80" r="10" fill="#94a3b8"/>
  <circle cx="50" cy="115" r="10" fill="#94a3b8"/>
  <circle cx="50" cy="150" r="10" fill="#94a3b8"/>
  <line x1="50" y1="90" x2="50" y2="105" stroke="#64748b" stroke-width="4"/>
  <line x1="50" y1="125" x2="50" y2="140" stroke="#64748b" stroke-width="4"/>
</svg>
`);

const truckIcon = new Icon({
  iconUrl: truckSvgUri,
  iconSize: [24, 48],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

export default function Location() {
  const { sensor } = useData();
  const flowRate = sensor?.flowRate ?? 0;
  
  // Interpolation parameter along the massive route length
  const [progress, setProgress] = useState(0);

  // Update simulator progress
  useEffect(() => {
    // Only move if flowRate > 0
    if (flowRate <= 0) return;

    const timer = setInterval(() => {
      // 0.04 points per second — much slower, realistic highway crawl on dense OSRM geometry.
      setProgress(prev => Math.min(prev + 0.04, NH48_ROUTE.length - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [flowRate]);

  // Calculate exact lat/lng based on progress
  const getCurrentPosition = (): [number, number] => {
    const idx = Math.floor(progress);
    if (idx >= NH48_ROUTE.length - 1) return NH48_ROUTE[NH48_ROUTE.length - 1];
    
    const p1 = NH48_ROUTE[idx];
    const p2 = NH48_ROUTE[idx + 1];
    const fract = progress - idx;
    
    return [
      p1[0] + (p2[0] - p1[0]) * fract,
      p1[1] + (p2[1] - p1[1]) * fract
    ];
  };

  const currentPos = getCurrentPosition();
  const isMoving = flowRate > 0 && progress < NH48_ROUTE.length - 1;
  const isArrived = progress >= NH48_ROUTE.length - 1;

  return (
    <div className="location-page fade-in">
      <div className="location-header">
        <h2>Live GPS Tracking</h2>
        <p>Real-time fleet route visualization via embedded satellite data</p>
      </div>

      <div className="location-container box-panel">
        <div className="map-toolbar">
          <div className="toolbar-stat">
            <Navigation size={18} className="stat-icon" />
            <div>
              <span className="stat-label">Status</span>
              <div className={`status-badge ${isMoving ? 'moving' : isArrived ? 'arrived' : 'stopped'}`}>
                {isArrived ? 'ARRIVED' : isMoving ? 'IN TRANSIT' : 'STOPPED'}
              </div>
            </div>
          </div>
          
          <div className="toolbar-stat">
            <MapPin size={18} className="stat-icon" />
            <div>
              <span className="stat-label">Coordinates</span>
              <div className="stat-val monospace">
                {currentPos[0].toFixed(4)}, {currentPos[1].toFixed(4)}
              </div>
            </div>
          </div>
          
          <div className="toolbar-stat">
            <Clock size={18} className="stat-icon" />
            <div>
              <span className="stat-label">Flow Rate Engine Lock</span>
              <div className="stat-val">
                {flowRate > 0 ? `${flowRate.toFixed(1)} L/m (Engine ON)` : '0 L/m (Engine OFF)'}
              </div>
            </div>
          </div>
        </div>

        <div className="map-wrapper">
          <MapContainer 
            center={[27.7, 76.5]} 
            zoom={8} 
            scrollWheelZoom={false}
            className="leaflet-container-custom"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* The full route polyline */}
            <Polyline positions={NH48_ROUTE} color="#3b82f6" weight={4} dashArray="5, 10" />
            
            {/* The moving vehicle marker */}
            <Marker position={currentPos} icon={truckIcon}>
              <Popup>
                <strong>Vehicle #V-092</strong><br/>
                Flow Rate: {flowRate.toFixed(1)} L/m<br/>
                Status: {isMoving ? 'Moving' : 'Idle'}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
