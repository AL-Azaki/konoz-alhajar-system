import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Printer, Edit2, Trash2 } from 'lucide-react';
import { useReports } from '../context/ReportContext';
import { useWorkers } from '../context/WorkerContext';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Clock, Layers, Users } from 'lucide-react';
import './ReportsList.css';

import { format } from 'date-fns';

export const ReportsList: React.FC = () => {
  const navigate = useNavigate();
  const { reports, deleteReport } = useReports();
  const { workers } = useWorkers();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  // Calculate Summary Statistics for TODAY only
  const summaryStats = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todaysReports = reports.filter(r => r.date === today);

    let totalWorkers = new Set<number>();
    let totalExtraHours = 0;
    
    // Group production: workType -> productionType -> size -> unit -> qty
    const productionMap = new Map<string, { workType: string, productionType: string, size: string, unit: string, qty: number }>();

    todaysReports.forEach(report => {
      report.groups.forEach(g => {
        g.workerIds.forEach(id => totalWorkers.add(id));
        totalExtraHours += g.extraHours;
        
        g.productionItems.forEach(item => {
          // Exclude things that are not actual stone production if they want, but let's include all to be safe
          const key = `${item.workType}|${item.productionType}|${item.size}|${item.unit}`;
          if (productionMap.has(key)) {
            productionMap.get(key)!.qty += item.quantity;
          } else {
            productionMap.set(key, { 
              workType: item.workType, 
              productionType: item.productionType, 
              size: item.size, 
              unit: item.unit, 
              qty: item.quantity 
            });
          }
        });
      });
    });

    return {
      workersCount: totalWorkers.size,
      extraHours: totalExtraHours,
      productionDetails: Array.from(productionMap.values())
    };
  }, [reports]);

  const printDateText = useMemo(() => {
    if (reports.length === 0) return 'جميع التواريخ';
    
    // Return full formatted date for today
    return new Date().toLocaleDateString('ar-EG-u-nu-latn', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
  }, [reports]);

  const getWorkerNames = (workerIds: number[]) => {
    return workerIds
      .map(id => workers.find(w => w.id === id)?.name || 'غير معروف')
      .join('، ');
  };

  const handlePrint = () => {
    window.print();
  };

  const confirmDelete = () => {
    if (reportToDelete) {
      deleteReport(reportToDelete);
      setReportToDelete(null);
      setDeleteModalOpen(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setReportToDelete(id);
    setDeleteModalOpen(true);
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

      {/* Summary Cards */}
      <div className="summary-cards-container no-print">
        <div className="summary-card compact-card">
          <div className="summary-icon-box bg-blue-100 text-blue-600">
            <Users size={20} />
          </div>
          <div className="summary-info">
            <span className="summary-label">العمال المداومين (اليوم)</span>
            <span className="summary-value">{summaryStats.workersCount}</span>
          </div>
        </div>
        
        <div className="summary-card compact-card">
          <div className="summary-icon-box bg-purple-100 text-purple-600">
            <Clock size={20} />
          </div>
          <div className="summary-info">
            <span className="summary-label">الساعات الإضافية (اليوم)</span>
            <span className="summary-value">{summaryStats.extraHours} س</span>
          </div>
        </div>

        <div className="summary-card full-width-card production-summary-card">
          <div className="summary-icon-box bg-green-100 text-green-600">
            <Layers size={20} />
          </div>
          <div className="summary-info w-full">
            <span className="summary-label">تفاصيل الإنتاج المنجز لليوم (مفصل بالمقاس)</span>
            <div className="production-chips-container">
              {summaryStats.productionDetails.length === 0 ? (
                <span className="text-muted text-sm">لا يوجد إنتاج مسجل</span>
              ) : (
                summaryStats.productionDetails.map((item, idx) => (
                  <div key={idx} className="prod-stat-chip">
                    <span className="prod-stat-title">
                      {item.workType} {item.productionType !== 'غير محدد' ? item.productionType : ''} <span className="prod-stat-size">({item.size})</span>
                    </span>
                    <span className="prod-stat-qty">
                      {item.qty} {item.unit}
                    </span>
                  </div>
                ))
              )}
            </div>
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
        <div className="table-responsive" style={{ minHeight: '300px' }}>
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
            {reports.length === 0 ? (
              <tr>
                <td colSpan={9} className="empty-state">لا توجد تقارير مسجلة بعد.</td>
              </tr>
            ) : (
              reports.map((report, index) => (
                <React.Fragment key={report.id}>
                  {report.groups.map((group, gIndex) => (
                    group.productionItems.map((prod, pIndex) => (
                      <tr key={`${report.id}-${group.id}-${prod.id}`}>
                        {/* Only show Report ID and Date on the first row of the report */}
                        {(gIndex === 0 && pIndex === 0) ? (
                          <>
                            <td data-label="#" rowSpan={report.groups.reduce((acc, g) => acc + g.productionItems.length, 0)}>{reports.length - index}</td>
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
                              <button className="btn-icon danger" title="حذف" onClick={() => handleDeleteClick(report.id)}>
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
        </div>

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

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا التقرير؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف التقرير"
        cancelText="إلغاء"
        isDestructive={true}
      />
    </div>
  );
};
