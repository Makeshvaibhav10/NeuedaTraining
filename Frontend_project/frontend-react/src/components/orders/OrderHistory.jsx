import React from 'react';
import OrderCard from './OrderCard';

const OrderHistory = ({ orders }) => {
  if (!orders || orders.length === 0) {
    return <p className="text-slate-300">No orders found.</p>;
  }

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
};

export default OrderHistory;
