import React, { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, Users, FileText, Check, Clock } from 'lucide-react';
import { useWorkers } from '../context/WorkerContext';
import { useReports } from '../context/ReportContext';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';
import './DailyReportEntry.css';

const WORK_TYPES = [
  'حجر منقبي', 'حجر بازلت', 'تنظيف', 'تغليف', 'طلع الجمخة', 'قص', 'تصفية', 'أخرى'
];

const PRODUCTION_TYPES = ['محكوم', 'عادي', 'نص رص محكوم', 'غير محدد'];
const SIZES = ['20 سم', '25 سم', '30 سم', '4', '5', '8', '20x20x8', 'أخرى'];
const UNITS = ['طبلية', 'رصة', 'قطعة', 'متر', 'ساعة'];

export interface ProductionItem {
  id: string;
  workType: string;
  productionType: string;
  size: string;
  unit: string;
  quantity: number;
}

export interface WorkerGroup {
  id: string;
  workerIds: number[];
  productionItems: ProductionItem[];
  extraDuties: string;
  extraHours: number;
}

export const DailyReportEntry: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { workers } = useWorkers();
  const { reports, addReport, updateReport } = useReports();
  const navigate = useNavigate();
  const [reportDate, setReportDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [groups, setGroups] = useState<WorkerGroup[]>([{
    id: Date.now().toString(),
    workerIds: [],
    productionItems: [{
      id: Date.now().toString() + '_prod',
      workType: 'حجر منقبي',
      productionType: 'محكوم',
      size: '20',
      unit: 'طبلية',
      quantity: 1
    }],
    extraDuties: '',
    extraHours: 0
  }]);

  // If in edit mode, populate form with existing report
  React.useEffect(() => {
    if (id) {
      const existingReport = reports.find(r => r.id === id);
      if (existingReport) {
        setReportDate(existingReport.date);
        setGroups(existingReport.groups);
      } else {
        // If report not found, go back
        navigate('/app/daily-report');
      }
    }
  }, [id, reports, navigate]);

  const addGroup = () => {
    setGroups([...groups, {
      id: Date.now().toString(),
      workerIds: [],
      productionItems: [{
        id: Date.now().toString() + '_prod',
        workType: 'حجر منقبي',
        productionType: 'محكوم',
        size: '20',
        unit: 'طبلية',
        quantity: 1
      }],
      extraDuties: '',
      extraHours: 0
    }]);
  };

  const removeGroup = (id: string) => {
    setGroups(groups.filter(g => g.id !== id));
  };

  const updateGroup = (id: string, updates: Partial<WorkerGroup>) => {
    setGroups(groups.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const toggleWorker = (groupId: string, workerId: number) => {
    setGroups(groups.map(g => {
      if (g.id !== groupId) return g;
      const exists = g.workerIds.includes(workerId);
      const newWorkerIds = exists 
        ? g.workerIds.filter(id => id !== workerId)
        : [...g.workerIds, workerId];
      return { ...g, workerIds: newWorkerIds };
    }));
  };

  const addProductionItem = (groupId: string) => {
    setGroups(groups.map(g => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        productionItems: [...g.productionItems, {
          id: Date.now().toString() + '_prod',
          workType: 'حجر منقبي',
          productionType: 'محكوم',
          size: '20',
          unit: 'طبلية',
          quantity: 1
        }]
      };
    }));
  };

  const updateProductionItem = (groupId: string, prodId: string, updates: Partial<ProductionItem>) => {
    setGroups(groups.map(g => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        productionItems: g.productionItems.map(p => p.id === prodId ? { ...p, ...updates } : p)
      };
    }));
  };

  const removeProductionItem = (groupId: string, prodId: string) => {
    setGroups(groups.map(g => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        productionItems: g.productionItems.filter(p => p.id !== prodId)
      };
    }));
  };

  const handleSave = async () => {
    // Basic validation
    if (groups.length === 0) {
      toast.error('يجب إضافة مجموعة عمل واحدة على الأقل');
      return;
    }

    if (groups.some(g => g.workerIds.length === 0)) {
      toast.error('يجب تحديد العمال المنفذين لكل مجموعة عمل.');
      return;
    }

    const newReport = {
      date: reportDate,
      groups: groups
    };

    try {
      if (id) {
        await updateReport(id, newReport);
        toast.success('تم تعديل التقرير بنجاح');
      } else {
        await addReport(newReport);
        toast.success('تم حفظ التقرير بنجاح');
      }
      navigate('/app/daily-report');
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="report-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">{id ? 'تعديل التقرير اليومي' : 'إدخال تقرير يومي جديد'}</h2>
          <p className="page-subtitle">أدخل تفاصيل إنتاج العمال والساعات الإضافية</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => navigate('/app/daily-report')} style={{ marginLeft: '1rem' }}>
            إلغاء
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Check size={18} />
            {id ? 'حفظ التعديلات' : 'حفظ التقرير'}
          </button>
        </div>
      </div>

      <div className="report-form glass-panel">
        <div className="form-section">
          <div className="input-group date-group">
            <label className="input-label">تاريخ التقرير</label>
            <input 
              type="date" 
              className="input-field" 
              value={reportDate} 
              onChange={e => setReportDate(e.target.value)}
            />
          </div>
        </div>

        <div className="groups-container">
          {groups.map((group, index) => (
            <div key={group.id} className="worker-group-card">
              <div className="group-header">
                <h3>مجموعة العمل #{index + 1}</h3>
                <button className="btn-icon danger" title="حذف المجموعة" onClick={() => removeGroup(group.id)}>
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="group-body">
                <div className="workers-selection">
                  <label className="input-label">
                    <Users size={16} className="inline-icon" />
                    العمال المنفذين
                  </label>
                  <div className="workers-grid">
                    {workers.filter(w => w.isActive).map(worker => (
                      <div 
                        key={worker.id} 
                        className={`worker-chip ${group.workerIds.includes(worker.id) ? 'selected' : ''}`}
                        onClick={() => toggleWorker(group.id, worker.id)}
                      >
                        {worker.name}
                      </div>
                    ))}
                    {workers.filter(w => w.isActive).length === 0 && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>لا يوجد عمال نشطين. يرجى إضافتهم من إدارة العمال أولاً.</span>
                    )}
                  </div>
                </div>

                <div className="production-items">
                  <label className="input-label">
                    <FileText size={16} className="inline-icon" />
                    الإنتاج المنجز
                  </label>

                  <div className="production-grid-header desktop-only">
                    <div>نوع العمل</div>
                    <div>نوع الإنتاج</div>
                    <div>المقاس</div>
                    <div>الكمية</div>
                    <div>الوحدة</div>
                    <div></div>
                  </div>
                  
                  {group.productionItems.map((prod) => (
                    <div key={prod.id} className="production-grid-row">
                      <div className="mobile-field-group">
                        <label className="mobile-only-label">نوع العمل</label>
                        <select 
                          className="input-field select-field w-full" 
                          value={prod.workType}
                          onChange={e => updateProductionItem(group.id, prod.id, { workType: e.target.value })}
                        >
                          {WORK_TYPES.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                      </div>
                      
                      <div className="mobile-field-group">
                        <label className="mobile-only-label">نوع الإنتاج</label>
                        <select 
                          className="input-field select-field w-full"
                          value={prod.productionType}
                          onChange={e => updateProductionItem(group.id, prod.id, { productionType: e.target.value })}
                        >
                          {PRODUCTION_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>

                      <div className="mobile-field-group">
                        <label className="mobile-only-label">المقاس</label>
                        <select 
                          className="input-field select-field w-full"
                          value={prod.size}
                          onChange={e => updateProductionItem(group.id, prod.id, { size: e.target.value })}
                        >
                          {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      <div className="mobile-field-group">
                        <label className="mobile-only-label">الكمية</label>
                        <input 
                          type="number" 
                          className="input-field qty-field w-full" 
                          value={prod.quantity}
                          onChange={e => updateProductionItem(group.id, prod.id, { quantity: Number(e.target.value) })}
                          min="1"
                        />
                      </div>

                      <div className="mobile-field-group">
                        <label className="mobile-only-label">الوحدة</label>
                        <select 
                          className="input-field select-field unit-field w-full"
                          value={prod.unit}
                          onChange={e => updateProductionItem(group.id, prod.id, { unit: e.target.value })}
                        >
                          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>

                      <div className="mobile-field-group action-group">
                        <button className="btn-icon danger sm" title="حذف هذا السطر" onClick={() => removeProductionItem(group.id, prod.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button className="btn btn-outline sm mt-2" onClick={() => addProductionItem(group.id)}>
                    <Plus size={16} />
                    إضافة عنصر إنتاج
                  </button>
                </div>

                <div className="extra-info-row">
                  <div className="input-group flex-1">
                    <label className="input-label">ملاحظات / مهام أخرى (مثل: تنظيف المنشار)</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="أدخل أي مهام إضافية هنا..."
                      value={group.extraDuties}
                      onChange={e => updateGroup(group.id, { extraDuties: e.target.value })}
                    />
                  </div>
                  <div className="input-group hours-group">
                    <label className="input-label">
                      <Clock size={16} className="inline-icon" />
                      ساعات إضافي (لكل عامل)
                    </label>
                    <input 
                      type="number" 
                      className="input-field" 
                      min="0"
                      value={group.extraHours}
                      onChange={e => updateGroup(group.id, { extraHours: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="btn btn-outline add-group-btn" onClick={addGroup}>
          <Plus size={20} />
          إضافة مجموعة عمل جديدة
        </button>
      </div>
    </div>
  );
};
