export interface AnalyticsMetrics {
  totalAssets: number;
  totalEntities: number;
  totalProcesses: number;
  averageProcessTime: number;
  growthRate: number;
  assetsInTransit: number;
  completedAssets: number;
}

export interface EntityPerformance {
  entityId: string;
  entityName: string;
  entityType: string;
  totalAssetsProcessed: number;
  averageProcessingTime: number;
  successRate: number;
  lastActive: string;
}

export interface ProcessAnalytics {
  processName: string;
  totalCount: number;
  averageTime: number;
  successRate: number;
  bottleneckScore: number;
}

export interface TimeSeriesData {
  date: string;
  assetsCreated: number;
  processesApplied: number;
  transfers: number;
}

export interface SupplyChainMetrics {
  averageTimeToComplete: number;
  bottlenecks: ProcessAnalytics[];
  topPerformers: EntityPerformance[];
  worstPerformers: EntityPerformance[];
  efficiency: number;
}

export interface ReportData {
  period: {
    start: string;
    end: string;
  };
  metrics: AnalyticsMetrics;
  timeSeries: TimeSeriesData[];
  supplyChain: SupplyChainMetrics;
  entities: EntityPerformance[];
  generatedAt: string;
}