// Define any global types here
import { Chart as ChartJS } from 'chart.js';

declare global {
  interface Window {
    chart: ChartJS;
  }
}

export {};