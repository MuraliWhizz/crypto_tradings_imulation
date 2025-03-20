import axios from 'axios';

const API_BASE_URL = 'https://api.coincap.io/v2';

export interface AssetData {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  supply: string;
  maxSupply: string | null;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  priceUsd: string;
  changePercent24Hr: string;
  vwap24Hr: string;
}

export interface AssetHistoryData {
  priceUsd: string;
  time: number;
  date: string;
}

export interface ApiResponse<T> {
  data: T;
  timestamp: number;
}

const apiService = {
  // Get all available assets
  getAssets: async (): Promise<ApiResponse<AssetData[]>> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/assets`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assets:', error);
      throw error;
    }
  },

  // Get specific asset by id
  getAsset: async (id: string): Promise<ApiResponse<AssetData>> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/assets/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching asset ${id}:`, error);
      throw error;
    }
  },

  // Get historical data for an asset
  getAssetHistory: async (
    id: string, 
    interval = 'm5', // m5, m15, m30, h1, h2, h6, h12, d1
    start?: number,
    end?: number
  ): Promise<ApiResponse<AssetHistoryData[]>> => {
    try {
      const params: Record<string, string> = { interval };
      if (start) params.start = start.toString();
      if (end) params.end = end.toString();
      
      const response = await axios.get(`${API_BASE_URL}/assets/${id}/history`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching history for asset ${id}:`, error);
      throw error;
    }
  }
};

export default apiService;