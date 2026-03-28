import React, { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import '../styles/layout.css';

interface MainLayoutProps {
  children: ReactNode;
  currentPage?: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  userName?: string;
  userRole?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  currentPage = 'dashboard',
  onNavigate = () => {},
  onLogout = () => {},
  userName = 'John Doe',
  userRole = 'Floor Manager',
}) => {
  return (
    <div className="main-layout">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <div className="main-content">
        <Header
          userName={userName}
          userRole={userRole}
          onLogout={onLogout}
        />
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
