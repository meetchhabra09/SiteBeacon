import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

const width = 800;
const height = 400;

export async function generateUptimeChart(dailyStats, beaconTitle) {
  try {
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

    // Format data for chart
    const labels = dailyStats.map(stat => {
      const date = new Date(stat._id.year, stat._id.month - 1, stat._id.day);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const uptimeData = dailyStats.map(stat => {
      const uptime = stat.totalCount > 0 ? ((stat.upCount / stat.totalCount) * 100).toFixed(2) : 100;
      return parseFloat(uptime);
    });

    const downCount = dailyStats.map(stat => stat.downCount);

    const configuration = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Uptime %',
            data: uptimeData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            yAxisID: 'y'
          },
          {
            label: 'Downtime Events',
            data: downCount,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointBackgroundColor: '#ef4444',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `${beaconTitle} - 7 Day Performance Trend`,
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Uptime %'
            },
            min: 0,
            max: 100
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Downtime Events'
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    };

    const image = await chartJSNodeCanvas.drawChart(configuration);
    return `<img src="data:image/png;base64,${image.toString('base64')}" alt="Uptime Chart" style="max-width: 100%; height: auto; border-radius: 6px;" />`;
  } catch (error) {
    console.error("Error generating chart:", error);
    return null;
  }
}

export async function generateStatusDistributionChart(statusCounts) {
  try {
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

    const data = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const configuration = {
      type: 'doughnut',
      data: {
        labels: ['UP', 'DOWN', 'UNKNOWN'],
        datasets: [
          {
            data: [
              data.UP || 0,
              data.DOWN || 0,
              data.UNKNOWN || 0
            ],
            backgroundColor: [
              '#10b981',
              '#ef4444',
              '#f59e0b'
            ],
            borderColor: '#fff',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Status Distribution (Last 30 Days)',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: true,
            position: 'bottom'
          }
        }
      }
    };

    const image = await chartJSNodeCanvas.drawChart(configuration);
    return `<img src="data:image/png;base64,${image.toString('base64')}" alt="Status Distribution Chart" style="max-width: 100%; height: auto; border-radius: 6px;" />`;
  } catch (error) {
    console.error("Error generating status chart:", error);
    return null;
  }
}
