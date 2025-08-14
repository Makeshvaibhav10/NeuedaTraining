import React from 'react';
import HoldingsView from '../components/holdings/HoldingsView';

const HoldingsPage = ({ stocks }) => {
  return (
    <div className="p-4">
      <HoldingsView stocks={stocks} />
    </div>
  );
};

export default HoldingsPage;
