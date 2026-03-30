import React from 'react';
import LiveFeed from './components/LiveFeed';
import DailyTrafficChart from './components/Charts/DailyTrafficChart';
import FunnelChart from './components/Charts/FunnelChart';
import PeakHoursChart from './components/Charts/PeakHoursChart';
import ConversionMetrics from './components/Charts/ConversionMetrics';
import Filters from './components/Filters';
import './AdminDashboard.css';

function AdminDashboard() {
  const [filters, setFilters] = React.useState({});

  const handleFilter = (filterData) => {
    setFilters(filterData);
    console.log('Applied filters:', filterData);
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>🍔 Food Order - Traffic Monitoring Dashboard</h1>
        <p>Real-time user analytics and conversion tracking</p>
      </header>

      <main className="dashboard-content">
        <Filters onFilter={handleFilter} />

        <div className="dashboard-grid">
          <div className="grid-item full">
            <LiveFeed />
          </div>

          <div className="grid-item">
            <ConversionMetrics />
          </div>

          <div className="grid-item">
            <DailyTrafficChart />
          </div>

          <div className="grid-item">
            <FunnelChart />
          </div>

          <div className="grid-item full">
            <PeakHoursChart />
          </div>
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>Last updated: {new Date().toLocaleString()}</p>
      </footer>
    </div>
  );
}

export default AdminDashboard;