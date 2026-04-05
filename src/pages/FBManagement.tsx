import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import '../styles/management.css';

interface FBItem {
  id: number;
  name: string;
  category: 'Beverage' | 'Food' | 'Snacks';
  price: number;
  status: 'available' | 'unavailable';
}

export const FBManagement: React.FC<{ onNavigate?: (page: string) => void; onLogout?: () => void }> = ({
  onNavigate = () => {},
  onLogout = () => {},
}) => {
  const [fbItems, setFbItems] = useState<FBItem[]>([
    { id: 101, name: 'Bia Saigon', category: 'Beverage', price: 3.00, status: 'available' },
    { id: 102, name: 'Bia Tiger', category: 'Beverage', price: 3.00, status: 'available' },
    { id: 103, name: 'Coca Cola', category: 'Beverage', price: 2.00, status: 'available' },
    { id: 104, name: 'Sprite', category: 'Beverage', price: 2.00, status: 'available' },
    { id: 105, name: 'Iced Tea', category: 'Beverage', price: 2.50, status: 'available' },
    { id: 106, name: 'Coffee', category: 'Beverage', price: 3.00, status: 'available' },
    { id: 107, name: 'Spring Rolls', category: 'Food', price: 5.00, status: 'available' },
    { id: 108, name: 'Peanuts', category: 'Snacks', price: 4.00, status: 'available' },
    { id: 109, name: 'Dried Squid', category: 'Snacks', price: 6.00, status: 'available' },
    { id: 110, name: 'Sandwich', category: 'Food', price: 7.50, status: 'available' },
    { id: 111, name: 'Noodle Soup', category: 'Food', price: 6.50, status: 'available' },
    { id: 112, name: 'Rice Bowl', category: 'Food', price: 5.50, status: 'unavailable' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<FBItem>>({});

  const filteredItems = fbItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (item: FBItem) => {
    setEditingId(item.id);
    setEditData({ ...item });
  };

  const handleSave = () => {
    if (editingId) {
      setFbItems(
        fbItems.map(item =>
          item.id === editingId ? { ...item, ...editData } : item
        )
      );
      setEditingId(null);
      setEditData({});
    }
  };

  const handleDelete = (id: number) => {
    setFbItems(fbItems.filter(item => item.id !== id));
  };

  const handleAddNew = () => {
    const newItem: FBItem = {
      id: Math.max(...fbItems.map(i => i.id), 100) + 1,
      name: 'New Item',
      category: 'Food',
      price: 0,
      status: 'available',
    };
    setFbItems([...fbItems, newItem]);
    handleEdit(newItem);
  };

  return (
    <MainLayout
      currentPage="fbmanagement"
      onNavigate={onNavigate}
      onLogout={onLogout}
      userName="John Doe"
      userRole="Admin"
    >
      <div className="management-container">
        {/* Header */}
        <div className="management-header">
          <div>
            <h1>Food & Beverage Management</h1>
            <p>Manage your menu items and inventory</p>
          </div>
          <button className="add-btn" onClick={handleAddNew}>
            <Plus size={20} />
            Add Item
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-input-wrapper">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-chips">
            <span className="filter-chip">Total Items: {fbItems.length}</span>
            <span className="filter-chip">Available: {fbItems.filter(i => i.status === 'available').length}</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="data-table">
          <div className="table-header">
            <div className="header-cell">Item Name</div>
            <div className="header-cell">Category</div>
            <div className="header-cell">Price</div>
            <div className="header-cell">Status</div>
            <div className="header-cell">Actions</div>
          </div>

          {filteredItems.length > 0 ? (
            <div className="table-body">
              {filteredItems.map(item => (
                <div key={item.id} className="table-row">
                  {editingId === item.id ? (
                    <>
                      <div className="cell">
                        <input
                          type="text"
                          value={editData.name || ''}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="edit-input"
                        />
                      </div>
                      <div className="cell">
                        <select
                          value={editData.category || 'Food'}
                          onChange={(e) => setEditData({ ...editData, category: e.target.value as any })}
                          className="edit-input"
                        >
                          <option>Beverage</option>
                          <option>Food</option>
                          <option>Snacks</option>
                        </select>
                      </div>
                      <div className="cell">
                        <input
                          type="number"
                          value={editData.price || 0}
                          onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) })}
                          className="edit-input"
                          step="0.1"
                        />
                      </div>
                      <div className="cell">
                        <select
                          value={editData.status || 'available'}
                          onChange={(e) => setEditData({ ...editData, status: e.target.value as any })}
                          className="edit-input"
                        >
                          <option value="available">Available</option>
                          <option value="unavailable">Unavailable</option>
                        </select>
                      </div>
                      <div className="cell actions">
                        <button className="action-save" onClick={handleSave}>Save</button>
                        <button className="action-cancel" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="cell">
                        <span className="item-icon">🍽️</span>
                        <span className="cell-text">{item.name}</span>
                      </div>
                      <div className="cell">
                        <span className="badge">{item.category}</span>
                      </div>
                      <div className="cell">
                        <span className="price">${item.price.toFixed(2)}</span>
                      </div>
                      <div className="cell">
                        <span className={`status-badge status-${item.status}`}>
                          {item.status === 'available' ? '✓ Available' : '⊘ Unavailable'}
                        </span>
                      </div>
                      <div className="cell actions">
                        <button
                          className="action-btn edit"
                          title="Edit"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="action-btn delete"
                          title="Delete"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <div className="empty-text">No items found matching your search</div>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="stats-footer">
          <div className="stat">
            <span className="stat-label">Total Items</span>
            <span className="stat-value">{fbItems.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Available</span>
            <span className="stat-value">{fbItems.filter(i => i.status === 'available').length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Total Value</span>
            <span className="stat-value">${fbItems.reduce((sum, i) => sum + i.price, 0).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FBManagement;
