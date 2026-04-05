import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Calendar } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import '../styles/analytics.css';

interface RevenueData {
  date: string;
  revenue: number;
  sessions: number;
}

interface TopTableData {
  name: string;
  hours: number;
  revenue: number;
}

interface TopFBData {
  name: string;
  orders: number;
  revenue: number;
}

export const RevenueAnalytics: React.FC<{ onNavigate?: (page: string) => void; onLogout?: () => void }> = ({
  onNavigate = () => {},
  onLogout = () => {},
}) => {
  const [dateRange, setDateRange] = useState({ start: '2024-03-06', end: '2024-04-05' });

  // Mock revenue data for 30 days
  const revenueData: RevenueData[] = [
    { date: 'Mar 6', revenue: 1240, sessions: 12 },
    { date: 'Mar 7', revenue: 1650, sessions: 15 },
    { date: 'Mar 8', revenue: 1420, sessions: 13 },
    { date: 'Mar 9', revenue: 1890, sessions: 18 },
    { date: 'Mar 10', revenue: 2100, sessions: 20 },
    { date: 'Mar 11', revenue: 1750, sessions: 16 },
    { date: 'Mar 12', revenue: 1950, sessions: 19 },
    { date: 'Mar 13', revenue: 2250, sessions: 22 },
    { date: 'Mar 14', revenue: 2050, sessions: 21 },
    { date: 'Mar 15', revenue: 1820, sessions: 17 },
    { date: 'Mar 16', revenue: 2350, sessions: 23 },
    { date: 'Mar 17', revenue: 2180, sessions: 20 },
    { date: 'Mar 18', revenue: 2400, sessions: 24 },
    { date: 'Mar 19', revenue: 2150, sessions: 21 },
    { date: 'Mar 20', revenue: 1950, sessions: 18 },
    { date: 'Mar 21', revenue: 2300, sessions: 22 },
    { date: 'Mar 22', revenue: 2050, sessions: 20 },
    { date: 'Mar 23', revenue: 2150, sessions: 21 },
    { date: 'Mar 24', revenue: 2400, sessions: 23 },
    { date: 'Mar 25', revenue: 2250, sessions: 22 },
    { date: 'Mar 26', revenue: 2100, sessions: 20 },
    { date: 'Mar 27', revenue: 2350, sessions: 23 },
    { date: 'Mar 28', revenue: 2200, sessions: 21 },
    { date: 'Mar 29', revenue: 2150, sessions: 20 },
    { date: 'Mar 30', revenue: 2400, sessions: 24 },
    { date: 'Mar 31', revenue: 2300, sessions: 22 },
    { date: 'Apr 1', revenue: 2450, sessions: 25 },
    { date: 'Apr 2', revenue: 2350, sessions: 23 },
    { date: 'Apr 3', revenue: 2200, sessions: 21 },
    { date: 'Apr 4', revenue: 2500, sessions: 26 },
    { date: 'Apr 5', revenue: 2450, sessions: 25 },
  ];

  const topTables: TopTableData[] = [
    { name: 'Table 12', hours: 145, revenue: 2175 },
    { name: 'Table 02', hours: 138, revenue: 2070 },
    { name: 'Table 08', hours: 132, revenue: 1980 },
    { name: 'Table 05', hours: 128, revenue: 1920 },
    { name: 'Table 11', hours: 121, revenue: 1815 },
  ];

  const topFBItems: TopFBData[] = [
    { name: 'Bia Saigon', orders: 285, revenue: 855 },
    { name: 'Bia Tiger', orders: 268, revenue: 804 },
    { name: 'Sandwich', orders: 142, revenue: 1065 },
    { name: 'Noodle Soup', orders: 128, revenue: 832 },
    { name: 'Spring Rolls', orders: 115, revenue: 575 },
  ];

  // Calculate metrics
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalSessions = revenueData.reduce((sum, d) => sum + d.sessions, 0);
  const avgSessionRevenue = (totalRevenue / totalSessions).toFixed(2);

  const stats = [
    { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, change: '+18%', icon: '💰' },
    { label: 'Total Sessions', value: totalSessions.toString(), change: '+12%', icon: '🎱' },
    { label: 'Avg Session Revenue', value: `$${avgSessionRevenue}`, change: '+5%', icon: '📈' },
    { label: 'Best Performing Table', value: 'Table 12', change: '$2,175', icon: '🏆' },
  ];

  return (
    <MainLayout
      currentPage="analytics"
      onNavigate={onNavigate}
      onLogout={onLogout}
      userName="John Doe"
      userRole="Admin"
    >
      <div className="analytics-container">
        {/* Header */}
        <div className="analytics-header">
          <div>
            <h1>Revenue Analytics</h1>
            <p>Performance metrics and financial overview</p>
          </div>
          <div className="date-range-picker">
            <Calendar size={20} />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="date-input"
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="date-input"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-change">{stat.change}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          {/* Revenue Trend Chart */}
          <div className="chart-card full-width">
            <h2>30-Day Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--text)" />
                <YAxis stroke="var(--text)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: 'var(--text-h)' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Daily Revenue ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Tables */}
          <div className="chart-card">
            <h2>Top 5 Tables</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topTables}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text)" />
                <YAxis stroke="var(--text)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: 'var(--text-h)' }}
                />
                <Legend />
                <Bar
                  dataKey="hours"
                  fill="#3b82f6"
                  name="Hours"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top F&B Items */}
          <div className="chart-card">
            <h2>Top F&B Items</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topFBItems}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text)" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="var(--text)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: 'var(--text-h)' }}
                />
                <Legend />
                <Bar
                  dataKey="orders"
                  fill="#f59e0b"
                  name="Orders"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Tables */}
        <div className="detailed-tables">
          <div className="detail-table-card">
            <h3>Top Performing Tables (by Revenue)</h3>
            <table className="detail-table">
              <thead>
                <tr>
                  <th>Table</th>
                  <th>Hours Played</th>
                  <th>Revenue</th>
                  <th>Avg/Hour</th>
                </tr>
              </thead>
              <tbody>
                {topTables.map((table, idx) => (
                  <tr key={idx}>
                    <td>{table.name}</td>
                    <td>{table.hours}h</td>
                    <td className="revenue-value">${table.revenue}</td>
                    <td>${(table.revenue / table.hours).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="detail-table-card">
            <h3>Top F&B Items (by Orders)</h3>
            <table className="detail-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                  <th>Avg Price</th>
                </tr>
              </thead>
              <tbody>
                {topFBItems.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>{item.orders}</td>
                    <td className="revenue-value">${item.revenue}</td>
                    <td>${(item.revenue / item.orders).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RevenueAnalytics;
