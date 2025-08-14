import React from 'react';

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'portfolios', label: 'Portfolios' },
  { id: 'market', label: 'Market' },
  { id: 'orders', label: 'Orders' },
  { id: 'holdings', label: 'Holdings' }
];

const Navigation = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="flex space-x-4">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-3 py-2 rounded ${
            activeTab === tab.id
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
