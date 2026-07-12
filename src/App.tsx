import React, { useState } from 'react';
import TireInventoryForm from './components/TireInventoryForm';
import InventoryList from './components/InventoryList';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');

  return (
    <div className="app-container">
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          Add Inventory
        </button>
        <button 
          className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          View Inventory
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'form' ? <TireInventoryForm /> : <InventoryList />}
      </div>
    </div>
  );
}

export default App;
