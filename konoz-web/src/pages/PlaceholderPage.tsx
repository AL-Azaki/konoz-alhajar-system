import React from 'react';
import './Dashboard.css';

interface PlaceholderPageProps {
  title: string;
  icon: React.ElementType;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, icon: Icon }) => {
  return (
    <div className="dashboard-page" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <div className="dev-card" style={{ width: '100%', maxWidth: '600px' }}>
        <div className="dev-icon-wrapper">
          <Icon size={48} />
        </div>
        <h2 className="dev-title">{title} — قيد التطوير</h2>
        <p className="dev-description">
          نعمل حالياً على بناء وتطوير قسم "{title}" ليكون متكاملاً مع النظام.
          <br />
          سيكون متاحاً قريباً لتتمكن من إدارته بكل سهولة.
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
