import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function StockAnalysisPanel({
  symbol,
  stocks,
  transactions,
  priceHistory,
  livePrice,
  onClose,
}) {
  const stock = stocks.find((s) => s.symbol === symbol);
  const stockTx = transactions.filter((t) => t.symbol === symbol);

  if (!stock) return null;

  // Use livePrice if valid, else fallback to 0 for calculations
  const effectivePrice =
    typeof livePrice === "number" && !isNaN(livePrice) ? livePrice : 0;

  const totalValue = stock.quantity * effectivePrice;

  // Calculate total gain/loss using live price, fallback 0 if averagePrice missing
  const profitLoss =
    stock.averagePrice != null
      ? (effectivePrice - stock.averagePrice) * stock.quantity
      : 0;

  return (
    <div
      className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-600 text-xl font-bold hover:text-gray-900"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4">
          {stock.companyName} ({symbol}) Analysis
        </h2>

        <div className="mb-4">
          <div>
            <b>Quantity Held:</b> {stock.quantity}
          </div>
          <div>
            <b>Average Buy Price:</b> ${stock.averagePrice.toFixed(2)}
          </div>
          <div>
            <b>Current Market Price (Live):</b>{" "}
            {typeof livePrice === "number" && !isNaN(livePrice)
              ? `$${livePrice.toFixed(2)}`
              : livePrice === null
              ? "Loading..."
              : "N/A"}
          </div>
          <div>
            <b>Current Value:</b>{" "}
            {totalValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div>
            <b>Total Gain/Loss:</b>{" "}
            <span style={{ color: profitLoss >= 0 ? "green" : "red" }}>
              ${profitLoss.toFixed(2)}
            </span>
          </div>
        </div>

        {Array.isArray(priceHistory) && priceHistory.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Recent Price Trend</h3>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={priceHistory}>
                <defs>
                  <linearGradient id="priceColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e90ff" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#1e90ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={false} />
                <YAxis width={40} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#1e90ff"
                  fillOpacity={1}
                  fill="url(#priceColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        
        
      </div>
    </div>
  );
}
