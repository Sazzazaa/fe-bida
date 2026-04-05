import React, { useState } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
} from 'lucide-react';
import '../styles/header.css';

interface HeaderProps {
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName = 'John Doe',
  userRole = 'Floor Manager',
  onLogout = () => {},
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [notificationCount] = useState(3);

  const handleLogout = () => {
    onLogout();
    setIsProfileOpen(false);
  };

  return (
    <header className="header">
      <div className="header-content">
        {/* Search Bar */}
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search tables, orders, reports..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Right Side Actions */}
        <div className="header-actions">
          {/* Notifications */}
          <button className="notification-btn" aria-label="Notifications">
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </button>

          {/* User Profile Dropdown */}
          <div className="profile-dropdown">
            <button
              className="profile-btn"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              aria-label="User profile menu"
            >
              <div className="user-avatar">
                <User size={18} />
              </div>
              <div className="user-info">
                <div className="user-name">{userName}</div>
                <div className="user-role">{userRole}</div>
              </div>
              <ChevronDown
                size={16}
                className={`chevron ${isProfileOpen ? 'open' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="dropdown-menu">
                <button className="dropdown-item">
                  <User size={16} />
                  <span>My Profile</span>
                </button>
                <button className="dropdown-item">
                  <Bell size={16} />
                  <span>Notifications</span>
                </button>
                <div className="dropdown-divider" />
                <button
                  className="dropdown-item logout"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
