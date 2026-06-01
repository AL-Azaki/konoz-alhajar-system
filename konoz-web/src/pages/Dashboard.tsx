import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Wrench } from 'lucide-react';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { user, hasRole } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 17) return 'مساء الخير';
    return 'مساء الخير';
  };

  const getRoleName = () => {
    if (hasRole('executive_manager')) return 'المدير التنفيذي';
    if (hasRole('factory_admin')) return 'مدير المصنع';
    if (hasRole('data_entry')) return 'مدخل بيانات';
    return '';
  };

  return (
    <div className="dashboard-page">
      {/* Welcome Card */}
      <div className="welcome-card">
        <div className="welcome-card-content">
          <div className="welcome-icon">
            <LayoutDashboard size={28} />
          </div>
          <div className="welcome-text">
            <h1 className="welcome-greeting">
              {getGreeting()}، <span className="welcome-name">{user?.name || 'مستخدم'}</span>
            </h1>
            <p className="welcome-role">{getRoleName()} — نظام كنوز الحجر</p>
          </div>
        </div>
        <div className="welcome-date">
          {new Date().toLocaleDateString('ar-SA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Under Development Card */}
      <div className="dev-card">
        <div className="dev-icon-wrapper">
          <Wrench size={48} />
        </div>
        <h2 className="dev-title">لوحة التحكم قيد التطوير</h2>
        <p className="dev-description">
          نعمل حالياً على بناء لوحة تحكم متكاملة تتضمن الإحصائيات والتقارير البيانية.
          <br />
          ستكون متاحة في التحديث القادم إن شاء الله.
        </p>
        <div className="dev-progress">
          <div className="dev-progress-bar">
            <div className="dev-progress-fill"></div>
          </div>
          <span className="dev-progress-text">جاري العمل...</span>
        </div>
      </div>
    </div>
  );
};
