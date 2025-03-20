'use client';

import { useEffect, useRef } from 'react';
import { SMAData } from '../utils/smaUtils';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';

// Register required Chart.js components
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

interface SMAChartProps {
  data: SMAData[];
}

const SMAChart: React.FC<SMAChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    // Initialize chart only once
    if (!chartRef.current) return;
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Only create a new chart if it doesn't exist
    if (!chartInstance.current) {
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Price',
              data: [],
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
              pointRadius: 0,
              borderWidth: 2,
            },
            {
              label: 'Short SMA (5)',
              data: [],
              borderColor: 'rgb(255, 99, 132)',
              tension: 0.1,
              pointRadius: 0,
              borderWidth: 2,
            },
            {
              label: 'Long SMA (20)',
              data: [],
              borderColor: 'rgb(54, 162, 235)',
              tension: 0.1,
              pointRadius: 0,
              borderWidth: 2,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 0 // Disable animations for smoother updates
          },
          plugins: {
            tooltip: {
              mode: 'index',
              intersect: false,
            },
            legend: {
              position: 'top',
            }
          },
          scales: {
            y: {
              beginAtZero: false,
            }
          }
        }
      });
    }

    // Clean up function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  // Separate effect to update the chart data
  useEffect(() => {
    if (!chartInstance.current || data.length === 0) return;

    // Only take the last 50 data points to avoid cluttering
    const recentData = data.slice(-50);
    
    // Format labels
    const labels = recentData.map(item => {
      const date = new Date(item.timestamp);
      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    });

    // Update chart data
    chartInstance.current.data.labels = labels;
    chartInstance.current.data.datasets[0].data = recentData.map(item => item.price);
    chartInstance.current.data.datasets[1].data = recentData.map(item => item.shortSMA);
    chartInstance.current.data.datasets[2].data = recentData.map(item => item.longSMA);
    
    // Update the chart
    chartInstance.current.update('none'); // 'none' mode skips animations for smoother updates
  }, [data]);

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Price & SMA Chart</h2>
      <div className="chart-container" style={{ position: 'relative', height: '300px' }}>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default SMAChart;