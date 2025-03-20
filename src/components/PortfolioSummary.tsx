'use client';

interface PortfolioSummaryProps {
  balance: number;
  assetValue: number;
  totalValue: number;
  assetQuantity: number;
  assetId: string;
  currentPrice: number;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ 
  balance, 
  assetValue, 
  totalValue, 
  assetQuantity, 
  assetId, 
  currentPrice 
}) => {
  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Portfolio Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stats-card bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800">Cash Balance</h3>
          <p className="text-2xl font-bold">${balance.toFixed(2)}</p>
        </div>
        
        <div className="stats-card bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-green-800">Asset Value</h3>
          <p className="text-2xl font-bold">${assetValue.toFixed(2)}</p>
          <p className="text-sm text-gray-600">
            {assetQuantity.toFixed(6)} {assetId.toUpperCase()} @ ${currentPrice.toFixed(2)}
          </p>
        </div>
        
        <div className="stats-card bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-purple-800">Total Value</h3>
          <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;