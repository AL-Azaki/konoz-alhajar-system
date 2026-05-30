import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--color-background)' }}>
        <div style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-md)' }}>
          <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>جاري التحميل...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    // User doesn't have required role
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة.</h2>
        <button className="btn btn-primary" onClick={() => window.history.back()}>العودة للخلف</button>
      </div>
    );
  }

  return <>{children}</>;
};
