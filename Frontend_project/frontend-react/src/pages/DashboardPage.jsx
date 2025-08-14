import React from 'react';
import Dashboard from '../components/dashboard/Dashboard';

const DashboardPage = (props) => {
  return (
    <div className="p-4">
      <Dashboard {...props} />
    </div>
  );
};

export default DashboardPage;
