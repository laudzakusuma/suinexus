import { motion } from 'framer-motion';
import { Calendar, MapPin, User, Package, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import styles from './Timeline.module.css';

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  type: 'created' | 'processed' | 'transferred' | 'delivered';
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  actor?: string;
  files?: Array<{
    id: string;
    name: string;
    url: string;
    type: 'image' | 'video' | 'document';
  }>;
  metadata?: {
    temperature?: number;
    humidity?: number;
    [key: string]: any;
  };
}

interface TimelineProps {
  events: TimelineEvent[];
}

const Timeline = ({ events }: TimelineProps) => {
  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      created: '#10b981',
      processed: '#6366f1',
      transferred: '#f59e0b',
      delivered: '#ec4899'
    };
    return colors[type] || '#6b7280';
  };

  const getEventIcon = (type: string) => {
    const icons: Record<string, React.ElementType> = {
      created: Package,
      processed: User,
      transferred: MapPin,
      delivered: Calendar
    };
    const Icon = icons[type] || Package;
    return <Icon size={20} />;
  };

  if (events.length === 0) {
    return (
      <div className={styles.empty}>
        <Calendar size={48} />
        <p>No timeline events yet</p>
      </div>
    );
  }

  return (
    <div className={styles.timeline}>
      {events.map((event, index) => {
        const color = getEventColor(event.type);
        
        return (
          <motion.div
            key={event.id}
            className={styles.timelineItem}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={styles.timelineLine}>
              <div 
                className={styles.timelineDot}
                style={{ background: color }}
              >
                {getEventIcon(event.type)}
              </div>
              {index < events.length - 1 && (
                <div className={styles.timelineConnector} />
              )}
            </div>

            <div className={styles.timelineContent}>
              <div className={styles.timelineHeader}>
                <h4 className={styles.timelineTitle}>{event.title}</h4>
                <span className={styles.timelineDate}>
                  {format(event.timestamp, 'MMM dd, yyyy HH:mm')}
                </span>
              </div>

              <p className={styles.timelineDescription}>{event.description}</p>

              {event.location && (
                <div className={styles.timelineLocation}>
                  <MapPin size={14} />
                  <span>{event.location.address || `${event.location.lat.toFixed(4)}, ${event.location.lng.toFixed(4)}`}</span>
                </div>
              )}

              {event.actor && (
                <div className={styles.timelineActor}>
                  <User size={14} />
                  <span>{event.actor}</span>
                </div>
              )}

              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <div className={styles.timelineMetadata}>
                  {event.metadata.temperature && (
                    <span className={styles.metadataItem}>
                      🌡️ {event.metadata.temperature}°C
                    </span>
                  )}
                  {event.metadata.humidity && (
                    <span className={styles.metadataItem}>
                      💧 {event.metadata.humidity}%
                    </span>
                  )}
                </div>
              )}

              {event.files && event.files.length > 0 && (
                <div className={styles.timelineFiles}>
                  <div className={styles.filesHeader}>
                    <ImageIcon size={14} />
                    <span>{event.files.length} file(s)</span>
                  </div>
                  <div className={styles.filesGrid}>
                    {event.files.map(file => (
                      <div key={file.id} className={styles.fileThumb}>
                        {file.type === 'image' ? (
                          <img src={file.url} alt={file.name} />
                        ) : (
                          <div className={styles.fileIcon}>
                            {file.type === 'video' ? '🎥' : '📄'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default Timeline;