import React, { useState } from 'react';
import Dashboard from './Dashboard.jsx';
import StockDashboard from './StockDashboard.jsx';

// Navigation Component
const Navigation = ({ currentRoute, setCurrentRoute }) => {
  const navStyle = {
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '0 20px'
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '64px',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const buttonStyle = (isActive) => ({
    padding: '8px 16px',
    marginLeft: '10px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: isActive ? '#dbeafe' : 'transparent',
    color: isActive ? '#1d4ed8' : '#666',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  });

  return (
    <nav style={navStyle}>
      <div style={containerStyle}>
        <h1 style={{ color: '#333', fontSize: '20px', fontWeight: 'bold' }}>KickTheByte</h1>
        <div>
          <button
            onClick={() => setCurrentRoute('dashboard')}
            style={buttonStyle(currentRoute === 'dashboard')}
          >
            Dashboard
          </button>
          
        </div>
      </div>
    </nav>
  );
};

// Main App Component
const App = () => {
  const [currentRoute, setCurrentRoute] = useState('dashboard');

  const renderCurrentRoute = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <Dashboard />;
      
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App">
      <Navigation currentRoute={currentRoute} setCurrentRoute={setCurrentRoute} />
      <div>
        {renderCurrentRoute()}
      </div>
    </div>
  );
};

export default App;