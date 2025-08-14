import React, { useState } from 'react';

const QuickTrade = ({ selectedPortfolio, marketSymbols, onTradeSubmit }) => {
  const [form, setForm] = useState({
    symbol: '',
    quantity: '',
    price: '',
    type: 'BUY'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onTradeSubmit(form);
    setForm({ symbol: '', quantity: '', price: '', type: 'BUY' });
  };

  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
      <h2 className="text-lg font-bold mb-4 text-white">Quick Trade</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <select
          value={form.symbol}
          onChange={(e) => setForm({ ...form, symbol: e.target.value })}
          className="w-full bg-slate-900 text-white p-2 rounded"
        >
          <option value="">Select Symbol</option>
          {marketSymbols.map(sym => (
            <option key={sym.Symbol} value={sym.Symbol}>{sym.Symbol}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          className="w-full bg-slate-900 text-white p-2 rounded"
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="w-full bg-slate-900 text-white p-2 rounded"
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full bg-slate-900 text-white p-2 rounded"
        >
          <option value="BUY">Buy</option>
          <option value="SELL">Sell</option>
        </select>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
          Submit Order
        </button>
      </form>
    </div>
  );
};

export default QuickTrade;
