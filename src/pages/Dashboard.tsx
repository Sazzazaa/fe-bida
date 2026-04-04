import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../components/MainLayout';
import TableGrid from '../components/TableGrid';
import type { TableData } from '../components/TableGrid';
import { subscribeTableStatusChange, disconnectSocket } from '../services/socketService';
import { sessionService } from '../services/sessionService';
import { fnbService, type FnbItem } from '../services/fnbService';
import { orderService, type SessionOrder } from '../services/orderService';
import { TABLE_RATE_PER_MINUTE_VND } from '../constants/pricing';
import '../styles/dashboard.css';

interface DashboardProps {
  onLogout?: () => void;
}

interface InvoiceSnapshot {
  sessionId: number;
  tableId: number;
  tableName: string;
  tableType: TableData['type'];
  endedAt: string;
  elapsedSeconds: number;
  tableFee: number;
  fnbFee: number;
  total: number;
  orders: SessionOrder[];
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
  const [lastRealtimeAt, setLastRealtimeAt] = useState('');

  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [modalMode, setModalMode] = useState<'start' | 'playing' | 'order' | 'invoice' | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [invoiceSnapshot, setInvoiceSnapshot] = useState<InvoiceSnapshot | null>(null);

  const [tableSessions, setTableSessions] = useState<Record<number, number>>({});
  const [sessionOrders, setSessionOrders] = useState<Record<number, SessionOrder[]>>({});

  const [menuItems, setMenuItems] = useState<FnbItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState(0);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [now, setNow] = useState(Date.now());

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
        const tableItems: Array<Record<string, unknown>> = tableData.items ?? [];

        const mappedTables: TableData[] = tableItems.map((t) => ({
          id: Number(t.id),
          name: String(t.name ?? ''),
          type: (t.tableTypeName as TableData['type']) ?? 'Pool',
          status:
            t.status === 'AVAILABLE' ? 'available' :
            t.status === 'RESERVED' ? 'reserved' :
            t.status === 'IN_USE' ? 'playing' :
            t.status === 'PAUSED' ? 'playing' :
            t.status === 'MAINTENANCE' ? 'maintenance' :
            'available',
          elapsedSeconds: undefined,
          billAmount: undefined,
          fnbAmount: undefined,
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
        const orderItems: Array<Record<string, unknown>> = orderData.items ?? [];

        const mappedOrders = orderItems.map((o) => ({
          id: Number(o.id),
          tableName: String(o.tableName ?? `Table ${o.tableId}`),
          totalAmount: o.totalAmount ? Number(o.totalAmount) : 0,
          status: String(o.status ?? 'UNKNOWN'),
          orderedAt: o.orderedAt ? new Date(String(o.orderedAt)).toLocaleString() : '',
        }));

        setRecentOrders(mappedOrders);
      } catch (error: unknown) {
        setFetchError(error instanceof Error ? error.message : 'Fetch error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTables();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const mapStatus = (status: string): TableData['status'] => {
      const value = status.trim().toLowerCase();
      if (value === 'available') return 'available';
      if (value === 'reserved') return 'reserved';
      if (value === 'maintenance') return 'maintenance';
      if (value === 'in_use' || value === 'playing' || value === 'paused') return 'playing';
      return 'available';
    };

    const unsubscribe = subscribeTableStatusChange((payload) => {
      setTables((prevTables) => {
        const index = prevTables.findIndex((t) => t.id === payload.tableId);
        const nextStatus = mapStatus(payload.status);

        if (index === -1) {
          return [
            ...prevTables,
            {
              id: payload.tableId,
              name: payload.name ?? `Table ${payload.tableId}`,
              type: payload.type ?? 'Pool',
              status: nextStatus,
              startTime: payload.startedAt,
              elapsedSeconds: payload.elapsedSeconds,
              billAmount: payload.billAmount,
              fnbAmount: 0,
            },
          ];
        }

        return prevTables.map((table) => {
          if (table.id !== payload.tableId) return table;
          return {
            ...table,
            status: nextStatus,
            name: payload.name ?? table.name,
            type: payload.type ?? table.type,
            startTime: payload.startedAt ?? table.startTime,
            elapsedSeconds: payload.elapsedSeconds ?? table.elapsedSeconds,
            billAmount: payload.billAmount ?? table.billAmount,
          };
        });
      });

      setLastRealtimeAt(new Date().toLocaleTimeString());
    });

    return () => {
      unsubscribe();
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    if (!selectedTable) return;
    const latest = tables.find((table) => table.id === selectedTable.id);
    if (latest) setSelectedTable(latest);
  }, [tables, selectedTable]);

  const getSessionIdByTable = (tableId: number) => tableSessions[tableId] ?? tableId + 10000;

  const getElapsedSeconds = (table: TableData) => {
    if (!table.startTime) return table.elapsedSeconds ?? 0;
    const startAt = new Date(table.startTime).getTime();
    return Math.max(0, Math.floor((now - startAt) / 1000));
  };

  const formatElapsed = (seconds: number) => {
    const hh = Math.floor(seconds / 3600);
    const mm = Math.floor((seconds % 3600) / 60);
    const ss = seconds % 60;
    return [hh, mm, ss].map((value) => String(value).padStart(2, '0')).join(':');
  };

  const formatMoney = (amount: number) => (
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount)
  );

  const getTableFee = (table: TableData) => {
    return (getElapsedSeconds(table) / 60) * TABLE_RATE_PER_MINUTE_VND;
  };

  const closeModal = () => {
    if (modalMode === 'invoice') return;
    setSelectedTable(null);
    setModalMode(null);
    setModalError('');
    setInvoiceSnapshot(null);
  };

  const openTableModal = async (table: TableData) => {
    setSelectedTable(table);
    setModalError('');
    setInvoiceSnapshot(null);

    if (table.status === 'available') {
      setModalMode('start');
      return;
    }

    if (table.status !== 'playing') {
      return;
    }

    setModalMode('playing');
    const sessionId = getSessionIdByTable(table.id);
    setTableSessions((prev) => ({ ...prev, [table.id]: sessionId }));

    try {
      const orders = await orderService.getBySessionId(sessionId);
      setSessionOrders((prev) => ({ ...prev, [table.id]: orders }));

      const fnbAmount = orders.reduce((sum, item) => sum + item.totalAmount, 0);
      setTables((prev) => prev.map((row) => (
        row.id === table.id ? { ...row, fnbAmount } : row
      )));
    } catch {
      setModalError('Cannot load order list for this table.');
    }
  };

  const handleStartSession = async () => {
    if (!selectedTable) return;

    setModalLoading(true);
    setModalError('');

    try {
      const session = await sessionService.startSession(selectedTable.id);
      setTableSessions((prev) => ({ ...prev, [selectedTable.id]: session.sessionId }));
      setSessionOrders((prev) => ({ ...prev, [selectedTable.id]: [] }));

      setTables((prev) => prev.map((table) => {
        if (table.id !== selectedTable.id) return table;
        return {
          ...table,
          status: 'playing',
          startTime: session.startedAt,
          elapsedSeconds: 0,
          billAmount: undefined,
          fnbAmount: 0,
        };
      }));

      setModalMode('playing');
      setInvoiceSnapshot(null);
    } catch {
      setModalError('Cannot start this table now.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenOrderForm = async () => {
    setModalMode('order');
    setModalError('');

    try {
      if (menuItems.length === 0) {
        const items = await fnbService.getAll();
        setMenuItems(items);
        if (items.length > 0) {
          setSelectedItemId(items[0].id);
        }
      }
    } catch {
      setModalError('Cannot load F&B menu.');
    }
  };

  const handleCreateOrder = async () => {
    if (!selectedTable || selectedItemId <= 0 || orderQuantity <= 0) return;

    setModalLoading(true);
    setModalError('');

    try {
      const sessionId = getSessionIdByTable(selectedTable.id);
      const order = await orderService.create(sessionId, selectedItemId, orderQuantity);

      let nextOrders: SessionOrder[] = [];
      setSessionOrders((prev) => {
        nextOrders = [...(prev[selectedTable.id] ?? []), order];
        return {
          ...prev,
          [selectedTable.id]: nextOrders,
        };
      });

      const nextFnbAmount = nextOrders.reduce((sum, item) => sum + item.totalAmount, 0);
      setTables((prev) => prev.map((table) => (
        table.id === selectedTable.id ? { ...table, fnbAmount: nextFnbAmount } : table
      )));

      setOrderQuantity(1);
      setModalMode('playing');
    } catch (error: unknown) {
      setModalError(error instanceof Error ? error.message : 'Cannot create order.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!selectedTable) return;

    setModalLoading(true);
    setModalError('');

    try {
      const sessionId = getSessionIdByTable(selectedTable.id);
      const ended = await sessionService.endSession(sessionId);
      const elapsedSeconds = getElapsedSeconds(selectedTable);
      const tableFee = getTableFee(selectedTable);
      const orders = [...selectedTableOrders];
      const fnbFee = orders.reduce((sum, item) => sum + item.totalAmount, 0);

      setInvoiceSnapshot({
        sessionId,
        tableId: selectedTable.id,
        tableName: selectedTable.name,
        tableType: selectedTable.type,
        endedAt: ended.endedAt,
        elapsedSeconds,
        tableFee,
        fnbFee,
        total: tableFee + fnbFee,
        orders,
      });
      setModalMode('invoice');
    } catch {
      setModalError('Cannot end session. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleConfirmInvoice = () => {
    if (!invoiceSnapshot) return;

    const tableId = invoiceSnapshot.tableId;

    setTables((prev) => prev.map((table) => {
      if (table.id !== tableId) return table;
      return {
        ...table,
        status: 'available',
        startTime: undefined,
        elapsedSeconds: 0,
        billAmount: undefined,
        fnbAmount: 0,
      };
    }));

    setSessionOrders((prev) => ({ ...prev, [tableId]: [] }));
    setTableSessions((prev) => {
      const next = { ...prev };
      delete next[tableId];
      return next;
    });

    setInvoiceSnapshot(null);
    setSelectedTable(null);
    setModalMode(null);
    setModalError('');
  };

  const stats = useMemo(() => {
    const availableCount = tables.filter((table) => table.status === 'available').length;
    const playingCount = tables.filter((table) => table.status === 'playing').length;
    const reservedCount = tables.filter((table) => table.status === 'reserved').length;
    const maintenanceCount = tables.filter((table) => table.status === 'maintenance').length;

    return [
      { label: 'Available', value: `${availableCount}`, color: 'green' },
      { label: 'Playing', value: `${playingCount}`, color: 'red' },
      { label: 'Reserved', value: `${reservedCount}`, color: 'yellow' },
      { label: 'Maintenance', value: `${maintenanceCount}`, color: 'grey' },
    ];
  }, [tables]);

  const selectedTableOrders = selectedTable ? (sessionOrders[selectedTable.id] ?? []) : [];
  const selectedTableFee = selectedTable ? getTableFee(selectedTable) : 0;
  const selectedFnbFee = selectedTableOrders.reduce((sum, item) => sum + item.totalAmount, 0);
  const selectedTotal = selectedTableFee + selectedFnbFee;

  return (
    <MainLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onLogout={onLogout}
      userName="John Doe"
      userRole="Floor Manager"
    >
      <div className="dashboard-container">
        <div className="welcome-section">
          <div>
            <h1>Home - Floor Map</h1>
            <p>Main table board for current session monitoring</p>
          </div>
          <div className="time-display">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className={`stat-card ${stat.color}`}>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="dashboard-card full-width">
          <div className="floor-map-header">
            <h2>Floor Map - Live Table Status</h2>
            <div className="status-legend">
              {lastRealtimeAt && <span className="legend-sync">Updated: {lastRealtimeAt}</span>}
              <span className="legend-item available">Available</span>
              <span className="legend-item playing">Playing</span>
              <span className="legend-item reserved">Reserved</span>
              <span className="legend-item maintenance">Maintenance</span>
            </div>
          </div>

          {isLoading && <div className="state-banner loading">Loading tables...</div>}
          {fetchError && <div className="state-banner error">{fetchError}</div>}
          {!isLoading && !fetchError && <TableGrid tables={tables} onTableClick={openTableModal} />}
        </div>

        <div className="dashboard-sections">
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

          <div className="dashboard-card">
            <h2>Recent Orders</h2>
            <div className="orders-list">
              {recentOrders.length === 0 && <p>No recent orders found.</p>}
              {recentOrders.map((order) => (
                <div key={order.id} className="order-item">
                  <div className="order-info">
                    <div className="order-table">{order.tableName}</div>
                    <div className="order-details">{formatMoney(order.totalAmount)}</div>
                  </div>
                  <div className="order-meta">
                    <span className={`order-status ${order.status.toLowerCase().replace(' ', '-')}`}>
                      {order.status}
                    </span>
                    <span className="order-time">{order.orderedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedTable && modalMode && (
        <div
          className="dashboard-modal-backdrop"
          onClick={modalMode === 'invoice' ? undefined : closeModal}
        >
          <div className="dashboard-modal" onClick={(event) => event.stopPropagation()}>
            <div className="dashboard-modal-header">
              <h3>{selectedTable.name} · {selectedTable.type}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={modalMode === 'invoice' ? handleConfirmInvoice : closeModal}
              >
                ×
              </button>
            </div>

            {modalError && <div className="state-banner error">{modalError}</div>}

            {modalMode === 'start' && (
              <div className="modal-section">
                <p>Open this available table and start a session?</p>
                <div className="modal-actions">
                  <button type="button" className="modal-btn ghost" onClick={closeModal}>Cancel</button>
                  <button type="button" className="modal-btn primary" onClick={handleStartSession} disabled={modalLoading}>
                    {modalLoading ? 'Opening...' : 'Open Table'}
                  </button>
                </div>
              </div>
            )}

            {modalMode === 'playing' && (
              <>
                <div className="modal-summary-grid">
                  <div className="summary-card">
                    <span>Elapsed Time</span>
                    <strong>{formatElapsed(getElapsedSeconds(selectedTable))}</strong>
                  </div>
                  <div className="summary-card">
                    <span>Table Fee</span>
                    <strong>{formatMoney(selectedTableFee)}</strong>
                  </div>
                  <div className="summary-card">
                    <span>F&B Total</span>
                    <strong>{formatMoney(selectedFnbFee)}</strong>
                  </div>
                  <div className="summary-card">
                    <span>Temporary Bill</span>
                    <strong>{formatMoney(selectedTotal)}</strong>
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

            {modalMode === 'invoice' && invoiceSnapshot && (
              <>
                <div className="modal-section invoice-meta">
                  <p><strong>Invoice Time:</strong> {new Date(invoiceSnapshot.endedAt).toLocaleString()}</p>
                  <p><strong>Session:</strong> #{invoiceSnapshot.sessionId}</p>
                  <p><strong>Duration:</strong> {formatElapsed(invoiceSnapshot.elapsedSeconds)}</p>
                </div>

                <div className="modal-summary-grid">
                  <div className="summary-card">
                    <span>Table Fee</span>
                    <strong>{formatMoney(invoiceSnapshot.tableFee)}</strong>
                  </div>
                  <div className="summary-card">
                    <span>F&B Fee</span>
                    <strong>{formatMoney(invoiceSnapshot.fnbFee)}</strong>
                  </div>
                </div>

                <div className="modal-section">
                  <h4>F&B Details</h4>
                  {invoiceSnapshot.orders.length === 0 ? (
                    <p className="empty-text">No F&B ordered in this session.</p>
                  ) : (
                    <div className="order-line-list">
                      {invoiceSnapshot.orders.map((item) => (
                        <div key={item.id} className="order-line-item">
                          <span>{item.itemName} × {item.quantity}</span>
                          <strong>{formatMoney(item.totalAmount)}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="invoice-total">
                  <span>Total Amount</span>
                  <strong>{formatMoney(invoiceSnapshot.total)}</strong>
                </div>

                <div className="modal-actions">
                  <button type="button" className="modal-btn primary" onClick={handleConfirmInvoice}>
                    Xac nhan
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
