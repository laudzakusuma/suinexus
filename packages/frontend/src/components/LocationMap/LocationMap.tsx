import { useState } from 'react';
import { GoogleMap, Marker, InfoWindow, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Maximize2 } from 'lucide-react';
import styles from './LocationMap.module.css';

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

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

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
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom] = useState(zoom); // ⬅️ Remove setMapZoom
  const [isFullscreen, setIsFullscreen] = useState(false);

  const hasApiKey = !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const getMarkerColor = (type?: string) => {
    const colors: Record<string, string> = {
      origin: '#10b981',
      processing: '#6366f1',
      transit: '#f59e0b',
      destination: '#ec4899'
    };
    return colors[type || 'origin'] || '#6366f1';
  };

  const recenterMap = () => {
    if (locations.length > 0) {
      const avgLat = locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
      const avgLng = locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length;
      setMapCenter({ lat: avgLat, lng: avgLng });
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Static map fallback for MVP
  if (!hasApiKey || !isLoaded) {
    return (
      <div className={styles.container} style={{ height }}>
        <div className={styles.staticMap}>
          <div className={styles.staticMapOverlay}>
            <MapPin size={48} />
            <h3>Map View</h3>
            <p>
              {locations.length} location{locations.length !== 1 ? 's' : ''} tracked
            </p>
            <div className={styles.locationsList}>
              {locations.map((loc, index) => (
                <motion.div
                  key={loc.id}
                  className={styles.locationItem}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div 
                    className={styles.locationMarker}
                    style={{ background: getMarkerColor(loc.type) }}
                  >
                    {index + 1}
                  </div>
                  <div className={styles.locationInfo}>
                    <h4>{loc.title}</h4>
                    <p>{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</p>
                    {loc.description && (
                      <span className={styles.locationDesc}>{loc.description}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            <p className={styles.staticMapNote}>
              💡 Add VITE_GOOGLE_MAPS_API_KEY to .env for interactive map
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Interactive Google Map
  const routePath = showRoute && locations.length > 1
    ? locations.map(loc => ({ lat: loc.lat, lng: loc.lng }))
    : [];

  return (
    <div 
      className={`${styles.container} ${isFullscreen ? styles.fullscreen : ''}`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      <div className={styles.mapControls}>
        <button 
          className={styles.controlButton}
          onClick={recenterMap}
          title="Recenter map"
        >
          <Navigation size={18} />
        </button>
        <button 
          className={styles.controlButton}
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          <Maximize2 size={18} />
        </button>
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={mapZoom}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          styles: [
            {
              featureType: 'all',
              elementType: 'geometry',
              stylers: [{ color: '#242f3e' }]
            },
            {
              featureType: 'all',
              elementType: 'labels.text.stroke',
              stylers: [{ color: '#242f3e' }]
            },
            {
              featureType: 'all',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#746855' }]
            }
          ]
        }}
      >
        {/* Route line */}
        {showRoute && routePath.length > 1 && (
          <Polyline
            path={routePath}
            options={{
              strokeColor: '#6366f1',
              strokeOpacity: 0.8,
              strokeWeight: 3,
              geodesic: true
            }}
          />
        )}

        {/* Location markers */}
        {locations.map((location, index) => (
          <Marker
            key={location.id}
            position={{ lat: location.lat, lng: location.lng }}
            onClick={() => setSelectedLocation(location)}
            label={{
              text: (index + 1).toString(),
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: getMarkerColor(location.type),
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 12
            }}
          />
        ))}

        {/* Info window */}
        {selectedLocation && (
          <InfoWindow
            position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
            onCloseClick={() => setSelectedLocation(null)}
          >
            <div className={styles.infoWindow}>
              <h4>{selectedLocation.title}</h4>
              {selectedLocation.description && (
                <p>{selectedLocation.description}</p>
              )}
              <span className={styles.coordinates}>
                {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </span>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default LocationMap;