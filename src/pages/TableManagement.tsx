import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import '../styles/management.css';

interface Table {
  id: number;
  name: string;
  type: 'Pool' | 'Carom';
  location: string;
  status: 'available' | 'maintenance';
}

export const TableManagement: React.FC<{ onNavigate?: (page: string) => void; onLogout?: () => void }> = ({
  onNavigate = () => {},
  onLogout = () => {},
}) => {
  const [tables, setTables] = useState<Table[]>([
    { id: 1, name: 'Table 01', type: 'Pool', location: 'Zone A', status: 'available' },
    { id: 2, name: 'Table 02', type: 'Carom', location: 'Zone A', status: 'available' },
    { id: 3, name: 'Table 03', type: 'Pool', location: 'Zone B', status: 'available' },
    { id: 4, name: 'Table 04', type: 'Pool', location: 'Zone B', status: 'available' },
    { id: 5, name: 'Table 05', type: 'Carom', location: 'Zone C', status: 'available' },
    { id: 6, name: 'Table 06', type: 'Pool', location: 'Zone C', status: 'available' },
    { id: 7, name: 'Table 07', type: 'Pool', location: 'Zone A', status: 'maintenance' },
    { id: 8, name: 'Table 08', type: 'Carom', location: 'Zone B', status: 'available' },
    { id: 9, name: 'Table 09', type: 'Pool', location: 'Zone C', status: 'available' },
    { id: 10, name: 'Table 10', type: 'Pool', location: 'Zone A', status: 'available' },
    { id: 11, name: 'Table 11', type: 'Carom', location: 'Zone B', status: 'available' },
    { id: 12, name: 'Table 12', type: 'Pool', location: 'Zone C', status: 'available' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Table>>({});

  const filteredTables = tables.filter(table =>
    table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    table.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    table.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (table: Table) => {
    setEditingId(table.id);
    setEditData({ ...table });
  };

  const handleSave = () => {
    if (editingId) {
      setTables(
        tables.map(table =>
          table.id === editingId ? { ...table, ...editData } : table
        )
      );
      setEditingId(null);
      setEditData({});
    }
  };

  const handleDelete = (id: number) => {
    setTables(tables.filter(table => table.id !== id));
  };

  const handleAddNew = () => {
    const newTable: Table = {
      id: Math.max(...tables.map(t => t.id), 0) + 1,
      name: `Table ${String(Math.max(...tables.map(t => t.id), 0) + 1).padStart(2, '0')}`,
      type: 'Pool',
      location: 'Zone A',
      status: 'available',
    };
    setTables([...tables, newTable]);
    handleEdit(newTable);
  };

  return (
    <MainLayout
      currentPage="tablemanagement"
      onNavigate={onNavigate}
      onLogout={onLogout}
      userName="John Doe"
      userRole="Admin"
    >
      <div className="management-container">
        {/* Header */}
        <div className="management-header">
          <div>
            <h1>Billiard Table Management</h1>
            <p>Manage your tables and locations</p>
          </div>
          <button className="add-btn" onClick={handleAddNew}>
            <Plus size={20} />
            Add Table
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-input-wrapper">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name, type, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-chips">
            <span className="filter-chip">Total: {tables.length}</span>
            <span className="filter-chip">Available: {tables.filter(t => t.status === 'available').length}</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="data-table">
          <div className="table-header">
            <div className="header-cell">Table Name</div>
            <div className="header-cell">Type</div>
            <div className="header-cell">Location</div>
            <div className="header-cell">Status</div>
            <div className="header-cell">Actions</div>
          </div>

          {filteredTables.length > 0 ? (
            <div className="table-body">
              {filteredTables.map(table => (
                <div key={table.id} className="table-row">
                  {editingId === table.id ? (
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
                          value={editData.type || 'Pool'}
                          onChange={(e) => setEditData({ ...editData, type: e.target.value as 'Pool' | 'Carom' })}
                          className="edit-input"
                        >
                          <option>Pool</option>
                          <option>Carom</option>
                        </select>
                      </div>
                      <div className="cell">
                        <select
                          value={editData.location || 'Zone A'}
                          onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                          className="edit-input"
                        >
                          <option>Zone A</option>
                          <option>Zone B</option>
                          <option>Zone C</option>
                        </select>
                      </div>
                      <div className="cell">
                        <select
                          value={editData.status || 'available'}
                          onChange={(e) => setEditData({ ...editData, status: e.target.value as 'available' | 'maintenance' })}
                          className="edit-input"
                        >
                          <option value="available">Available</option>
                          <option value="maintenance">Maintenance</option>
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
                        <span className="item-icon">🎱</span>
                        <span className="cell-text">{table.name}</span>
                      </div>
                      <div className="cell">
                        <span className="badge">{table.type}</span>
                      </div>
                      <div className="cell">
                        <span className="location">{table.location}</span>
                      </div>
                      <div className="cell">
                        <span className={`status-badge status-${table.status}`}>
                          {table.status === 'available' ? '✓ Available' : '⚠ Maintenance'}
                        </span>
                      </div>
                      <div className="cell actions">
                        <button
                          className="action-btn edit"
                          title="Edit"
                          onClick={() => handleEdit(table)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="action-btn delete"
                          title="Delete"
                          onClick={() => handleDelete(table.id)}
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
              <div className="empty-text">No tables found matching your search</div>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="stats-footer">
          <div className="stat">
            <span className="stat-label">Total Tables</span>
            <span className="stat-value">{tables.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Available</span>
            <span className="stat-value">{tables.filter(t => t.status === 'available').length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Pool Tables</span>
            <span className="stat-value">{tables.filter(t => t.type === 'Pool').length}</span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TableManagement;
