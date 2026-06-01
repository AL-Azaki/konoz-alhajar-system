import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { useSettings } from '../context/SettingsContext';
import { Save, Plus, Trash2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import './InventoryDispatch.css';

interface DispatchItem {
  id: string;
  workType: string;
  productionType: string;
  size: string;
  quantity: number;
}

export const InventoryDispatch: React.FC = () => {
  const navigate = useNavigate();
  const { balances, addDispatch } = useInventory();
  const { factorySettings } = useSettings();
  
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [recipient, setRecipient] = useState(''); // اسم العميل / الشركة
  const [driverName, setDriverName] = useState('');
  const [truckType, setTruckType] = useState('تريلا');
  const [truckOwnership, setTruckOwnership] = useState('إيجار');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<DispatchItem[]>([{ 
    id: Date.now().toString(), 
    workType: factorySettings.workTypes[0] || '', 
    productionType: factorySettings.productionTypes[0] || '', 
    size: factorySettings.sizes[0] || '', 
    quantity: 1 
  }]);

  const WORK_TYPES = factorySettings.workTypes;
  const PRODUCTION_TYPES = factorySettings.productionTypes;
  const SIZES = factorySettings.sizes;

  const handleAddItem = () => {
    setItems([...items, { 
      id: Date.now().toString(), 
      workType: factorySettings.workTypes[0] || '', 
      productionType: factorySettings.productionTypes[0] || '', 
      size: factorySettings.sizes[0] || '', 
      quantity: 1 
    }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof DispatchItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        if (field === 'quantity') {
          // Prevent negative or zero quantity
          const val = Math.max(1, Number(value) || 1);
          return { ...item, [field]: val };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipient.trim()) {
      toast.error('يرجى إدخال اسم العميل أو الشركة المستلمة');
      return;
    }

    if (!driverName.trim()) {
      toast.error('يرجى إدخال اسم السائق');
      return;
    }

    // Validation against current balances
    for (const item of items) {
      const stockItem = balances.find(b => 
        b.workType === item.workType && 
        b.productionType === item.productionType && 
        b.size === item.size
      );
      
      const currentBalance = stockItem ? stockItem.currentBalance : 0;

      // Check if this item is selected multiple times in the form
      const totalRequestedForThisStock = items
        .filter(i => 
          i.workType === item.workType && 
          i.productionType === item.productionType && 
          i.size === item.size
        )
        .reduce((sum, i) => sum + i.quantity, 0);

      if (totalRequestedForThisStock > currentBalance) {
        toast.error(`الكمية المطلوبة من ${item.workType} ${item.productionType} (${item.size}) تتجاوز الرصيد المتاح (${currentBalance})`);
        return;
      }
    }

    setIsSubmitting(true);

    // Simulate network delay for sweet animation
    setTimeout(() => {
      // Process transactions
      items.forEach(item => {
        // Find the unit from the stock if it exists, otherwise default to طبلية
        const stockItem = balances.find(b => 
          b.workType === item.workType && 
          b.productionType === item.productionType && 
          b.size === item.size
        );
        const unit = stockItem ? stockItem.unit : 'طبلية';

        addDispatch({
          date,
          recipient,
          driverName,
          truckType,
          truckOwnership,
          notes,
          workType: item.workType,
          productionType: item.productionType,
          size: item.size,
          unit: unit,
          quantity: item.quantity,
        });
      });

      toast.success('تم تسجيل أمر الصرف وخصم الكميات من المستودع بنجاح');
      navigate('/app/inventory');
    }, 600);
  };

  return (
    <div className="dispatch-page">
      <div className="page-header">
        <div>
          <button className="btn-icon back-btn" onClick={() => navigate('/app/inventory')}>
            <ArrowRight size={20} />
          </button>
          <h2 className="page-title">إصدار إذن صرف / تسليم</h2>
          <p className="page-subtitle">تسجيل خروج الأحجار من المصنع وخصمها من رصيد المستودع</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="dispatch-form glass-panel">
        <div className="form-section">
          <h3 className="section-title">المعلومات الأساسية</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>تاريخ الصرف</label>
              <input 
                type="date" 
                className="form-input" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>العميل (الشركة المستلمة)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="أدخل اسم العميل أو الشركة..." 
                value={recipient} 
                onChange={(e) => setRecipient(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>اسم السائق</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="أدخل اسم السائق..." 
                value={driverName} 
                onChange={(e) => setDriverName(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>نوع الشاحنة</label>
              <select className="form-input" value={truckType} onChange={(e) => setTruckType(e.target.value)}>
                <option value="تريلا">تريلا</option>
                <option value="ونش">ونش</option>
                <option value="دينا">دينا</option>
                <option value="قلاب">قلاب</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>
            <div className="form-group">
              <label>ملكية الشاحنة</label>
              <select className="form-input" value={truckOwnership} onChange={(e) => setTruckOwnership(e.target.value)}>
                <option value="إيجار">إيجار (مستأجرة)</option>
                <option value="ملك الشركة">ملك الشركة</option>
              </select>
            </div>
            <div className="form-group">
              <label>ملاحظات إضافية (اختياري)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="رقم السيارة، رقم الفاتورة..." 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header-flex">
            <h3 className="section-title">الأصناف المنصرفة</h3>
            <button type="button" className="btn btn-outline btn-sm" onClick={handleAddItem}>
              <Plus size={16} /> إضافة صنف آخر
            </button>
          </div>

          <div className="dispatch-items-list">
            {items.map((item, index) => {
              const stockItem = balances.find(b => 
                b.workType === item.workType && 
                b.productionType === item.productionType && 
                b.size === item.size
              );
              const available = stockItem ? stockItem.currentBalance : 0;
              const isAvailable = available >= item.quantity;

              return (
                <div key={item.id} className={`dispatch-item-row ${!isAvailable ? 'error-row' : ''}`}>
                  <div className="item-number">{index + 1}</div>
                  
                  <div className="form-group">
                    <label>نوع الحجر</label>
                    <select 
                      className="form-input"
                      value={item.workType}
                      onChange={(e) => handleItemChange(item.id, 'workType', e.target.value)}
                    >
                      {WORK_TYPES.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>نوع العمل</label>
                    <select 
                      className="form-input"
                      value={item.productionType}
                      onChange={(e) => handleItemChange(item.id, 'productionType', e.target.value)}
                    >
                      {PRODUCTION_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>المقاس</label>
                    <select 
                      className="form-input"
                      value={item.size}
                      onChange={(e) => handleItemChange(item.id, 'size', e.target.value)}
                    >
                      {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>الكمية (المتوفر: {available})</label>
                    <input 
                      type="number" 
                      min="1"
                      className={`form-input ${!isAvailable ? 'input-error' : ''}`} 
                      value={item.quantity} 
                      onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} 
                      required 
                    />
                    {!isAvailable && (
                      <span className="validation-message">
                        {available === 0 
                          ? '❌ هذا الصنف غير متوفر حالياً في المستودع!' 
                          : `❌ الكمية المطلوبة تتجاوز المتوفر (${available} فقط)`}
                      </span>
                    )}
                  </div>

                  <div className="item-actions">
                    <button 
                      type="button" 
                      className="btn-icon danger" 
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={items.length === 1}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="form-actions">
          <Button type="button" variant="outline" onClick={() => navigate('/app/inventory')} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button type="submit" isLoading={isSubmitting} rightIcon={<Save size={18} />}>
            حفظ إذن الصرف وخصم المخزون
          </Button>
        </div>
        
        {/* Invisible padding to force dropdowns downwards as we agreed previously */}
        <div style={{ height: '30vh' }}></div>
      </form>
    </div>
  );
};
