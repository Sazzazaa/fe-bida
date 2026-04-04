import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import TableGrid from '../components/TableGrid';
import type { TableData } from '../components/TableGrid';
import '../styles/dashboard.css';

interface DashboardProps {
  onLogout?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout = () => {} }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [tables, setTables] = useState<TableData[]>([]);
  const [recentOrders, setRecentOrders] = useState<Array<{
    id: number;
    tableName: string;
    totalAmount: number;
    status: string;
    orderedAt: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const fetchTables = async () => {
      setIsLoading(true);
      setFetchError('');

      try {
        const token = localStorage.getItem('accessToken');

        const tableResponse = await fetch('http://localhost:8080/api/v1/tables?page=0&size=50', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
        });

        if (!tableResponse.ok) {
          if (tableResponse.status === 401 || tableResponse.status === 403) {
            throw new Error('Please login as STAFF or ADMIN to view tables.');
          }
          const errorBody = await tableResponse.json().catch(() => ({}));
          throw new Error(errorBody?.message || 'Cannot fetch tables');
        }

        const tableData = await tableResponse.json();
        const tableItems = tableData.items ?? [];

        const mappedTables: TableData[] = tableItems.map((t: any) => ({
          id: t.id,
          name: t.name,
          type: t.tableTypeName ?? 'Pool',
          status:
            t.status === 'AVAILABLE' ? 'available' :
            t.status === 'RESERVED' ? 'reserved' :
            t.status === 'IN_USE' ? 'playing' :
            t.status === 'PAUSED' ? 'playing' :
            t.status === 'MAINTENANCE' ? 'maintenance' :
            'available',
          elapsedSeconds: undefined,
          billAmount: undefined,
          startTime: undefined,
        }));

        setTables(mappedTables);

        const orderResponse = await fetch('http://localhost:8080/api/v1/orders?page=0&size=5&sortBy=orderedAt&direction=DESC', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
        });

        if (!orderResponse.ok) {
          if (orderResponse.status === 401 || orderResponse.status === 403) {
            throw new Error('Please login as STAFF or ADMIN to view orders.');
          }
          const errorBody = await orderResponse.json().catch(() => ({}));
          throw new Error(errorBody?.message || 'Cannot fetch orders');
        }

        const orderData = await orderResponse.json();
        const orderItems = orderData.items ?? [];

        const mappedOrders = orderItems.map((o: any) => ({
          id: o.id,
          tableName: o.tableName || `Table ${o.tableId}`,
          totalAmount: o.totalAmount ? Number(o.totalAmount) : 0,
          status: o.status ?? 'UNKNOWN',
          orderedAt: o.orderedAt ? new Date(o.orderedAt).toLocaleString() : '',
        }));

        setRecentOrders(mappedOrders);
      } catch (error: any) {
        setFetchError(error.message || 'Fetch error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTables();
  }, []);

  const activeTableCount = tables.filter((table) => table.status === 'playing' || table.status === 'reserved').length;
  const stats = [
    { label: 'Active Tables', value: `${activeTableCount}`, change: activeTableCount > 0 ? `+${activeTableCount}` : '0', color: 'blue' },
    { label: 'Total Revenue', value: '$2,450', change: '+12%', color: 'green' },
    { label: 'Recent Orders', value: `${recentOrders.length}`, change: recentOrders.length > 0 ? `+${recentOrders.length}` : '0', color: 'purple' },
    { label: 'Staff On Duty', value: '6', change: 'All Good', color: 'cyan' },
  ];

  return (
    <MainLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onLogout={onLogout}
      userName="John Doe"
      userRole="Floor Manager"
    >
      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div>
            <h1>Home - Floor Map</h1>
            <p>Main table board for current session monitoring</p>
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
            </div>
          ))}
        </div>

        {/* Floor Map - Table Grid */}
        <div className="dashboard-card full-width">
          <h2>Floor Map - Live Table Status</h2>

          {isLoading && <p>Loading tables...</p>}
          {fetchError && <p style={{ color: 'var(--error)' }}>{fetchError}</p>}
          {!isLoading && !fetchError && <TableGrid tables={tables} />}
        </div>

        {/* Content Sections */}
        <div className="dashboard-sections">
          {/* Active Tables Section - Hidden on large screens */}
          <div className="dashboard-card">
            <h2>Active Tables</h2>
            <div className="tables-preview">
              {tables.length === 0 && <p>No tables loaded yet.</p>}
              {tables.map((table) => (
                <div
                  key={table.id}
                  className={`table-item ${table.status === 'playing' ? 'active' : table.status === 'reserved' ? 'reserved' : 'available'}`}
                >
                  <span className="table-number">{table.name}</span>
                  <span className="table-status">{table.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders Section */}
          <div className="dashboard-card">
            <h2>Recent Orders</h2>
            <div className="orders-list">
              {recentOrders.length === 0 && <p>No recent orders found.</p>}
              {recentOrders.map((order) => (
                <div key={order.id} className="order-item">
                  <div className="order-info">
                    <div className="order-table">{order.tableName}</div>
                    <div className="order-details">${order.totalAmount.toFixed(2)}</div>
                  </div>
                  <div className="order-meta">
                    <span className={`order-status ${order.status.toLowerCase().replace(' ', '-')}`}>
                      {order.status}
                    </span>
                    <span className="order-time">{order.orderedAt}</span>
                  </div>
                </div>

                <div className="modal-section">
                  <h4>Ordered F&B</h4>
                  {selectedTableOrders.length === 0 ? (
                    <p className="empty-text">No F&B order for this session yet.</p>
                  ) : (
                    <div className="order-line-list">
                      {selectedTableOrders.map((item) => (
                        <div key={item.id} className="order-line-item">
                          <span>{item.itemName} × {item.quantity}</span>
                          <strong>{formatMoney(item.totalAmount)}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="modal-actions">
                  <button type="button" className="modal-btn ghost" onClick={closeModal}>Close</button>
                  <button type="button" className="modal-btn secondary" onClick={handleOpenOrderForm}>Order F&B</button>
                  <button type="button" className="modal-btn danger" onClick={handleEndSession} disabled={modalLoading}>
                    {modalLoading ? 'Processing...' : 'Tinh tien'}
                  </button>
                </div>
              </>
            )}

            {modalMode === 'order' && (
              <>
                <div className="modal-section">
                  <h4>Create F&B Order</h4>
                  <div className="modal-field">
                    <label htmlFor="fnb-item">Menu Item</label>
                    <select
                      id="fnb-item"
                      value={selectedItemId}
                      onChange={(event) => setSelectedItemId(Number(event.target.value))}
                    >
                      {menuItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({formatMoney(item.price)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="modal-field">
                    <label htmlFor="order-quantity">Quantity</label>
                    <input
                      id="order-quantity"
                      type="number"
                      min={1}
                      max={20}
                      value={orderQuantity}
                      onChange={(event) => setOrderQuantity(Number(event.target.value))}
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="modal-btn ghost" onClick={() => setModalMode('playing')}>Back</button>
                  <button
                    type="button"
                    className="modal-btn primary"
                    onClick={handleCreateOrder}
                    disabled={modalLoading || selectedItemId <= 0 || orderQuantity <= 0}
                  >
                    {modalLoading ? 'Adding...' : 'Add to Session'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Dashboard;
