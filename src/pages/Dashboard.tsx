import React from 'react';
import MainLayout from '../components/MainLayout';
import TableGrid from '../components/TableGrid';
import '../styles/dashboard.css';

interface DashboardProps {
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout = () => {}, onNavigate = () => {} }) => {

  const stats = [
    { label: 'Active Tables', value: '8', change: '+2', color: 'blue' },
    { label: 'Total Revenue', value: '$2,450', change: '+12%', color: 'green' },
    { label: 'Orders Today', value: '42', change: '+8', color: 'purple' },
    { label: 'Staff On Duty', value: '6', change: 'All Good', color: 'cyan' },
  ];

  return (
    <MainLayout
      currentPage="dashboard"
      onNavigate={onNavigate}
      onLogout={onLogout}
      userName="John Doe"
      userRole="Floor Manager"
    >
      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div>
            <h1>Welcome back, John</h1>
            <p>Here&apos;s your billiard club overview for today</p>
          </div>
          <div className="time-display">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className={`stat-card ${stat.color}`}>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-change">{stat.change}</div>
            </div>
          ))}
        </div>

        {/* Floor Map - Table Grid */}
        <div className="dashboard-card full-width">
          <h2>Floor Map - Live Table Status</h2>
          <TableGrid />
        </div>

        {/* Content Sections */}
        <div className="dashboard-sections">
          {/* Active Tables Section - Hidden on large screens */}
          <div className="dashboard-card">
            <h2>Active Tables</h2>
            <div className="tables-preview">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((table) => (
                <div
                  key={table}
                  className={`table-item ${table % 3 === 0 ? 'active' : 'available'}`}
                >
                  <span className="table-number">Table {table}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders Section */}
          <div className="dashboard-card">
            <h2>Recent Orders</h2>
            <div className="orders-list">
              {[
                { id: 1, table: 3, order: 'Drinks x2, Snacks', time: '5 min ago', status: 'Preparing' },
                { id: 2, table: 5, order: 'Sandwich combo', time: '12 min ago', status: 'Ready' },
                { id: 3, table: 7, order: 'Smoothie x3', time: '18 min ago', status: 'Delivered' },
              ].map((order) => (
                <div key={order.id} className="order-item">
                  <div className="order-info">
                    <div className="order-table">Table {order.table}</div>
                    <div className="order-details">{order.order}</div>
                  </div>
                  <div className="order-meta">
                    <span className={`order-status ${order.status.toLowerCase().replace(' ', '-')}`}>
                      {order.status}
                    </span>
                    <span className="order-time">{order.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-button">
              <div className="action-icon">📊</div>
              <span>View Full Reports</span>
            </button>
            <button className="action-button">
              <div className="action-icon">🍽️</div>
              <span>Manage F&B</span>
            </button>
            <button className="action-button">
              <div className="action-icon">🪑</div>
              <span>Table Settings</span>
            </button>
            <button className="action-button">
              <div className="action-icon">👥</div>
              <span>Staff Status</span>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
