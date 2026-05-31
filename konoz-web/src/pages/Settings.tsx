import React, { useState } from 'react';
import { User, Lock, Save, Phone, Mail, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import './Settings.css';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const roleNameMap: Record<string, string> = {
    'executive_manager': 'المدير التنفيذي',
    'factory_admin': 'مدير المصنع',
    'data_entry': 'مدخل بيانات',
  };

  const roleName = user?.roles?.[0] ? roleNameMap[user.roles[0]] || user.roles[0] : 'غير محدد';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Build payload
      const payload: any = {
        name: formData.name,
        email: formData.email,
      };

      if (formData.new_password) {
        if (formData.new_password !== formData.new_password_confirmation) {
          toast.error('كلمة المرور الجديدة غير متطابقة.');
          setIsLoading(false);
          return;
        }
        if (!formData.current_password) {
          toast.error('يرجى إدخال كلمة المرور الحالية لتتمكن من تغييرها.');
          setIsLoading(false);
          return;
        }
        payload.current_password = formData.current_password;
        payload.new_password = formData.new_password;
        payload.new_password_confirmation = formData.new_password_confirmation;
      }

      await api.put('/profile', payload);
      toast.success('تم تحديث الملف الشخصي بنجاح.');
      
      // Clear password fields on success
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      }));

      // NOTE: We don't forcefully update AuthContext user here because the next 
      // page reload will fetch the new name/email, or we can add a method to AuthContext to update it.
      // For now, it's sufficient.

    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2 className="page-title">
          <User size={22} />
          الإعدادات والملف الشخصي
        </h2>
        <p className="page-subtitle">إدارة معلومات حسابك الشخصي وكلمة المرور</p>
      </div>

      <div className="settings-grid">
        {/* Profile & Account Form */}
        <Card>
          <form onSubmit={handleSubmit} className="form-stack">
            
            {/* User avatar card */}
            <div className="profile-card">
              <div className="profile-avatar">
                {user?.name ? user.name.charAt(0) : 'م'}
              </div>
              <div className="profile-info">
                <h3>{user?.name}</h3>
                <p>{roleName}</p>
              </div>
            </div>

            <div className="settings-section-title">
              <User size={16} />
              المعلومات الشخصية
            </div>

            <div className="form-grid-2">
              <Input 
                label="الاسم"
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              
              <Input 
                label="البريد الإلكتروني"
                type="email" 
                name="email"
                dir="ltr"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="settings-divider"></div>

            <div className="settings-section-title">
              <Lock size={16} />
              تغيير كلمة المرور (اختياري)
            </div>
            
            <Input 
              label="كلمة المرور الحالية"
              type="password" 
              name="current_password"
              dir="ltr"
              value={formData.current_password}
              onChange={handleChange}
              placeholder="أدخل كلمة المرور الحالية إذا أردت التغيير"
            />

            <div className="form-grid-2">
              <Input 
                label="كلمة المرور الجديدة"
                type="password" 
                name="new_password"
                dir="ltr"
                value={formData.new_password}
                onChange={handleChange}
                minLength={6}
              />

              <Input 
                label="تأكيد كلمة المرور الجديدة"
                type="password" 
                name="new_password_confirmation"
                dir="ltr"
                value={formData.new_password_confirmation}
                onChange={handleChange}
                minLength={6}
              />
            </div>

            <div className="form-actions">
              <Button type="submit" isLoading={isLoading} rightIcon={<Save size={18} />}>
                حفظ التعديلات
              </Button>
            </div>
          </form>
        </Card>

        {/* Support Card */}
        <div className="support-section">
          <Card>
            <div className="support-header">
              <h3>الدعم الفني</h3>
              <p>تواصل معنا للمساعدة</p>
            </div>
            
            <div className="support-items">
              <a href="tel:0552154400" className="support-item">
                <div className="support-icon phone-icon">
                  <Phone size={18} />
                </div>
                <div>
                  <span className="support-label">الجوال</span>
                  <span className="support-value" dir="ltr">055 215 4400</span>
                </div>
              </a>

              <a href="tel:0122330403" className="support-item">
                <div className="support-icon phone-icon">
                  <Phone size={18} />
                </div>
                <div>
                  <span className="support-label">الهاتف</span>
                  <span className="support-value" dir="ltr">012 233 0403</span>
                </div>
              </a>

              <a href="https://wa.me/966552154400" target="_blank" rel="noreferrer" className="support-item">
                <div className="support-icon whatsapp-icon">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <span className="support-label">واتساب</span>
                  <span className="support-value" dir="ltr">055 215 4400</span>
                </div>
              </a>

              <a href="mailto:stonetreasures.est@gmail.com" className="support-item">
                <div className="support-icon mail-icon">
                  <Mail size={18} />
                </div>
                <div>
                  <span className="support-label">البريد الإلكتروني</span>
                  <span className="support-value" dir="ltr">stonetreasures.est@gmail.com</span>
                </div>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
