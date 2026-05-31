import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import './Welcome.css';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ email, password });
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/app/daily-report');
    } catch (err: any) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page" dir="rtl">
      <Card className="login-card">
        <div className="login-header">
          <img src="/images/logo.png" alt="كنوز الحجر" className="login-logo" />
          <h2>تسجيل الدخول</h2>
          <p>مرحباً بك في نظام كنوز الحجر</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <Input 
            label="البريد الإلكتروني"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="example@konoz.com"
            required
            dir="ltr"
            rightIcon={<User size={18} />}
          />

          <div style={{ position: 'relative' }}>
            <Input 
              label="كلمة المرور"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              dir="ltr"
              rightIcon={<Lock size={18} />}
            />
            <button 
              type="button" 
              className="password-toggle"
              style={{ position: 'absolute', top: '2.2rem', left: '1rem', right: 'auto', color: 'var(--color-text-muted)' }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <Button 
              type="submit" 
              isLoading={isLoading} 
              fullWidth 
              rightIcon={!isLoading ? <LogIn size={18} /> : undefined}
            >
              دخول
            </Button>
          </div>

          <Button 
            type="button" 
            variant="ghost" 
            fullWidth 
            onClick={() => navigate('/')}
            rightIcon={<ArrowRight size={18} />}
          >
            العودة للصفحة الرئيسية
          </Button>
        </form>
      </Card>
    </div>
  );
};
