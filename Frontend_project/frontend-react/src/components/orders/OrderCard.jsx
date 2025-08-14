import React from 'react';

const OrderCard = ({ order }) => {
  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
      <h3 className="text-lg font-bold text-white">{order.symbol}</h3>
      <p className="text-slate-300">
        {order.type} — Qty: {order.quantity} @ {order.price}
      </p>
      <p className="text-slate-400 text-sm">
        Status: {order.status} | Date: {order.date || order.timeStamp}
      </p>
    </div>
  );
};

export default OrderCard;
