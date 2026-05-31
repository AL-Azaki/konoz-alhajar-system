import React, { useState } from 'react';
import { User, Lock, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';

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
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <User className="text-primary" />
          الإعدادات والملف الشخصي
        </h2>
        <p className="text-muted text-sm mt-1">إدارة معلومات حسابك الشخصي وكلمة المرور</p>
      </div>

      <div className="max-w-2xl bg-surface rounded-xl shadow-sm border border-border p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center gap-4">
            <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold">
              {user?.name ? user.name.charAt(0) : 'م'}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{user?.name}</h3>
              <p className="text-muted text-sm">{roleName}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="block text-sm font-medium mb-1">الاسم</label>
              <input 
                type="text" 
                name="name"
                className="w-full p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
              <input 
                type="email" 
                name="email"
                dir="ltr"
                className="w-full p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <hr className="border-border my-2" />

          <div>
            <h4 className="font-medium flex items-center gap-2 mb-4">
              <Lock size={18} className="text-muted" />
              تغيير كلمة المرور (اختياري)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group md:col-span-2">
                <label className="block text-sm font-medium mb-1">كلمة المرور الحالية</label>
                <input 
                  type="password" 
                  name="current_password"
                  dir="ltr"
                  className="w-full md:w-1/2 p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={formData.current_password}
                  onChange={handleChange}
                  placeholder="أدخل كلمة المرور الحالية إذا أردت التغيير"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium mb-1">كلمة المرور الجديدة</label>
                <input 
                  type="password" 
                  name="new_password"
                  dir="ltr"
                  className="w-full p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={formData.new_password}
                  onChange={handleChange}
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium mb-1">تأكيد كلمة المرور الجديدة</label>
                <input 
                  type="password" 
                  name="new_password_confirmation"
                  dir="ltr"
                  className="w-full p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={formData.new_password_confirmation}
                  onChange={handleChange}
                  minLength={6}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button type="submit" className="btn btn-primary flex items-center gap-2" disabled={isLoading}>
              <Save size={18} />
              {isLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
