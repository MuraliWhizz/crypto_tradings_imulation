# Cryptocurrency Trading Simulator

A Next.js application that fetches live cryptocurrency price data from CoinCap API and simulates trades based on Simple Moving Average (SMA) crossover strategy.

## Features

- **Real-time API Integration**: Connects to CoinCap API to fetch cryptocurrency price data
- **SMA Crossover Strategy**: 
  - Calculates short-term SMA (5 periods) and long-term SMA (20 periods)
  - Generates buy signals when short-term SMA crosses above long-term SMA
  - Generates sell signals when short-term SMA crosses below long-term SMA
- **Efficient Data Handling**: Uses circular buffers for O(1) time complexity updates
- **Portfolio Tracking**: Simulates trades and tracks portfolio value over time
- **Interactive UI**: Visualizes price data, SMAs, and trade history

## Technology Stack

- **Framework**: Next.js
- **Language**: TypeScript
- **API**: CoinCap
- **Charts**: Chart.js
- **Styling**: Tailwind CSS utility classes

## Setup Instructions

### Prerequisites

- Node.js (v20+)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/crypto-trading-simulation.git
cd crypto-trading-simulation
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## How It Works

### Data Flow

1. The application polls the CoinCap API at regular intervals (configurable from UI)
2. Price data is stored in two circular buffers:
   - Short-term buffer (5 elements) for calculating short-term SMA
   - Long-term buffer (20 elements) for calculating long-term SMA
3. When a buy or sell signal is detected, a simulated trade is executed and logged
4. The UI updates to reflect current prices, SMAs, trade history, and portfolio value

### Trading Logic

The trading strategy is based on SMA crossover:

- **Buy Signal**: When the short-term SMA (5 periods) crosses above the long-term SMA (20 periods)
- **Sell Signal**: When the short-term SMA (5 periods) crosses below the long-term SMA (20 periods)

### Efficient Data Handling

The application uses circular buffers for storing price data:

- O(1) time complexity for insertion and average calculation
- Constant memory usage regardless of how long the simulation runs
- Automatically discards old data that's no longer needed for SMA calculations

## Design Decisions

### Circular Buffer Implementation

A custom circular buffer implementation was chosen to store only the most recent prices needed for SMA calculations. This ensures:

- Constant memory usage (O(1) space complexity)
- Fast updates (O(1) time complexity)
- Eliminates the need for array resizing or filtering operations

### API Polling

The application uses polling rather than WebSockets because:

1. CoinCap API doesn't provide WebSocket access for free tier users
2. For trading simulation purposes, minute-by-minute updates are sufficient
3. Polling reduces complexity while meeting the requirements

### Portfolio Simulation

The trading simulator maintains:

- Cash balance (starting at $10,000)
- Asset quantity (starting at 0)
- Trade history

This allows for realistic simulation of portfolio performance over time.

## Limitations and Future Improvements

- Add more technical indicators (RSI, MACD, etc.)
- Implement backtesting against historical data
- Add multi-asset portfolio management
- Implement stop-loss and take-profit functionality
- Add performance metrics (sharpe ratio, drawdown, etc.)
- Create comparison to buy-and-hold strategy
