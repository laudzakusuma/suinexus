import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ReportData } from '../types/analytics';
import { format } from 'date-fns';

export class PDFExportService {
  static exportReport(reportData: ReportData, filename: string = 'supply-chain-report') {
    const doc = new jsPDF();
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(99, 102, 241);
    doc.text('SuiNexus Supply Chain Report', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${reportData.generatedAt}`, 20, yPos);
    doc.text(`Period: ${reportData.period.start} to ${reportData.period.end}`, 20, yPos + 5);
    
    yPos += 20;

    // Metrics Summary
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Key Metrics', 20, yPos);
    yPos += 10;

    const metricsData = [
      ['Total Assets', reportData.metrics.totalAssets.toString()],
      ['Total Entities', reportData.metrics.totalEntities.toString()],
      ['Total Processes', reportData.metrics.totalProcesses.toString()],
      ['Average Process Time', `${reportData.metrics.averageProcessTime}h`],
      ['Growth Rate', `${reportData.metrics.growthRate}%`],
      ['Assets in Transit', reportData.metrics.assetsInTransit.toString()],
      ['Completed Assets', reportData.metrics.completedAssets.toString()],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: metricsData,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Supply Chain Metrics
    doc.setFontSize(14);
    doc.text('Supply Chain Performance', 20, yPos);
    yPos += 10;

    const supplyChainData = [
      ['Avg. Time to Complete', `${reportData.supplyChain.averageTimeToComplete} days`],
      ['Overall Efficiency', `${reportData.supplyChain.efficiency}%`]
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: supplyChainData,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Top Bottlenecks
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text('Process Bottlenecks', 20, yPos);
    yPos += 10;

    const bottleneckData = reportData.supplyChain.bottlenecks.slice(0, 5).map(b => [
      b.processName,
      b.totalCount.toString(),
      `${b.averageTime}h`,
      `${b.successRate}%`,
      b.bottleneckScore.toFixed(1)
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Process', 'Count', 'Avg Time', 'Success Rate', 'Bottleneck Score']],
      body: bottleneckData,
      theme: 'grid',
      headStyles: { fillColor: [239, 68, 68] }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Top Performers
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text('Top Performing Entities', 20, yPos);
    yPos += 10;

    const topPerformersData = reportData.supplyChain.topPerformers.map(e => [
      e.entityName,
      e.entityType,
      e.totalAssetsProcessed.toString(),
      `${e.averageProcessingTime}h`,
      `${e.successRate}%`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Name', 'Type', 'Assets Processed', 'Avg Time', 'Success Rate']],
      body: topPerformersData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }
    });

    // Save PDF
    doc.save(`${filename}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  }
}