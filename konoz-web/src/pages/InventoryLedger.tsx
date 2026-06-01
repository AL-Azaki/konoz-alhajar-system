import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { useSettings } from '../context/SettingsContext';
import { ArrowRight, Printer, Filter, ArrowDownToLine, ArrowUpFromLine, Search } from 'lucide-react';
import { format } from 'date-fns';
import './InventoryLedger.css';

export const InventoryLedger: React.FC = () => {
  const navigate = useNavigate();
  const { transactions } = useInventory();
  const { companyInfo } = useSettings();
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Sort transactions by timestamp descending (newest first)
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return sortedTransactions.filter(t => {
      // Date filter
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      
      // Type filter
      if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;
      
      // Text search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const fullItemString = `${t.workType} ${t.productionType} ${t.size} ${t.notes || ''} ${t.recipient || ''} ${t.driverName || ''}`.toLowerCase();
        if (!fullItemString.includes(query)) return false;
      }
      
      return true;
    });
  }, [sortedTransactions, startDate, endDate, typeFilter, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="ledger-page">
      {/* Printable Header (Only visible on print) */}
      <div className="print-header">
        <div className="print-company-info">
          <h2>{companyInfo.name}</h2>
          {companyInfo.vatNumber && <p>الرقم الضريبي: <span dir="ltr">{companyInfo.vatNumber}</span></p>}
          {companyInfo.phone && <p>الهاتف: <span dir="ltr">{companyInfo.phone}</span></p>}
          {companyInfo.address && <p>العنوان: {companyInfo.address}</p>}
        </div>
        <div className="print-report-title">
          <h1>كشف حركة المخزون</h1>
          <p>تاريخ الطباعة: {format(new Date(), 'yyyy/MM/dd HH:mm')}</p>
        </div>
      </div>

      <div className="page-header no-print">
        <div>
          <button className="btn-icon back-btn" onClick={() => navigate('/app/inventory')}>
            <ArrowRight size={20} />
          </button>
          <h2 className="page-title">سجل حركة المخزون</h2>
          <p className="page-subtitle">كشف حساب مفصل لجميع حركات الوارد والصادر</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={18} />
            طباعة الكشف
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-card glass-panel no-print">
        <div className="filters-header">
          <Filter size={18} />
          <span>خيارات البحث والتصفية</span>
        </div>
        <div className="filters-grid">
          <div className="filter-group">
            <label>من تاريخ</label>
            <input 
              type="date" 
              className="form-input" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
            />
          </div>
          <div className="filter-group">
            <label>إلى تاريخ</label>
            <input 
              type="date" 
              className="form-input" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
            />
          </div>
          <div className="filter-group">
            <label>نوع الحركة</label>
            <select 
              className="form-input" 
              value={typeFilter} 
              onChange={e => setTypeFilter(e.target.value as any)}
            >
              <option value="ALL">الكل (وارد وصادر)</option>
              <option value="IN">الوارد من الإنتاج فقط</option>
              <option value="OUT">الصادر للعملاء فقط</option>
            </select>
          </div>
          <div className="filter-group">
            <label>بحث سريع</label>
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                className="form-input" 
                placeholder="ابحث عن صنف، عميل، أو سائق..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="table-container glass-panel">
        <table className="ledger-table">
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>الحركة</th>
              <th>الصنف والمقاس</th>
              <th>الكمية</th>
              <th>العميل / السائق</th>
              <th>ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center empty-state">
                  لا توجد حركات مخزنية تطابق شروط البحث
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => (
                <tr key={tx.id} className={`tx-row ${tx.type === 'IN' ? 'row-in' : 'row-out'}`}>
                  <td className="tx-date">{tx.date}</td>
                  <td>
                    <div className={`tx-badge ${tx.type === 'IN' ? 'badge-in' : 'badge-out'}`}>
                      {tx.type === 'IN' ? <ArrowDownToLine size={14} /> : <ArrowUpFromLine size={14} />}
                      <span>{tx.type === 'IN' ? 'وارد (إنتاج)' : 'صادر (بيع)'}</span>
                    </div>
                  </td>
                  <td className="tx-item">
                    <span className="item-work">{tx.workType}</span>
                    <span className="item-prod">{tx.productionType !== 'غير محدد' ? tx.productionType : ''}</span>
                    <span className="item-size" dir="ltr">({tx.size})</span>
                  </td>
                  <td>
                    <span className={`tx-qty ${tx.type === 'IN' ? 'text-success' : 'text-danger'}`}>
                      {tx.type === 'IN' ? '+' : '-'}{tx.quantity} {tx.unit}
                    </span>
                  </td>
                  <td className="tx-details">
                    {tx.type === 'OUT' ? (
                      <div className="recipient-info">
                        {tx.recipient && <strong>{tx.recipient}</strong>}
                        {tx.driverName && <span className="driver-name"> | السائق: {tx.driverName}</span>}
                        {tx.truckType && <span className="truck-info"> ({tx.truckType} - {tx.truckOwnership})</span>}
                      </div>
                    ) : (
                      <span className="text-muted">المصنع</span>
                    )}
                  </td>
                  <td className="tx-notes">{tx.notes || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
