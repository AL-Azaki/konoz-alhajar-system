import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Power, PowerOff } from 'lucide-react';
import { useWorkers, type Worker } from '../context/WorkerContext';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';
import { Modal } from '../components/ui/Modal';
import './Workers.css';

export const Workers: React.FC = () => {
  const { workers, addWorker, updateWorker, deleteWorker, toggleWorkerStatus } = useWorkers();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    joinDate: format(new Date(), 'yyyy-MM-dd'),
    isActive: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      joinDate: format(new Date(), 'yyyy-MM-dd'),
      isActive: true
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (worker: Worker) => {
    setFormData({
      name: worker.name,
      phone: worker.phone,
      joinDate: worker.joinDate,
      isActive: worker.isActive
    });
    setEditingId(worker.id);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('الرجاء إدخال اسم العامل');
      return;
    }

    try {
      if (editingId) {
        await updateWorker(editingId, { ...formData, joined_at: formData.joinDate });
        toast.success('تم تعديل بيانات العامل بنجاح');
      } else {
        await addWorker({ name: formData.name, phone: formData.phone, joined_at: formData.joinDate });
        toast.success('تم إضافة العامل بنجاح');
      }
      resetForm();
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العامل نهائياً؟')) {
      try {
        await deleteWorker(id);
        toast.success('تم حذف العامل بنجاح');
      } catch (error: any) {
        toast.error(getErrorMessage(error));
      }
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleWorkerStatus(id);
      toast.success('تم تغيير حالة العامل بنجاح');
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="workers-page">
      <div className="workers-header">
        <div>
          <h2 className="workers-title">إدارة العمال</h2>
          <p className="workers-subtitle">إضافة، تعديل، وتعطيل العمال المنفذين للعمل</p>
        </div>
        {!isFormOpen && (
          <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
            <Plus size={18} />
            إضافة عامل جديد
          </button>
        )}
      </div>

      <Modal 
        isOpen={isFormOpen} 
        onClose={resetForm} 
        title={editingId ? 'تعديل بيانات العامل' : 'تسجيل عامل جديد'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr', marginBottom: '1rem' }}>
            <div className="input-group">
              <label className="input-label">اسم العامل</label>
              <input 
                type="text" 
                className="input-field" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
                placeholder="مثال: أسامة أحمد"
              />
            </div>
            
            <div className="input-group">
              <label className="input-label">رقم الهاتف</label>
              <input 
                type="tel" 
                className="input-field" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="مثال: 77XXXXXXX"
              />
            </div>

            <div className="input-group">
              <label className="input-label">تاريخ الانضمام</label>
              <input 
                type="date" 
                className="input-field" 
                value={formData.joinDate}
                onChange={e => setFormData({...formData, joinDate: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '2rem' }}>
            <button type="button" className="btn btn-outline" onClick={resetForm}>إلغاء</button>
            <button type="submit" className="btn btn-primary">حفظ البيانات</button>
          </div>
        </form>
      </Modal>

      <div className="workers-table-container glass-panel">
        <table className="workers-table">
          <thead>
            <tr>
              <th>م</th>
              <th>الاسم</th>
              <th>رقم الهاتف</th>
              <th>تاريخ الانضمام</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {workers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>لا يوجد عمال مسجلين حالياً</td>
              </tr>
            ) : (
              workers.map((worker, index) => (
                <tr key={worker.id}>
                  <td>{index + 1}</td>
                  <td style={{ fontWeight: 600 }}>{worker.name}</td>
                  <td dir="ltr" style={{ textAlign: 'right' }}>{worker.phone || '-'}</td>
                  <td>{worker.joinDate}</td>
                  <td>
                    <span className={`status-badge ${worker.isActive ? 'active' : 'inactive'}`}>
                      {worker.isActive ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button 
                        className="btn-icon" 
                        title="تعديل"
                        onClick={() => handleEdit(worker)}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        className={`btn-icon ${worker.isActive ? 'danger' : ''}`} 
                        title={worker.isActive ? 'تعطيل العامل' : 'تفعيل العامل'}
                        onClick={() => handleToggleStatus(worker.id)}                      >
                        {worker.isActive ? <PowerOff size={18} /> : <Power size={18} style={{ color: 'var(--color-success)' }} />}
                      </button>
                      <button 
                        className="btn-icon danger" 
                        title="حذف نهائي"
                        onClick={() => handleDelete(worker.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
