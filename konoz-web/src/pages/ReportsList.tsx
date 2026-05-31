import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Printer, Edit2, Trash2, Filter } from 'lucide-react';
import { useReports } from '../context/ReportContext';
import { useWorkers } from '../context/WorkerContext';
import './ReportsList.css';

export const ReportsList: React.FC = () => {
  const navigate = useNavigate();
  const { reports, deleteReport } = useReports();
  const { workers } = useWorkers();

  // Filters State
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedWorker, setSelectedWorker] = useState<string>('all');

  // Extract unique months from reports for the filter dropdown (e.g., '2026-05')
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    reports.forEach(r => {
      if (r.date) {
        const monthStr = r.date.substring(0, 7); // yyyy-mm
        months.add(monthStr);
      }
    });
    // Sort descending
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [reports]);

  // Format month string to Arabic display
  const formatMonth = (monthStr: string) => {
    const date = new Date(`${monthStr}-01`);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' });
  };

  // Apply filters
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      // Exact Date Filter
      if (selectedDate && report.date !== selectedDate) {
        return false;
      }

      // Month Filter (only applied if exact date is not selected)
      if (!selectedDate && selectedMonth !== 'all' && !report.date.startsWith(selectedMonth)) {
        return false;
      }
      
      // Worker Filter
      if (selectedWorker !== 'all') {
        const workerId = parseInt(selectedWorker);
        const hasWorker = report.groups.some(g => g.workerIds.includes(workerId));
        if (!hasWorker) return false;
      }

      return true;
    });
  }, [reports, selectedDate, selectedMonth, selectedWorker]);

  const printDateText = useMemo(() => {
    if (filteredReports.length === 0) return 'جميع التواريخ';
    
    // Check if all filtered reports have the exact same date
    const firstDate = filteredReports[0].date;
    const allSameDate = filteredReports.every(r => r.date === firstDate);
    
    if (allSameDate) {
      // Return full formatted date: e.g. Sunday, 24 May 2026
      return new Date(firstDate).toLocaleDateString('ar-EG-u-nu-latn', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      });
    } else if (selectedMonth !== 'all') {
      return formatMonth(selectedMonth);
    }
    return 'جميع التواريخ';
  }, [filteredReports, selectedMonth]);

  const getWorkerNames = (workerIds: number[]) => {
    return workerIds
      .map(id => workers.find(w => w.id === id)?.name || 'غير معروف')
      .join('، ');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التقرير؟')) {
      deleteReport(id);
    }
  };

  return (
    <div className="reports-page">
      <div className="reports-header no-print">
        <div>
          <h2 className="reports-title">التقارير اليومية</h2>
          <p className="reports-subtitle">استعراض، تعديل، وطباعة التقارير اليومية للإنتاج</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={handlePrint}>
            <Printer size={18} />
            طباعة PDF
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/app/daily-report/new')}>
            <Plus size={18} />
            إنشاء تقرير جديد
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar no-print glass-panel">
        <div className="filter-title">
          <Filter size={18} />
          <span>تصفية التقارير</span>
        </div>
        <div className="filter-controls">
          <div className="filter-group">
            <label>التاريخ:</label>
            <input 
              type="date"
              className="input-field select-field"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                if (e.target.value) setSelectedMonth('all'); // reset month if exact date chosen
              }}
            />
          </div>
          <div className="filter-group">
            <label>الشهر الميلادي:</label>
            <select 
              className="input-field select-field"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                if (e.target.value !== 'all') setSelectedDate(''); // reset exact date if month chosen
              }}
            >
              <option value="all">جميع الأشهر</option>
              {availableMonths.map(m => (
                <option key={m} value={m}>{formatMonth(m)}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>اسم العامل:</label>
            <select 
              className="input-field select-field"
              value={selectedWorker}
              onChange={(e) => setSelectedWorker(e.target.value)}
            >
              <option value="all">جميع العمال</option>
              {workers.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Print Header - Only visible when printing */}
      <div className="print-only-header">
        <div className="print-header-side">
          <div className="print-logo-box primary-box">
            <span className="logo-box-icon">&#9670;</span>
            <span className="logo-box-name">مؤسسة كنوز الحجر</span>
            <span className="logo-box-sub">KONOZ AL-HAJAR</span>
          </div>
        </div>
        
        <div className="print-header-center">
          <h2 className="print-main-title">تقرير الإنتاج اليومي</h2>
          <p className="print-date-text">
            {printDateText}
          </p>
        </div>

        <div className="print-header-side left-side">
          <div className="print-logo-box secondary-box">
            <span className="logo-box-icon">&#9775;</span>
            <span className="logo-box-name">إدارة المصنع</span>
            <span className="logo-box-sub">FACTORY ADMIN</span>
          </div>
        </div>
      </div>

      <div className="reports-table-container glass-panel">
        <table className="reports-table">
          <thead>
            <tr>
              <th>#</th>
              <th>التاريخ</th>
              <th>العمال</th>
              <th>نوع العمل</th>
              <th>المقاس</th>
              <th>تفاصيل الإنتاج</th>
              <th>ساعات إضافية</th>
              <th>ملاحظات</th>
              <th className="no-print">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={9} className="empty-state">لا توجد تقارير مطابقة لخيارات التصفية الحالية.</td>
              </tr>
            ) : (
              filteredReports.map((report, index) => (
                <React.Fragment key={report.id}>
                  {report.groups.map((group, gIndex) => (
                    group.productionItems.map((prod, pIndex) => (
                      <tr key={`${report.id}-${group.id}-${prod.id}`}>
                        {/* Only show Report ID and Date on the first row of the report */}
                        {(gIndex === 0 && pIndex === 0) ? (
                          <>
                            <td data-label="#" rowSpan={report.groups.reduce((acc, g) => acc + g.productionItems.length, 0)}>{filteredReports.length - index}</td>
                            <td data-label="التاريخ" rowSpan={report.groups.reduce((acc, g) => acc + g.productionItems.length, 0)}>{report.date}</td>
                          </>
                        ) : null}
                        
                        {/* Only show Workers, Extra Hours, and Notes on the first row of the group */}
                        {pIndex === 0 ? (
                          <>
                            <td data-label="العمال" rowSpan={group.productionItems.length}>
                              <div className="worker-names">{getWorkerNames(group.workerIds)}</div>
                            </td>
                          </>
                        ) : null}

                        <td data-label="نوع العمل">{prod.workType}</td>
                        <td data-label="المقاس">{prod.size}</td>
                        <td data-label="تفاصيل الإنتاج">
                          <span className="prod-badge">{prod.productionType}: {prod.quantity} {prod.unit}</span>
                        </td>

                        {pIndex === 0 ? (
                          <>
                            <td data-label="ساعات إضافية" rowSpan={group.productionItems.length}>
                              {group.extraHours > 0 ? `${group.extraHours} س` : '—'}
                            </td>
                            <td data-label="ملاحظات" rowSpan={group.productionItems.length}>
                              {group.extraDuties || '—'}
                            </td>
                          </>
                        ) : null}

                        {/* Actions cell */}
                        {(gIndex === 0 && pIndex === 0) ? (
                          <td data-label="إجراءات" className="no-print" rowSpan={report.groups.reduce((acc, g) => acc + g.productionItems.length, 0)}>
                            <div className="actions-cell">
                              <button className="btn-icon" title="تعديل" onClick={() => navigate(`/app/daily-report/edit/${report.id}`)}>
                                <Edit2 size={18} />
                              </button>
                              <button className="btn-icon danger" title="حذف" onClick={() => handleDelete(report.id)}>
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        ) : null}
                      </tr>
                    ))
                  ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>

        {/* Print Footer - Only visible when printing */}
        <div className="print-only-footer">
          <div className="print-signatures">
            <div className="signature-box">
              <p className="sig-title">مسؤول الإنتاج / مدخل البيانات</p>
              <p className="sig-line">التوقيع: .......................................</p>
            </div>
            <div className="signature-box center-align">
              <p className="sig-title">المدير التنفيذي</p>
              <p className="sig-name">خالد العزكي</p>
              <p className="sig-line">التوقيع: .......................................</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
