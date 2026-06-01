import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { Package, TrendingDown, Layers, Box, AlertTriangle, Send, History } from 'lucide-react';
import './Inventory.css';

export const InventoryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { balances, transactions } = useInventory();

  // KPIs
  const kpis = useMemo(() => {
    let totalStock = 0;
    let outThisMonth = 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    balances.forEach(b => {
      totalStock += b.currentBalance;
    });

    transactions.forEach(tx => {
      if (tx.type === 'OUT') {
        const d = new Date(tx.timestamp);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          outThisMonth += tx.quantity;
        }
      }
    });

    return { totalStock, outThisMonth };
  }, [balances, transactions]);

  // Group balances by WorkType (e.g. منقبي, بازلت)
  const groupedBalances = useMemo(() => {
    const grouped = new Map<string, typeof balances>();
    balances.forEach(b => {
      const arr = grouped.get(b.workType) || [];
      arr.push(b);
      grouped.set(b.workType, arr);
    });
    return Array.from(grouped.entries());
  }, [balances]);

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <div>
          <h2 className="inventory-title">لوحة تحكم المستودع والإنتاج</h2>
          <p className="inventory-subtitle">متابعة الأرصدة المتوفرة، والوارد والصادر من الأحجار</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => navigate('/app/inventory/ledger')}>
            <History size={18} />
            سجل حركة المخزون
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/app/inventory/dispatch')}>
            <Send size={18} />
            إصدار إذن صرف / تسليم
          </button>
        </div>
      </div>

      <div className="inventory-kpis">
        <div className="kpi-card">
          <div className="kpi-icon bg-indigo-100 text-indigo-600">
            <Package size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">إجمالي المخزون الحالي (وحدة)</span>
            <span className="kpi-value">{kpis.totalStock}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-rose-100 text-rose-600">
            <TrendingDown size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">إجمالي الصادر (هذا الشهر)</span>
            <span className="kpi-value">{kpis.outThisMonth}</span>
          </div>
        </div>
      </div>

      {groupedBalances.length === 0 ? (
        <div className="empty-inventory">
          <Box size={48} className="text-muted" />
          <p>لا توجد بيانات في المستودع حالياً.</p>
          <p className="text-sm">قم بإضافة تقارير يومية لتوليد أرصدة الإنتاج.</p>
        </div>
      ) : (
        <div className="inventory-categories">
          {groupedBalances.map(([workType, items]) => (
            <div key={workType} className="inventory-category-card glass-panel">
              <div className="category-header">
                <Layers className="text-primary" size={20} />
                <h3 className="category-title">{workType}</h3>
              </div>
              
              <div className="stock-grid">
                {items.map(item => {
                  const isLow = item.currentBalance <= 0;
                  return (
                    <div key={item.id} className={`stock-item-card ${isLow ? 'low-stock' : ''}`}>
                      <div className="stock-item-info">
                        <span className="stock-item-name">
                          {item.productionType !== 'غير محدد' ? item.productionType : ''} <span className="stock-item-size">({item.size})</span>
                        </span>
                        <div className="stock-item-stats">
                          <span className="stat-in" title="إجمالي الوارد">+{item.totalIn}</span>
                          <span className="stat-out" title="إجمالي الصادر">-{item.totalOut}</span>
                        </div>
                      </div>
                      <div className="stock-item-balance">
                        {isLow && <AlertTriangle size={14} />}
                        <span className="balance-qty">{item.currentBalance}</span>
                        <span className="balance-unit">{item.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
