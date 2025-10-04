import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Package, 
  Clock, 
  TrendingUp,
  Activity,
  QrCode,
  type LucideIcon 
} from 'lucide-react';
import axios from 'axios';
import styles from './AssetDetail.module.css';
import Timeline, { type TimelineEvent } from '../../components/TimeLine/TimeLine';
import LocationMap, { type MapLocation } from '../../components/LocationMap/LocationMap';
import QRCodeDisplay from '../../components/QRCodeDisplay/QRCodeDisplay';
import { useToast } from '../../components/Toast/ToastProvider';
import Loading from '../../components/Loading/Loading';

interface AssetFields {
  name?: string;
  description?: string;
  quantity?: number;
  unit?: string;
  current_state?: string;
  creation_timestamp_ms?: string;
  creator?: string;
  history?: string[];
}

interface AssetContent {
  fields?: AssetFields;
}

interface Asset {
  content?: AssetContent;
}

const AssetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (id) {
      loadAssetDetails();
    }
  }, [id]);

  const loadAssetDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/assets/${id}`);
      setAsset(response.data.data);
      toast.success('Asset details loaded');
    } catch (error) {
      toast.error('Failed to load asset details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <Loading text="Loading asset details..." />
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.notFound}>
            <Package size={48} />
            <h2>Asset Not Found</h2>
            <p>The asset you're looking for doesn't exist or has been deleted.</p>
            <button onClick={() => navigate('/tracking')} className={styles.backButton}>
              <ArrowLeft size={18} />
              Back to Tracking
            </button>
          </div>
        </div>
      </div>
    );
  }

  const fields = asset.content?.fields || {};
  const history = fields.history || [];

  const timelineEvents: TimelineEvent[] = [
    {
      id: '1',
      title: 'Asset Created',
      description: `${fields.name || 'Asset'} was created and registered in the system`,
      timestamp: Number(fields.creation_timestamp_ms || Date.now()),
      type: 'created',
      location: {
        lat: -6.2088,
        lng: 106.8456,
        address: 'Origin Location'
      },
      actor: fields.creator ? `${fields.creator.slice(0, 8)}...${fields.creator.slice(-6)}` : 'Unknown',
      metadata: {
        quantity: fields.quantity,
        unit: fields.unit
      }
    },
    ...history.map((event, index) => ({
      id: `history-${index}`,
      title: `Process Applied`,
      description: event,
      timestamp: Number(fields.creation_timestamp_ms || Date.now()) + (index + 1) * 3600000,
      type: 'processed' as const,
      location: {
        lat: -6.2088 + (index * 0.01),
        lng: 106.8456 + (index * 0.01),
        address: `Processing Station ${index + 1}`
      }
    }))
  ];

  const mapLocations: MapLocation[] = timelineEvents
    .filter(event => event.location)
    .map((event, index) => ({
      id: event.id,
      lat: event.location!.lat,
      lng: event.location!.lng,
      title: event.title,
      description: event.location!.address,
      type: index === 0 ? 'origin' : index === timelineEvents.length - 1 ? 'destination' : 'processing'
    }));

  const totalEvents = timelineEvents.length;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <motion.button
          className={styles.backButton}
          onClick={() => navigate('/tracking')}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeft size={18} />
          Back to Tracking
        </motion.button>

        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.headerIcon}>
            <Package size={32} />
          </div>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>{fields.name || 'Unknown Asset'}</h1>
            <p className={styles.subtitle}>{fields.description || 'No description available'}</p>
            <div className={styles.assetId}>
              <span>ID: {id?.slice(0, 16)}...{id?.slice(-8)}</span>
            </div>
          </div>
          <button 
            className={styles.qrButton}
            onClick={() => setShowQR(!showQR)}
            title="Show QR Code"
          >
            <QrCode size={24} />
          </button>
        </motion.div>

        {showQR && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={styles.qrSection}
          >
            <QRCodeDisplay
              data={id || ''}
              title="Asset QR Code"
              subtitle="Scan to view asset details"
              size={300}
            />
          </motion.div>
        )}

        <div className={styles.infoGrid}>
          <InfoCard
            icon={Package}
            label="Quantity"
            value={`${fields.quantity || 0} ${fields.unit || 'units'}`}
            color="#6366f1"
          />
          <InfoCard
            icon={TrendingUp}
            label="Current State"
            value={fields.current_state || 'CREATED'}
            color="#10b981"
          />
          <InfoCard
            icon={Clock}
            label="Created"
            value={new Date(Number(fields.creation_timestamp_ms || 0)).toLocaleDateString()}
            color="#f59e0b"
          />
          <InfoCard
            icon={Activity}
            label="Total Events"
            value={`${totalEvents} events`}
            color="#ec4899"
          />
        </div>

        <div className={styles.contentGrid}>
          <motion.div
            className={styles.section}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Journey Timeline</h2>
              <span className={styles.sectionBadge}>{timelineEvents.length} events</span>
            </div>
            <Timeline events={timelineEvents} />
          </motion.div>

          <motion.div
            className={styles.section}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Location Tracking</h2>
              <span className={styles.sectionBadge}>{mapLocations.length} locations</span>
            </div>
            <LocationMap
              locations={mapLocations}
              showRoute={true}
              height="600px"
            />
          </motion.div>
        </div>

        <motion.div
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className={styles.sectionTitle}>Asset Details</h2>
          <div className={styles.detailsGrid}>
            <DetailItem label="Asset ID" value={id || 'N/A'} />
            <DetailItem 
              label="Creator Address" 
              value={fields.creator || 'Unknown'} 
            />
            <DetailItem label="Current State" value={fields.current_state || 'CREATED'} />
            <DetailItem 
              label="Created At" 
              value={new Date(Number(fields.creation_timestamp_ms || 0)).toLocaleString()} 
            />
            <DetailItem label="Quantity" value={`${fields.quantity || 0}`} />
            <DetailItem label="Unit" value={fields.unit || 'N/A'} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

interface InfoCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
}

const InfoCard = ({ icon: Icon, label, value, color }: InfoCardProps) => {
  return (
    <motion.div
      className={styles.infoCard}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles.infoIcon} style={{ background: `${color}20` }}>
        <Icon size={24} color={color} />
      </div>
      <div className={styles.infoContent}>
        <span className={styles.infoLabel}>{label}</span>
        <h3 className={styles.infoValue}>{value}</h3>
      </div>
    </motion.div>
  );
};

interface DetailItemProps {
  label: string;
  value: string;
}

const DetailItem = ({ label, value }: DetailItemProps) => {
  return (
    <div className={styles.detailItem}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value}</span>
    </div>
  );
};

export default AssetDetail;