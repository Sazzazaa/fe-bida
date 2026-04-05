import React, { useState, useEffect } from 'react';
import { X, Clock, Plus, Trash2 } from 'lucide-react';
import '../styles/modal.css';

export interface FBItem {
  id: number;
  name: string;
  category: string;
  price: number;
}

export interface OrderedItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface TableActionModalProps {
  tableId: number;
  tableName: string;
  tableType: string;
  startTime: Date;
  initialOrders?: OrderedItem[];
  onClose: () => void;
  onCheckout: (tableId: number, items: OrderedItem[], total: number) => void;
  onSwitchTable?: () => void;
}

const FB_MENU: FBItem[] = [
  { id: 1, name: 'Soft Drinks', category: 'Beverages', price: 3.99 },
  { id: 2, name: 'Beer', category: 'Beverages', price: 5.99 },
  { id: 3, name: 'Coffee', category: 'Beverages', price: 2.49 },
  { id: 4, name: 'Sandwich', category: 'Food', price: 8.99 },
  { id: 5, name: 'Burger', category: 'Food', price: 10.99 },
  { id: 6, name: 'Salad', category: 'Food', price: 9.99 },
  { id: 7, name: 'Fries', category: 'Sides', price: 4.99 },
  { id: 8, name: 'Nachos', category: 'Sides', price: 6.99 },
];

export const TableActionModal: React.FC<TableActionModalProps> = ({
  tableId,
  tableName,
  tableType,
  startTime,
  initialOrders = [],
  onClose,
  onCheckout,
  onSwitchTable,
}) => {
  const [orders, setOrders] = useState<OrderedItem[]>(initialOrders);
  const [elapsedTime, setElapsedTime] = useState('0m 0s');
  const [subtotal, setSubtotal] = useState(0);
  const [showFBMenu, setShowFBMenu] = useState(false);

  // Update elapsed time and subtotal
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsedMs = Date.now() - new Date(startTime).getTime();
      const totalSeconds = Math.floor(elapsedMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const timeStr = hours > 0
        ? `${hours}h ${minutes}m`
        : `${minutes}m ${seconds}s`;

      setElapsedTime(timeStr);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Calculate subtotal
  useEffect(() => {
    const total = orders.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setSubtotal(total);
  }, [orders]);

  const handleAddItem = (item: FBItem) => {
    const existingItem = orders.find((order) => order.id === item.id);

    if (existingItem) {
      setOrders(
        orders.map((order) =>
          order.id === item.id ? { ...order, quantity: order.quantity + 1 } : order
        )
      );
    } else {
      setOrders([
        ...orders,
        {
          id: item.id,
          name: item.name,
          quantity: 1,
          price: item.price,
        },
      ]);
    }
  };

  const handleRemoveItem = (itemId: number) => {
    setOrders(orders.filter((order) => order.id !== itemId));
  };

  const handleQuantityChange = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(itemId);
    } else {
      setOrders(
        orders.map((order) =>
          order.id === itemId ? { ...order, quantity } : order
        )
      );
    }
  };

  const handleCheckout = () => {
    onCheckout(tableId, orders, subtotal);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-section">
            <h2>{tableName}</h2>
            <p className="table-info">{tableType} • Started {new Date(startTime).toLocaleTimeString()}</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Timer Section */}
          <div className="timer-section">
            <div className="timer-display">
              <Clock size={20} />
              <span className="elapsed-time">{elapsedTime}</span>
            </div>
          </div>

          {/* Orders List */}
          <div className="orders-section">
            <h3>Ordered Items</h3>
            {orders.length === 0 ? (
              <p className="empty-orders">No items ordered yet</p>
            ) : (
              <div className="orders-list">
                {orders.map((item) => (
                  <div key={item.id} className="order-line">
                    <div className="order-item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-price">${item.price.toFixed(2)}</span>
                    </div>
                    <div className="order-item-controls">
                      <button
                        className="qty-btn"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                        className="qty-input"
                      />
                      <button
                        className="qty-btn"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <span className="item-total">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* F&B Menu Picker */}
          {showFBMenu && (
            <div className="fb-menu-section">
              <h3>Add F&B Items</h3>
              <div className="menu-grid">
                {FB_MENU.map((item) => (
                  <button
                    key={item.id}
                    className="menu-item"
                    onClick={() => handleAddItem(item)}
                  >
                    <span className="menu-item-name">{item.name}</span>
                    <span className="menu-item-price">${item.price.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          {/* Subtotal */}
          <div className="subtotal-section">
            <span className="subtotal-label">Subtotal (F&B):</span>
            <span className="subtotal-amount">${subtotal.toFixed(2)}</span>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="btn btn-secondary"
              onClick={() => setShowFBMenu(!showFBMenu)}
            >
              <Plus size={18} />
              Order F&B
            </button>

            {onSwitchTable && (
              <button
                className="btn btn-secondary"
                onClick={onSwitchTable}
              >
                Switch Table
              </button>
            )}

            <button
              className="btn btn-primary"
              onClick={handleCheckout}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableActionModal;
