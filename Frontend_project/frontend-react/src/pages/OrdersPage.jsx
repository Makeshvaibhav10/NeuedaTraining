import React from 'react';
import OrderHistory from '../components/orders/OrderHistory';

const OrdersPage = ({ orders }) => {
  return (
    <div className="p-4">
      <OrderHistory orders={orders} />
    </div>
  );
};

export default OrdersPage;
