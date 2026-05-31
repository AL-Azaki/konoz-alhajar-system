import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Power, PowerOff } from 'lucide-react';
import { useWorkers, type Worker } from '../context/WorkerContext';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import './Workers.css';

export const Workers: React.FC = () => {
  const { workers, addWorker, updateWorker, deleteWorker, toggleWorkerStatus } = useWorkers();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState<number | null>(null);
  
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

  const confirmDelete = async () => {
    if (workerToDelete) {
      try {
        await deleteWorker(workerToDelete);
        toast.success('تم حذف العامل بنجاح');
      } catch (error: any) {
        toast.error(getErrorMessage(error));
      }
      setWorkerToDelete(null);
    }
  };

  const handleDeleteClick = (id: number) => {
    setWorkerToDelete(id);
    setDeleteModalOpen(true);
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
          <Button onClick={() => setIsFormOpen(true)} rightIcon={<Plus size={18} />}>
            إضافة عامل جديد
          </Button>
        )}
      </div>

      <Modal 
        isOpen={isFormOpen} 
        onClose={resetForm} 
        title={editingId ? 'تعديل بيانات العامل' : 'تسجيل عامل جديد'}
      >
        <form onSubmit={handleSubmit} className="form-stack">
          <div className="form-grid-2">
            <Input 
              label="اسم العامل"
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
              placeholder="مثال: أسامة أحمد"
            />
            
            <Input 
              label="رقم الهاتف"
              type="tel" 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              placeholder="مثال: 77XXXXXXX"
              dir="ltr"
            />
          </div>

          <Input 
            label="تاريخ الانضمام"
            type="date" 
            value={formData.joinDate}
            onChange={e => setFormData({...formData, joinDate: e.target.value})}
            required
          />

          <div className="form-actions">
            <Button type="button" variant="ghost" onClick={resetForm}>إلغاء</Button>
            <Button type="submit">حفظ البيانات</Button>
          </div>
        </form>
      </Modal>

      <div className="workers-table-container">
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
                <td colSpan={6} className="empty-state">لا يوجد عمال مسجلين حالياً</td>
              </tr>
            ) : (
              workers.map((worker, index) => (
                <tr key={worker.id}>
                  <td>{index + 1}</td>
                  <td style={{ fontWeight: 600 }}>{worker.name}</td>
                  <td dir="ltr">{worker.phone || '-'}</td>
                  <td>{worker.joinDate}</td>
                  <td>
                    <span className={`status-badge ${worker.isActive ? 'active' : 'inactive'}`}>
                      {worker.isActive ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button 
                        className="action-btn edit"
                        title="تعديل"
                        onClick={() => handleEdit(worker)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className={`action-btn ${worker.isActive ? 'toggle-on' : 'toggle-off'}`}
                        title={worker.isActive ? 'تعطيل العامل' : 'تفعيل العامل'}
                        onClick={() => handleToggleStatus(worker.id)}
                      >
                        {worker.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                      </button>
                      <button 
                        className="action-btn delete"
                        title="حذف"
                        onClick={() => handleDeleteClick(worker.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا العامل نهائياً؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف العامل"
        cancelText="إلغاء"
        isDestructive={true}
      />
    </div>
  );
};
