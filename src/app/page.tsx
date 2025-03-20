'use client';

import { useState, useEffect } from 'react';
import { TradingSimulator } from '../services/tradingSimulator';
import { SMAData, TradeLog as TradeLogType } from '../utils/smaUtils';
import apiService from '../services/api';
import SMAChart from '../components/SMAChart';
import TradeLog from '../components/TradeLog';
import PortfolioSummary from '../components/PortfolioSummary';

export default function Home() {
  const [assetId, setAssetId] = useState<string>('bitcoin');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simulator, setSimulator] = useState<TradingSimulator | null>(null);
  const [smaData, setSmaData] = useState<SMAData[]>([]);
  const [tradeLogs, setTradeLogs] = useState<TradeLogType[]>([]);
  const [availableAssets, setAvailableAssets] = useState<{id: string, name: string}[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [portfolioValue, setPortfolioValue] = useState({ balance: 10000, assetValue: 0, totalValue: 10000 });
  const [assetQuantity, setAssetQuantity] = useState<number>(0);
  const [pollingInterval, setPollingInterval] = useState<number>(60000); // 1 minute default
  const [error, setError] = useState<string | null>(null);

  // Fetch available assets on component mount
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await apiService.getAssets();
        // Get top 20 assets by market cap
        const topAssets = response.data
          .slice(0, 20)
          .map(asset => ({ id: asset.id, name: asset.name }));
        setAvailableAssets(topAssets);
      } catch (err) {
        setError('Failed to fetch available assets. Please try again later.');
        console.error('Error fetching assets:', err);
      }
    };

    fetchAssets();
  }, []);

  // Initialize simulator when assetId changes
  useEffect(() => {
    if (simulator) {
      simulator.stop();
    }
    
    const newSimulator = new TradingSimulator(assetId, 5, 20, pollingInterval);
    setSimulator(newSimulator);
    setSmaData([]);
    setTradeLogs([]);
    setIsRunning(false);
  }, [assetId, pollingInterval]);

  // Update UI with latest data every second
  useEffect(() => {
    if (!simulator || !isRunning) return;

    const uiUpdateInterval = setInterval(() => {
      const smaData = simulator.getSMAData();
      const tradeLogs = simulator.getTradeLogs();
      
      setSmaData([...smaData]);
      setTradeLogs([...tradeLogs]);
      
      if (smaData.length > 0) {
        const latestData = smaData[smaData.length - 1];
        setCurrentPrice(latestData.price);
      }
      
      const portfolio = simulator.getPortfolioValue();
      setPortfolioValue(portfolio);
      setAssetQuantity(simulator.getPortfolioValue().assetValue / (currentPrice || 1));
      
    }, 1000);

    return () => clearInterval(uiUpdateInterval);
  }, [simulator, isRunning, currentPrice]);

  // Start or stop the simulation
  const toggleSimulation = async () => {
    if (!simulator) return;

    if (isRunning) {
      simulator.stop();
      setIsRunning(false);
    } else {
      try {
        await simulator.start();
        setIsRunning(true);
        setError(null);
      } catch (err) {
        setError('Failed to start the simulation. Please check your connection and try again.');
        console.error('Error starting simulation:', err);
      }
    }
  };

  // Reset the simulation
  const resetSimulation = () => {
    if (!simulator) return;
    
    simulator.reset();
    setSmaData([]);
    setTradeLogs([]);
    setCurrentPrice(0);
    setPortfolioValue({ balance: 10000, assetValue: 0, totalValue: 10000 });
    setAssetQuantity(0);
    setIsRunning(false);
    setError(null);
  };

  // Handle polling interval change
  const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newInterval = parseInt(e.target.value);
    setPollingInterval(newInterval);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cryptocurrency Trading Simulator</h1>
        <p className="text-gray-600">
          Simulates trading based on Simple Moving Average (SMA) crossover strategy
        </p>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label htmlFor="asset-select" className="block text-sm font-medium text-gray-700 mb-1 px-4 py-4">
                Select Cryptocurrency  :
              </label>
              <select
                id="asset-select"
                className="border rounded p-2 w-full md:w-48"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                disabled={isRunning}
              >
                {availableAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="interval-select" className="block text-sm font-medium text-gray-700 mb-1 px-4 py-4">
                Polling Interval  :
              </label>
              <select
                id="interval-select"
                className="border rounded p-2 w-full md:w-48"
                value={pollingInterval}
                onChange={handleIntervalChange}
                disabled={isRunning}
              >
                <option value={10000}>10 Seconds (Demo)</option>
                <option value={30000}>30 Seconds</option>
                <option value={60000}>1 Minute</option>
                <option value={300000}>5 Minutes</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              className={`btn ${isRunning ? 'btn-danger' : 'btn-success'} m-4`}
              onClick={toggleSimulation}
            >
              {isRunning ? 'Stop Simulation' : 'Start Simulation'}
            </button>
            <button
              className="btn btn-primary m-4"
              onClick={resetSimulation}
              disabled={isRunning}
            >
              Reset
            </button>
          </div>
        </div>

        {currentPrice > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Current {assetId.toUpperCase()} Price:</h3>
            <span className="text-2xl font-bold">${currentPrice.toFixed(2)}</span>
            <span className="text-sm text-gray-500 ml-2">Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Portfolio Summary */}
      <PortfolioSummary
        balance={portfolioValue.balance}
        assetValue={portfolioValue.assetValue}
        totalValue={portfolioValue.totalValue}
        assetQuantity={assetQuantity}
        assetId={assetId}
        currentPrice={currentPrice || 0}
      />

      {/* SMA Chart */}
      <SMAChart data={smaData} />

      {/* Trade Log */}
      <TradeLog trades={tradeLogs} />

      {/* Strategy Explanation */}
      <div className="card mt-8">
        <h2 className="text-xl font-bold mb-2">Trading Strategy Explanation</h2>
        <p className="mb-2">
          This simulator uses a Simple Moving Average (SMA) crossover strategy:
        </p>
        <ul className="list-disc pl-5 mb-4">
          <li className="mb-1">Short-term SMA: Average of the last 5 price points</li>
          <li className="mb-1">Long-term SMA: Average of the last 20 price points</li>
          <li className="mb-1 up-color">Buy Signal: When short-term SMA crosses above long-term SMA</li>
          <li className="mb-1 down-color">Sell Signal: When short-term SMA crosses below long-term SMA</li>
        </ul>
        <p>
          The simulator uses efficient circular buffers to store only the most recent prices needed for calculations,
          ensuring constant-time updates regardless of how long the simulation runs.
        </p>
      </div>
    </div>
  );
}
