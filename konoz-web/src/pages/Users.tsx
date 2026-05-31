import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Shield, UserX, UserCheck } from 'lucide-react';
import api from '../services/api';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import './Workers.css'; /* Shared table styles */

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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
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

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await api.delete(`/users/${userToDelete}`);
        fetchUsers();
        toast.success('تم حذف المستخدم بنجاح');
      } catch (err: any) {
        toast.error(getErrorMessage(err));
      }
      setUserToDelete(null);
      setDeleteModalOpen(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setUserToDelete(id);
    setDeleteModalOpen(true);
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

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'executive_manager': return 'role-badge executive';
      case 'factory_admin': return 'role-badge factory';
      default: return 'role-badge data-entry';
    }
  };

  return (
    <div className="workers-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <Shield size={22} />
            إدارة المستخدمين والصلاحيات
          </h2>
          <p className="page-subtitle">إضافة وتعديل حسابات الموظفين وتحديد صلاحياتهم</p>
        </div>
        <Button 
          onClick={() => {
            setCurrentUser({ role: 'data_entry', is_active: true });
            setPassword('');
            setIsModalOpen(true);
          }}
          rightIcon={<Plus size={18} />}
        >
          مستخدم جديد
        </Button>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
        </div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : (
        <div className="workers-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>م</th>
                <th>الاسم</th>
                <th>البريد الإلكتروني</th>
                <th>الصلاحية (الدور)</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => (
                <tr key={u.id}>
                  <td>{index + 1}</td>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td dir="ltr">{u.email}</td>
                  <td>
                    <span className={getRoleBadgeClass(u.role)}>
                      {roleNameMap[u.role] || u.role}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => toggleStatus(u)}
                      disabled={u.id === loggedInUser?.id}
                      className={`status-toggle-btn ${u.is_active ? 'active' : 'inactive'}`}
                    >
                      {u.is_active ? <UserCheck size={16} /> : <UserX size={16} />}
                      {u.is_active ? 'نشط' : 'معطل'}
                    </button>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button 
                        className="action-btn edit"
                        title="تعديل"
                        onClick={() => {
                          setCurrentUser(u);
                          setPassword('');
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="action-btn delete"
                        title="حذف"
                        disabled={u.id === loggedInUser?.id}
                        onClick={() => handleDeleteClick(u.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
        <form onSubmit={handleSave} className="form-stack">
          <div className="form-grid-2">
            <Input 
              label="اسم المستخدم"
              type="text" 
              value={currentUser?.name || ''}
              onChange={e => setCurrentUser({ ...currentUser, name: e.target.value })}
              required
            />
            
            <Input 
              label="البريد الإلكتروني"
              type="email" 
              dir="ltr"
              value={currentUser?.email || ''}
              onChange={e => setCurrentUser({ ...currentUser, email: e.target.value })}
              required
            />
          </div>

          <div className="form-grid-2">
            <Input 
              label={`كلمة المرور ${currentUser?.id ? '(اختياري)' : ''}`}
              type="password" 
              dir="ltr"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required={!currentUser?.id}
              minLength={6}
            />

            <div className="select-wrapper">
              <label className="select-label">الصلاحية (الدور)</label>
              <select 
                className="select-field"
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
          </div>

          <div className="checkbox-row">
            <input 
              type="checkbox" 
              id="isActiveCheck"
              checked={currentUser?.is_active ?? true}
              onChange={e => setCurrentUser({ ...currentUser, is_active: e.target.checked })}
              disabled={currentUser?.id === loggedInUser?.id}
            />
            <label htmlFor="isActiveCheck">
              حساب نشط (يمكنه تسجيل الدخول)
            </label>
          </div>

          <div className="form-actions">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit">
              حفظ البيانات
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف المستخدم"
        cancelText="إلغاء"
        isDestructive={true}
      />
    </div>
  );
};
