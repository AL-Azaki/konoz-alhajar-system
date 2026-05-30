import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Shield, UserX, UserCheck } from 'lucide-react';
import api from '../services/api';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: loggedInUser } = useAuth();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      setError('حدث خطأ أثناء جلب المستخدمين');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentUser?.id) {
        await api.put(`/users/${currentUser.id}`, {
          ...currentUser,
          password: password || undefined
        });
      } else {
        await api.post('/users', {
          ...currentUser,
          password
        });
      }
      setIsModalOpen(false);
      fetchUsers();
      toast.success(currentUser?.id ? 'تم تعديل المستخدم بنجاح' : 'تم إضافة المستخدم بنجاح');
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
      toast.success('تم حذف المستخدم بنجاح');
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  const toggleStatus = async (user: User) => {
    try {
      await api.put(`/users/${user.id}`, {
        is_active: !user.is_active
      });
      fetchUsers();
      toast.success('تم تحديث حالة المستخدم بنجاح');
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  const roleNameMap: Record<string, string> = {
    'executive_manager': 'المدير التنفيذي',
    'factory_admin': 'مدير المصنع',
    'data_entry': 'مدخل بيانات',
  };

  return (
    <div className="users-page">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Shield className="text-primary" />
            إدارة المستخدمين والصلاحيات
          </h2>
          <p className="text-muted text-sm mt-1">إضافة وتعديل حسابات الموظفين وتحديد صلاحياتهم</p>
        </div>
        <button 
          className="btn btn-primary flex items-center gap-2"
          onClick={() => {
            setCurrentUser({ role: 'data_entry', is_active: true });
            setPassword('');
            setIsModalOpen(true);
          }}
        >
          <Plus size={20} />
          <span>مستخدم جديد</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center p-8">جاري التحميل...</div>
      ) : error ? (
        <div className="text-center text-danger p-8">{error}</div>
      ) : (
        <div className="table-responsive bg-surface rounded-xl shadow-sm border border-border">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="p-4 font-semibold text-gray-600">الاسم</th>
                <th className="p-4 font-semibold text-gray-600">البريد الإلكتروني</th>
                <th className="p-4 font-semibold text-gray-600">الصلاحية (الدور)</th>
                <th className="p-4 font-semibold text-gray-600">الحالة</th>
                <th className="p-4 font-semibold text-gray-600">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium">{u.name}</td>
                  <td className="p-4" dir="ltr">{u.email}</td>
                  <td className="p-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      u.role === 'executive_manager' ? 'bg-purple-100 text-purple-800' :
                      u.role === 'factory_admin' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {roleNameMap[u.role] || u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => toggleStatus(u)}
                      disabled={u.id === loggedInUser?.id}
                      className={`flex items-center gap-1 text-sm ${u.is_active ? 'text-success' : 'text-danger'} ${u.id === loggedInUser?.id ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
                    >
                      {u.is_active ? <UserCheck size={16} /> : <UserX size={16} />}
                      {u.is_active ? 'نشط' : 'معطل'}
                    </button>
                  </td>
                  <td className="p-4 flex gap-2">
                    <button 
                      className="text-primary hover:text-blue-700 transition"
                      title="تعديل"
                      onClick={() => {
                        setCurrentUser(u);
                        setPassword('');
                        setIsModalOpen(true);
                      }}
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      className="text-danger hover:text-red-700 transition"
                      title="حذف"
                      disabled={u.id === loggedInUser?.id}
                      style={{ opacity: u.id === loggedInUser?.id ? 0.3 : 1 }}
                      onClick={() => handleDelete(u.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentUser?.id ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4 p-4">
          <div className="form-group">
            <label className="block text-sm font-medium mb-1">اسم المستخدم</label>
            <input 
              type="text" 
              className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              value={currentUser?.name || ''}
              onChange={e => setCurrentUser({ ...currentUser, name: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
            <input 
              type="email" 
              dir="ltr"
              className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              value={currentUser?.email || ''}
              onChange={e => setCurrentUser({ ...currentUser, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium mb-1">
              كلمة المرور 
              {currentUser?.id && <span className="text-xs text-muted font-normal mr-2">(اتركها فارغة إذا لم ترد تغييرها)</span>}
            </label>
            <input 
              type="password" 
              dir="ltr"
              className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required={!currentUser?.id}
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium mb-1">الصلاحية (الدور)</label>
            <select 
              className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              value={currentUser?.role || ''}
              onChange={e => setCurrentUser({ ...currentUser, role: e.target.value })}
              required
            >
              <option value="">-- اختر الصلاحية --</option>
              <option value="executive_manager">المدير التنفيذي</option>
              <option value="factory_admin">مدير المصنع</option>
              <option value="data_entry">مدخل بيانات</option>
            </select>
          </div>

          <div className="form-group flex items-center gap-2 mt-2">
            <input 
              type="checkbox" 
              id="isActiveCheck"
              className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
              checked={currentUser?.is_active ?? true}
              onChange={e => setCurrentUser({ ...currentUser, is_active: e.target.checked })}
              disabled={currentUser?.id === loggedInUser?.id}
            />
            <label htmlFor="isActiveCheck" className="text-sm font-medium cursor-pointer">
              حساب نشط (يمكنه تسجيل الدخول)
            </label>
          </div>

          <div className="flex gap-3 justify-end mt-4">
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </button>
            <button type="submit" className="btn btn-primary">
              حفظ البيانات
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
