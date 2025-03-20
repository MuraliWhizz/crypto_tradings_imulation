// Configuration constants for the application

export const CONFIG = {
    // API settings
    API: {
      BASE_URL: 'https://api.coincap.io/v2',
      DEFAULT_POLLING_INTERVAL: 60000, // 1 minute in milliseconds
      RETRY_ATTEMPTS: 3,
      RETRY_DELAY: 2000, // 2 seconds in milliseconds
    },
    
    // Trading simulation settings
    TRADING: {
      INITIAL_BALANCE: 10000, // Starting balance in USD
      SHORT_SMA_PERIOD: 5,
      LONG_SMA_PERIOD: 20,
      BUY_PERCENTAGE: 0.9, // Use 90% of available balance for buys
    },
    
    // UI settings
    UI: {
      UPDATE_INTERVAL: 1000, // Update UI every second
      MAX_CHART_POINTS: 50, // Maximum number of data points to show on chart
      DEFAULT_ASSET: 'bitcoin',
    }
  };
  
  export default CONFIG;