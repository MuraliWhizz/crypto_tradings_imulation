// Circular buffer implementation for efficient SMA calculation
export class CircularBuffer<T> {
    private buffer: T[];
    private size: number;
    private currentIndex: number = 0;
    private isFull: boolean = false;
  
    constructor(size: number) {
      this.size = size;
      this.buffer = new Array<T>(size);
    }
  
    // Add a new element to the buffer
    push(item: T): void {
      this.buffer[this.currentIndex] = item;
      this.currentIndex = (this.currentIndex + 1) % this.size;
      
      if (this.currentIndex === 0) {
        this.isFull = true;
      }
    }
  
    // Get all valid elements in the buffer
    getAll(): T[] {
      if (!this.isFull) {
        return this.buffer.slice(0, this.currentIndex);
      }
      
      // If buffer is full, concatenate the two parts
      const endPart = this.buffer.slice(this.currentIndex);
      const startPart = this.buffer.slice(0, this.currentIndex);
      
      return [...endPart, ...startPart];
    }
  
    // Check if the buffer is full
    isBufferFull(): boolean {
      return this.isFull;
    }
  
    // Clear the buffer
    clear(): void {
      this.buffer = new Array<T>(this.size);
      this.currentIndex = 0;
      this.isFull = false;
    }
  }
  
  // Calculate Simple Moving Average
  export function calculateSMA(prices: number[]): number {
    if (prices.length === 0) return 0;
    
    const sum = prices.reduce((acc, price) => acc + price, 0);
    return sum / prices.length;
  }
  
  // Define trading signals
  export enum TradingSignal {
    BUY = 'BUY',
    SELL = 'SELL',
    HOLD = 'HOLD',
  }
  
  // Determine trading signal based on short and long SMA
  export function determineSignal(shortSMA: number, longSMA: number, previousSignal: TradingSignal): TradingSignal {
    // No signal if we don't have enough data
    if (shortSMA === 0 || longSMA === 0) {
      return TradingSignal.HOLD;
    }
    
    // Buy when short-term SMA crosses above long-term SMA
    if (shortSMA > longSMA && previousSignal !== TradingSignal.BUY) {
      return TradingSignal.BUY;
    }
    
    // Sell when short-term SMA crosses below long-term SMA
    if (shortSMA < longSMA && previousSignal !== TradingSignal.SELL) {
      return TradingSignal.SELL;
    }
    
    // Otherwise, maintain the previous signal
    return previousSignal;
  }
  
  // Trade log interface
  export interface TradeLog {
    timestamp: number;
    type: TradingSignal.BUY | TradingSignal.SELL;
    price: number;
    quantity: number;
    totalValue: number;
  }
  
  // SMA data interface
  export interface SMAData {
    timestamp: number;
    price: number;
    shortSMA: number;
    longSMA: number;
    signal: TradingSignal;
  }