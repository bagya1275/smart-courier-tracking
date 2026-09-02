/**
 * SMART COURIER PLATFORM - CHARTS MODULE
 * Responsive Chart.js visualizations with neon gradients and cyberpunk dark styling.
 */

class ChartsManager {
  constructor() {
    this.weeklyChart = null;
    this.statusChart = null;
  }

  initWeeklyVolumeChart(canvasId, weeklyData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !window.Chart) return;

    if (this.weeklyChart) {
      this.weeklyChart.destroy();
    }

    const ctx = canvas.getContext('2d');

    // Create Neon Gradients
    const gradientDelivered = ctx.createLinearGradient(0, 0, 0, 300);
    gradientDelivered.addColorStop(0, 'rgba(0, 240, 255, 0.85)');
    gradientDelivered.addColorStop(1, 'rgba(0, 153, 255, 0.2)');

    const gradientDelayed = ctx.createLinearGradient(0, 0, 0, 300);
    gradientDelayed.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
    gradientDelayed.addColorStop(1, 'rgba(239, 68, 68, 0.15)');

    const labels = weeklyData.map(d => d.day);
    const deliveredValues = weeklyData.map(d => d.delivered);
    const delayedValues = weeklyData.map(d => d.delayed);

    this.weeklyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Delivered',
            data: deliveredValues,
            backgroundColor: gradientDelivered,
            borderColor: '#00F0FF',
            borderWidth: 1.5,
            borderRadius: 6,
            barPercentage: 0.65,
            categoryPercentage: 0.7
          },
          {
            label: 'Delayed / Hold',
            data: delayedValues,
            backgroundColor: gradientDelayed,
            borderColor: '#EF4444',
            borderWidth: 1.5,
            borderRadius: 6,
            barPercentage: 0.65,
            categoryPercentage: 0.7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              color: '#9CA3AF',
              font: { family: 'Space Grotesk', size: 12, weight: '600' },
              boxWidth: 12,
              boxHeight: 12,
              useBorderRadius: true,
              borderRadius: 3
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#FFFFFF',
            bodyColor: '#E2E8F0',
            borderColor: 'rgba(0, 240, 255, 0.3)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            titleFont: { family: 'Space Grotesk', weight: '700' },
            bodyFont: { family: 'Inter' }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#9CA3AF', font: { family: 'Space Grotesk', size: 11, weight: '600' } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#9CA3AF', font: { family: 'JetBrains Mono', size: 11 } },
            beginAtZero: true
          }
        }
      }
    });
  }

  initStatusDistributionChart(canvasId, stats) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !window.Chart) return;

    if (this.statusChart) {
      this.statusChart.destroy();
    }

    const ctx = canvas.getContext('2d');

    const inTransit = stats.inTransitShipments || 2;
    const delivered = stats.deliveredToday || 3;
    const pending = stats.pendingShipments || 1;
    const delayed = stats.delayedShipments || 1;

    this.statusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['In Transit', 'Delivered Today', 'Pending Dispatch', 'Delayed'],
        datasets: [{
          data: [inTransit, delivered, pending, delayed],
          backgroundColor: [
            '#00F0FF',
            '#10B981',
            '#F59E0B',
            '#EF4444'
          ],
          borderColor: '#0B0E14',
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#9CA3AF',
              font: { family: 'Space Grotesk', size: 11, weight: '600' },
              padding: 14,
              boxWidth: 10,
              boxHeight: 10,
              useBorderRadius: true,
              borderRadius: 50
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8
          }
        }
      }
    });
  }
}

window.chartsManager = new ChartsManager();
