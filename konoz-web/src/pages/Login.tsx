import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';
import './Welcome.css';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login({ email, password });
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/daily-report');
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <img src="/images/logo.png" alt="كنوز الحجر" className="login-logo" />
          <h2>تسجيل الدخول</h2>
          <p>مرحباً بك في نظام كنوز الحجر</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label className="input-label">البريد الإلكتروني</label>
            <div className="input-with-icon">
              <User className="input-icon" size={16} />
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@konoz.com"
                required
                dir="ltr"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">كلمة المرور</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                dir="ltr"
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-submit" disabled={isLoading}>
            {isLoading ? 'جاري التحقق...' : <><LogIn size={16} /> دخول</>}
          </button>

          <button type="button" className="login-submit back-btn" onClick={() => navigate('/')}>
            العودة للصفحة الرئيسية
          </button>
        </form>
      </div>
    </div>
  );
};
