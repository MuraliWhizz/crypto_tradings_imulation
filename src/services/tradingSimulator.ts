import apiService from './api';
import { CircularBuffer, calculateSMA, determineSignal, TradingSignal, TradeLog, SMAData } from '../utils/smaUtils';

export class TradingSimulator {
  private assetId: string;
  private shortTermBuffer: CircularBuffer<number>;
  private longTermBuffer: CircularBuffer<number>;
  private currentSignal: TradingSignal = TradingSignal.HOLD;
  private tradeLogs: TradeLog[] = [];
  private smaData: SMAData[] = [];
  private balance: number = 10000; // Starting with $10,000
  private assetQuantity: number = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private pollingInterval: number; // in milliseconds

  constructor(assetId: string, shortTermSize: number = 5, longTermSize: number = 20, pollingInterval: number = 60000) {
    this.assetId = assetId;
    this.shortTermBuffer = new CircularBuffer<number>(shortTermSize);
    this.longTermBuffer = new CircularBuffer<number>(longTermSize);
    this.pollingInterval = pollingInterval;
  }

  // Start the trading simulation
  async start(): Promise<void> {
    if (this.intervalId) {
      console.log('Trading simulation already running');
      return;
    }

    console.log(`Starting trading simulation for ${this.assetId}...`);
    
    // Fetch initial price and update buffers
    await this.updatePrice();
    
    // Set up polling interval
    this.intervalId = setInterval(async () => {
      await this.updatePrice();
    }, this.pollingInterval);
  }

  // Stop the trading simulation
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Trading simulation stopped');
    }
  }

  // Update price data and perform trading logic
  private async updatePrice(): Promise<void> {
    try {
      const response = await apiService.getAsset(this.assetId);
      const asset = response.data;
      const price = parseFloat(asset.priceUsd);
      
      // Update buffers
      this.shortTermBuffer.push(price);
      this.longTermBuffer.push(price);
      
      // Calculate SMAs
      const shortTermPrices = this.shortTermBuffer.getAll();
      const longTermPrices = this.longTermBuffer.getAll();
      
      const shortSMA = calculateSMA(shortTermPrices);
      const longSMA = calculateSMA(longTermPrices);
      
      // Determine signal
      const previousSignal = this.currentSignal;
      this.currentSignal = determineSignal(shortSMA, longSMA, previousSignal);
      
      // Log SMA data
      const smaDataPoint: SMAData = {
        timestamp: Date.now(),
        price,
        shortSMA,
        longSMA,
        signal: this.currentSignal
      };
      this.smaData.push(smaDataPoint);
      
      // Execute trade if there's a signal change
      if (this.currentSignal !== previousSignal && 
          (this.currentSignal === TradingSignal.BUY || this.currentSignal === TradingSignal.SELL)) {
        this.executeTrade(this.currentSignal, price);
      }
      
      console.log(`${new Date().toISOString()} - ${this.assetId}: $${price.toFixed(2)} | Short SMA: ${shortSMA.toFixed(2)} | Long SMA: ${longSMA.toFixed(2)} | Signal: ${this.currentSignal}`);
      
    } catch (error) {
      console.error('Error updating price:', error);
    }
  }

  // Execute a trade based on signal
  private executeTrade(signal: TradingSignal.BUY | TradingSignal.SELL, price: number): void {
    const timestamp = Date.now();
    
    if (signal === TradingSignal.BUY && this.balance > 0) {
      // Use 90% of available balance for buying
      const investAmount = this.balance * 0.9;
      const quantity = investAmount / price;
      
      this.balance -= investAmount;
      this.assetQuantity += quantity;
      
      const tradeLog: TradeLog = {
        timestamp,
        type: TradingSignal.BUY,
        price,
        quantity,
        totalValue: price * quantity
      };
      
      this.tradeLogs.push(tradeLog);
      console.log(`🟢 BUY: ${quantity.toFixed(6)} ${this.assetId} @ $${price.toFixed(2)} = $${(price * quantity).toFixed(2)}`);
      
    } else if (signal === TradingSignal.SELL && this.assetQuantity > 0) {
      const saleValue = this.assetQuantity * price;
      
      const tradeLog: TradeLog = {
        timestamp,
        type: TradingSignal.SELL,
        price,
        quantity: this.assetQuantity,
        totalValue: saleValue
      };
      
      this.balance += saleValue;
      this.assetQuantity = 0;
      
      this.tradeLogs.push(tradeLog);
      console.log(`🔴 SELL: ${tradeLog.quantity.toFixed(6)} ${this.assetId} @ $${price.toFixed(2)} = $${saleValue.toFixed(2)}`);
    }
  }

  // Get trade logs
  getTradeLogs(): TradeLog[] {
    return [...this.tradeLogs];
  }

  // Get SMA data
  getSMAData(): SMAData[] {
    return [...this.smaData];
  }

  // Get portfolio value
  getPortfolioValue(currentPrice?: number): { balance: number, assetValue: number, totalValue: number } {
    let price = currentPrice;
    
    if (!price && this.smaData.length > 0) {
      price = this.smaData[this.smaData.length - 1].price;
    }
    
    const assetValue = price ? this.assetQuantity * price : 0;
    const totalValue = this.balance + assetValue;
    
    return {
      balance: this.balance,
      assetValue,
      totalValue
    };
  }

  // Reset the simulation
  reset(): void {
    this.stop();
    this.shortTermBuffer.clear();
    this.longTermBuffer.clear();
    this.currentSignal = TradingSignal.HOLD;
    this.tradeLogs = [];
    this.smaData = [];
    this.balance = 10000;
    this.assetQuantity = 0;
  }
}

export default TradingSimulator;