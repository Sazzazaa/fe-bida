import React, { useState } from 'react';
import {
  Menu,
  X,
  Home,
  Layers,
  UtensilsCrossed,
  BarChart3,
} from 'lucide-react';
import '../styles/sidebar.css';

interface SidebarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage = 'dashboard',
  onNavigate = () => {},
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'table-management', label: 'Table Management', icon: Layers },
    { id: 'fb-management', label: 'F&B Management', icon: UtensilsCrossed },
    { id: 'revenue-reports', label: 'Revenue Reports', icon: BarChart3 },
  ];

  const handleNavigate = (itemId: string) => {
    onNavigate(itemId);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">🎱</div>
            {!isCollapsed && <span className="logo-text">BIDA</span>}
          </div>
          <button
            className="sidebar-collapse-btn"
            onClick={toggleCollapse}
            aria-label="Collapse sidebar"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavigate(item.id)}
                title={isCollapsed ? item.label : undefined}
              >
                <IconComponent size={20} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-info">
            {!isCollapsed && (
              <>
                <div className="info-title">Shift Info</div>
                <div className="info-item">
                  <span className="label">Status:</span>
                  <span className="value active-status">On Duty</span>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
