import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  AlertTriangle,
  Award,
  Clock,
  Activity
} from 'lucide-react';
import styles from './Analytics.module.css';
import AdvancedChart from '../../components/AdvancedChart/AdvancedChart';
import { AnalyticsService } from '../../services/analytics';
import { PDFExportService } from '../../services/pdfExport';
import { useToast } from '../../components/Toast/ToastProvider';
import Loading, { SkeletonCard } from '../../components/Loading/Loading';
import AnimatedNumber from '../../components/AnimatedNumber/AnimatedNumber';
import type { ReportData } from '../../types/analytics';

const Analytics = () => {
  const account = useCurrentAccount();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [periodDays, setPeriodDays] = useState(30);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (account) {
      loadAnalytics();
    }
  }, [account, periodDays]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await AnalyticsService.generateReport(account!.address, periodDays);
      setReportData(data);
      toast.success('Analytics loaded successfully');
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!reportData) return;
    
    try {
      setExporting(true);
      toast.info('Generating PDF report...');
      PDFExportService.exportReport(reportData);
      toast.success('PDF report downloaded successfully!');
    } catch (error) {
      toast.error('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  if (!account) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <motion.div 
            className={styles.card} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
          >
            <BarChart3 size={48} />
            <h2>Connect Your Wallet</h2>
            <p>Please connect your wallet to view analytics</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Advanced Analytics</h1>
          </div>
          <div className={styles.metricsGrid}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  if (!reportData) return null;

  const timeSeriesData = reportData.timeSeries.map(d => ({
    date: d.date.slice(5), // MM-DD format
    'Assets Created': d.assetsCreated,
    'Processes Applied': d.processesApplied,
    'Transfers': d.transfers
  }));

  const bottleneckData = reportData.supplyChain.bottlenecks.slice(0, 6).map(b => ({
    name: b.processName,
    'Bottleneck Score': b.bottleneckScore,
    'Success Rate': b.successRate
  }));

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className={styles.title}>
              <BarChart3 className={styles.titleIcon} />
              Advanced Analytics
            </h1>
            <p className={styles.subtitle}>
              Comprehensive supply chain insights and reporting
            </p>
          </div>
          
          <div className={styles.headerActions}>
            <select 
              value={periodDays} 
              onChange={(e) => setPeriodDays(Number(e.target.value))}
              className={styles.periodSelect}
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
            </select>

            <button 
              className={styles.exportButton} 
              onClick={handleExportPDF}
              disabled={exporting}
            >
              {exporting ? (
                <>
                  <Loading type="spinner" size="small" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Export PDF
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          className={styles.metricsGrid}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <MetricCard
            icon={Activity}
            label="Total Assets"
            value={reportData.metrics.totalAssets}
            change={reportData.metrics.growthRate}
            color="#6366f1"
          />
          <MetricCard
            icon={Clock}
            label="Avg. Process Time"
            value={reportData.metrics.averageProcessTime}
            suffix="h"
            color="#8b5cf6"
          />
          <MetricCard
            icon={TrendingUp}
            label="Efficiency Rate"
            value={reportData.supplyChain.efficiency}
            suffix="%"
            color="#10b981"
          />
          <MetricCard
            icon={Activity}
            label="In Transit"
            value={reportData.metrics.assetsInTransit}
            color="#ec4899"
          />
        </motion.div>

        {/* Time Series Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AdvancedChart
            data={timeSeriesData}
            title="Activity Over Time"
            type="area"
            xAxisKey="date"
            dataKeys={[
              { key: 'Assets Created', name: 'Assets Created', color: '#6366f1' },
              { key: 'Processes Applied', name: 'Processes Applied', color: '#8b5cf6' },
              { key: 'Transfers', name: 'Transfers', color: '#ec4899' }
            ]}
          />
        </motion.div>

        {/* Supply Chain Metrics */}
        <motion.div
          className={styles.section}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Supply Chain Performance</h2>
          </div>

          <div className={styles.performanceGrid}>
            <div className={styles.performanceCard}>
              <div className={styles.performanceIcon} style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
                <Clock size={24} color="#10b981" />
              </div>
              <div className={styles.performanceContent}>
                <p className={styles.performanceLabel}>Avg. Completion Time</p>
                <h3 className={styles.performanceValue}>
                  <AnimatedNumber value={reportData.supplyChain.averageTimeToComplete} />
                  <span className={styles.performanceUnit}>days</span>
                </h3>
              </div>
            </div>

            <div className={styles.performanceCard}>
              <div className={styles.performanceIcon} style={{ background: 'rgba(99, 102, 241, 0.2)' }}>
                <Activity size={24} color="#6366f1" />
              </div>
              <div className={styles.performanceContent}>
                <p className={styles.performanceLabel}>Total Processes</p>
                <h3 className={styles.performanceValue}>
                  <AnimatedNumber value={reportData.metrics.totalProcesses} />
                </h3>
              </div>
            </div>

            <div className={styles.performanceCard}>
              <div className={styles.performanceIcon} style={{ background: 'rgba(139, 92, 246, 0.2)' }}>
                <TrendingUp size={24} color="#8b5cf6" />
              </div>
              <div className={styles.performanceContent}>
                <p className={styles.performanceLabel}>Growth Rate</p>
                <h3 className={styles.performanceValue}>
                  +<AnimatedNumber value={reportData.metrics.growthRate} />
                  <span className={styles.performanceUnit}>%</span>
                </h3>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottlenecks Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <AdvancedChart
            data={bottleneckData}
            title="Process Bottlenecks Analysis"
            type="bar"
            xAxisKey="name"
            dataKeys={[
              { key: 'Bottleneck Score', name: 'Bottleneck Score', color: '#ef4444' }
            ]}
          />
        </motion.div>

        {/* Top & Bottom Performers */}
        <motion.div
          className={styles.performersSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className={styles.performersGrid}>
            {/* Top Performers */}
            <div className={styles.performersCard}>
              <div className={styles.performersHeader}>
                <Award size={24} color="#10b981" />
                <h3>Top Performers</h3>
              </div>
              <div className={styles.performersList}>
                {reportData.supplyChain.topPerformers.map((entity, index) => (
                  <div key={entity.entityId} className={styles.performerItem}>
                    <div className={styles.performerRank}>#{index + 1}</div>
                    <div className={styles.performerInfo}>
                      <h4>{entity.entityName}</h4>
                      <p>{entity.entityType}</p>
                    </div>
                    <div className={styles.performerStats}>
                      <span className={styles.successRate}>{entity.successRate}%</span>
                      <span className={styles.assetCount}>{entity.totalAssetsProcessed} assets</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Performers */}
            <div className={styles.performersCard}>
              <div className={styles.performersHeader}>
                <AlertTriangle size={24} color="#ef4444" />
                <h3>Needs Improvement</h3>
              </div>
              <div className={styles.performersList}>
                {reportData.supplyChain.worstPerformers.map((entity, index) => (
                  <div key={entity.entityId} className={styles.performerItem}>
                    <div className={styles.performerRank} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                      #{index + 1}
                    </div>
                    <div className={styles.performerInfo}>
                      <h4>{entity.entityName}</h4>
                      <p>{entity.entityType}</p>
                    </div>
                    <div className={styles.performerStats}>
                      <span className={styles.successRate} style={{ color: '#ef4444' }}>
                        {entity.successRate}%
                      </span>
                      <span className={styles.assetCount}>{entity.totalAssetsProcessed} assets</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Report Info */}
        <motion.div
          className={styles.reportInfo}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Calendar size={18} />
          <span>
            Report Period: {reportData.period.start} to {reportData.period.end}
          </span>
          <span className={styles.separator}>•</span>
          <span>Generated: {reportData.generatedAt}</span>
        </motion.div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  icon: any;
  label: string;
  value: number;
  suffix?: string;
  change?: number;
  color: string;
}

const MetricCard = ({ icon: Icon, label, value, suffix = '', change, color }: MetricCardProps) => {
  return (
    <motion.div
      className={styles.metricCard}
      whileHover={{ y: -5 }}
    >
      <div className={styles.metricIcon} style={{ background: `${color}20` }}>
        <Icon size={24} color={color} />
      </div>
      <div className={styles.metricContent}>
        <p className={styles.metricLabel}>{label}</p>
        <h3 className={styles.metricValue}>
          <AnimatedNumber value={value} suffix={suffix} />
        </h3>
        {change !== undefined && (
          <span className={styles.metricChange}>
            {change >= 0 ? '+' : ''}{change}% from last period
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default Analytics;