import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import '../styles/table-action-modal.css';

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface TableActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: number;
  tableName: string;
  tableStatus: string;
  elapsedTime?: string;
  billAmount?: number;
  onAddFB?: () => void;
  onOrderAdd?: (items: OrderItem[]) => void;
  onCheckout?: () => void;
  onSwitchTable?: () => void;
}

export const TableActionModal: React.FC<TableActionModalProps> = ({
  isOpen,
  onClose,
  tableName,
  tableStatus,
  elapsedTime,
  billAmount,
  onAddFB,
  onOrderAdd,
  onCheckout,
  onSwitchTable,
}) => {
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [showFBModal, setShowFBModal] = useState(false);

  const handleAddItem = (item: OrderItem) => {
    const existing = currentOrder.find(o => o.id === item.id);
    if (existing) {
      setCurrentOrder(
        currentOrder.map(o =>
          o.id === item.id ? { ...o, quantity: o.quantity + 1 } : o
        )
      );
    } else {
      setCurrentOrder([...currentOrder, { ...item, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (itemId: number) => {
    setCurrentOrder(currentOrder.filter(o => o.id !== itemId));
  };

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
    } else {
      setCurrentOrder(
        currentOrder.map(o =>
          o.id === itemId ? { ...o, quantity: newQuantity } : o
        )
      );
    }
  };

  const totalFBAmount = currentOrder.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalBill = (billAmount || 0) + totalFBAmount;

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="table-action-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>{tableName}</h2>
            <p className="table-status-info">Status: {tableStatus}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Table Info */}
        {tableStatus === 'playing' && (
          <div className="table-info-section">
            <div className="info-item">
              <span className="info-label">Time Elapsed</span>
              <span className="info-value">{elapsedTime || '0m'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Current Bill</span>
              <span className="info-value">${(billAmount || 0).toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Current Order */}
        {currentOrder.length > 0 && (
          <div className="order-section">
            <h3>Current Order</h3>
            <div className="order-items">
              {currentOrder.map(item => (
                <div key={item.id} className="order-item">
                  <div className="item-details">
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">${item.price.toFixed(2)}</div>
                  </div>
                  <div className="item-quantity-control">
                    <button
                      className="qty-btn"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="item-total">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bill Summary */}
        <div className="bill-summary">
          <div className="summary-row">
            <span>Table Bill</span>
            <span>${(billAmount || 0).toFixed(2)}</span>
          </div>
          {totalFBAmount > 0 && (
            <div className="summary-row">
              <span>F&B Total</span>
              <span>${totalFBAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row total">
            <span>Total Amount</span>
            <span>${totalBill.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="modal-actions">
          <button
            className="action-btn secondary"
            onClick={() => {
              setShowFBModal(true);
              onAddFB?.();
            }}
          >
            <ShoppingCart size={18} />
            Add F&B
          </button>
          
          {tableStatus === 'playing' && (
            <>
              <button
                className="action-btn secondary"
                onClick={onSwitchTable}
              >
                Switch Table
              </button>
              <button
                className="action-btn primary"
                onClick={onCheckout}
              >
                Complete & Checkout
              </button>
            </>
          )}

          {tableStatus === 'available' && (
            <button
              className="action-btn primary"
              onClick={() => {
                if (onOrderAdd && currentOrder.length > 0) {
                  onOrderAdd(currentOrder);
                  setCurrentOrder([]);
                  onClose();
                }
              }}
            >
              Submit Order
            </button>
          )}
        </div>
      </div>

      {/* F&B Menu Modal - embedded for simplicity */}
      {showFBModal && (
        <FBMenuModal
          isOpen={showFBModal}
          onClose={() => setShowFBModal(false)}
          onSelectItem={handleAddItem}
        />
      )}
    </div>
  );
};

interface FBMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: OrderItem) => void;
}

export const FBMenuModal: React.FC<FBMenuModalProps> = ({
  isOpen,
  onClose,
  onSelectItem,
}) => {
  const fbMenu: OrderItem[] = [
    { id: 101, name: 'Bia Saigon', price: 3.00, quantity: 0 },
    { id: 102, name: 'Bia Tiger', price: 3.00, quantity: 0 },
    { id: 103, name: 'Coca Cola', price: 2.00, quantity: 0 },
    { id: 104, name: 'Sprite', price: 2.00, quantity: 0 },
    { id: 105, name: 'Iced Tea', price: 2.50, quantity: 0 },
    { id: 106, name: 'Coffee', price: 3.00, quantity: 0 },
    { id: 107, name: 'Spring Rolls', price: 5.00, quantity: 0 },
    { id: 108, name: 'Peanuts', price: 4.00, quantity: 0 },
    { id: 109, name: 'Dried Squid', price: 6.00, quantity: 0 },
    { id: 110, name: 'Sandwich', price: 7.50, quantity: 0 },
    { id: 111, name: 'Noodle Soup', price: 6.50, quantity: 0 },
    { id: 112, name: 'Rice Bowl', price: 5.50, quantity: 0 },
  ];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="fb-menu-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Order Food & Beverages</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="menu-grid">
          {fbMenu.map(item => (
            <button
              key={item.id}
              className="menu-item"
              onClick={() => {
                onSelectItem(item);
              }}
            >
              <div className="item-icon">🍽️</div>
              <div className="item-info">
                <div className="item-name">{item.name}</div>
                <div className="item-price">${item.price.toFixed(2)}</div>
              </div>
              <div className="item-add-btn">+</div>
            </button>
          ))}
        </div>

        <div className="modal-footer">
          <button className="close-menu-btn" onClick={onClose}>
            Close Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableActionModal;
