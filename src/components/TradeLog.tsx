'use client';

import { TradeLog as TradeLogType } from '../utils/smaUtils';

interface TradeLogProps {
  trades: TradeLogType[];
}

const TradeLog: React.FC<TradeLogProps> = ({ trades }) => {
  // Sort trades by timestamp, most recent first
  const sortedTrades = [...trades].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Trade History</h2>
      {trades.length === 0 ? (
        <p className="text-gray-500">No trades executed yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {sortedTrades.map((trade, index) => (
                <tr key={index}>
                  <td>{new Date(trade.timestamp).toLocaleString()}</td>
                  <td className={trade.type === 'BUY' ? 'up-color font-bold' : 'down-color font-bold'}>
                    {trade.type}
                  </td>
                  <td>${trade.price.toFixed(2)}</td>
                  <td>{trade.quantity.toFixed(6)}</td>
                  <td>${trade.totalValue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TradeLog;