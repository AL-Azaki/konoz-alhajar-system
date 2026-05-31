import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FileSpreadsheet, Moon, Sun, Menu, X, HardHat, LogOut, Users, Settings } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import './AppLayout.css';

export const AppLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="layout-container">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMobileMenu}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <img src="/images/logo.png" alt="كنوز الحجر" className="logo-img" />
            <div className="logo-text-group">
              <h1 className="logo-text">كنوز الحجر</h1>
              <p className="subtitle">STONE TREASURES</p>
            </div>
          </div>
          <button className="mobile-close-btn" onClick={closeMobileMenu}>
            <X size={22} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/app/daily-report" onClick={closeMobileMenu} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FileSpreadsheet size={20} />
            <span>التقارير اليومية</span>
          </NavLink>
          {(hasRole('executive_manager') || hasRole('data_entry')) && (
            <NavLink to="/app/workers" onClick={closeMobileMenu} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <HardHat size={20} />
              <span>إدارة العمال</span>
            </NavLink>
          )}
          {hasRole('executive_manager') && (
            <NavLink to="/app/users" onClick={closeMobileMenu} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Users size={20} />
              <span>إدارة المستخدمين</span>
            </NavLink>
          )}
          {hasRole(['executive_manager', 'data_entry', 'factory_admin']) && (
            <NavLink to="/app/settings" onClick={closeMobileMenu} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Settings size={20} />
              <span>الإعدادات</span>
            </NavLink>
          )}
        </nav>
        
        <div className="sidebar-footer">
          <button 
            className="nav-item logout-btn"
            onClick={async () => {
              await logout();
              navigate('/');
            }}
          >
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <div className="top-bar-right">
            <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
              <Menu size={24} />
            </button>
            <div className="top-bar-title">الإدارة</div>
          </div>
          
          <div className="top-bar-left">
            <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="تبديل الوضع الليلي">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="user-profile">
              <div className="avatar">{user?.name ? user.name.charAt(0) : 'م'}</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="user-name">{user?.name || 'مستخدم'}</span>
                <span className="user-role">
                  {hasRole('executive_manager') ? 'المدير التنفيذي' : 
                   hasRole('factory_admin') ? 'مدير المصنع' : 
                   hasRole('data_entry') ? 'مدخل بيانات' : ''}
                </span>
              </div>
            </div>
          </div>
        </header>
        
        <div className="content-area animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
