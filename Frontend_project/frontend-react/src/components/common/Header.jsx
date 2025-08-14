import React from 'react';
import Navigation from './Navigation';

const Header = ({ activeTab, setActiveTab }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-700 p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-white">Portfolio Management System</h1>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </header>
  );
};

export default Header;
