import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { MapPin, Maximize2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './LocationMap.module.css';

// Fix default marker icons using CDN
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface MapLocation {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  timestamp?: number;
  type?: 'origin' | 'processing' | 'transit' | 'destination';
}

interface LocationMapProps {
  locations: MapLocation[];
  center?: { lat: number; lng: number };
  zoom?: number;
  showRoute?: boolean;
  height?: string;
}

const defaultCenter = {
  lat: -6.2088,
  lng: 106.8456
};

const LocationMap = ({ 
  locations, 
  center = defaultCenter, 
  zoom = 10,
  showRoute = true,
  height = '400px'
}: LocationMapProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getMarkerColor = (type?: string) => {
    const colors: Record<string, string> = {
      origin: '#10b981',
      processing: '#6366f1',
      transit: '#f59e0b',
      destination: '#ec4899'
    };
    return colors[type || 'origin'] || '#6366f1';
  };

  const createCustomIcon = (type?: string, index?: number) => {
    const color = getMarkerColor(type);
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background: ${color};
          width: 36px;
          height: 36px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 3px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            transform: rotate(45deg);
            color: white;
            font-weight: bold;
            font-size: 12px;
          ">${index !== undefined ? index + 1 : '📍'}</span>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36]
    });
  };

  const mapCenter = locations.length > 0 
    ? {
        lat: locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length,
        lng: locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length
      }
    : center;

  const routePath = showRoute && locations.length > 1
    ? locations.map(loc => [loc.lat, loc.lng] as [number, number])
    : [];

  if (locations.length === 0) {
    return (
      <div className={styles.staticMap} style={{ height }}>
        <div className={styles.staticMapOverlay}>
          <MapPin size={48} />
          <h3>No Locations Yet</h3>
          <p>Location data will appear here when available</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${styles.container} ${isFullscreen ? styles.fullscreen : ''}`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      <div className={styles.mapControls}>
        <button 
          className={styles.controlButton}
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          <Maximize2 size={18} />
        </button>
      </div>

      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={zoom}
        style={{ width: '100%', height: '100%', borderRadius: '15px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {routePath.length > 1 && (
          <Polyline
            positions={routePath}
            pathOptions={{
              color: '#6366f1',
              weight: 3,
              opacity: 0.7,
            }}
          />
        )}

        {locations.map((location, index) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            icon={createCustomIcon(location.type, index)}
          >
            <Popup>
              <div style={{ 
                minWidth: '200px',
                padding: '8px',
                color: '#1a1a2e'
              }}>
                <h4 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '1rem', 
                  fontWeight: '600',
                  color: getMarkerColor(location.type)
                }}>
                  {location.title}
                </h4>
                {location.description && (
                  <p style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '0.85rem', 
                    color: '#666' 
                  }}>
                    {location.description}
                  </p>
                )}
                <span style={{ 
                  display: 'block', 
                  fontSize: '0.75rem', 
                  color: '#999',
                  fontFamily: 'monospace'
                }}>
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        padding: '8px 16px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        fontSize: '0.85rem',
        fontWeight: '600',
        color: '#1a1a2e',
        zIndex: 1000
      }}>
        📍 {locations.length} location{locations.length !== 1 ? 's' : ''} tracked
      </div>
    </div>
  );
};

export default LocationMap;