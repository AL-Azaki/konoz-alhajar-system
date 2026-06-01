import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { InventoryTransaction, StockBalance } from '../types/inventory';
import { useReports } from './ReportContext';

interface InventoryContextType {
  balances: StockBalance[];
  transactions: InventoryTransaction[];
  addDispatch: (transaction: Omit<InventoryTransaction, 'id' | 'timestamp' | 'type' | 'source'>) => void;
  deleteTransaction: (id: string) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { reports } = useReports();
  const [manualTransactions, setManualTransactions] = useState<InventoryTransaction[]>(() => {
    const saved = localStorage.getItem('konoz_inventory_transactions');
    try {
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('konoz_inventory_transactions', JSON.stringify(manualTransactions));
  }, [manualTransactions]);

  // Combine automated IN transactions (from reports) and manual transactions
  const transactions = useMemo(() => {
    const allTxs: InventoryTransaction[] = [...manualTransactions];

    reports?.forEach(report => {
      report.groups?.forEach(group => {
        group.productionItems?.forEach(item => {
          allTxs.push({
            id: `prod-${report.id}-${group.id}-${item.id}`,
            date: report.date,
            type: 'IN',
            source: 'تقرير إنتاج يومي',
            referenceId: report.id,
            workType: item.workType,
            productionType: item.productionType,
            size: item.size,
            unit: item.unit,
            quantity: item.quantity,
            timestamp: new Date(report.date).getTime()
          });
        });
      });
    });

    // Sort by timestamp descending
    return allTxs.sort((a, b) => b.timestamp - a.timestamp);
  }, [reports, manualTransactions]);

  // Calculate real-time balances
  const balances = useMemo(() => {
    const balanceMap = new Map<string, StockBalance>();

    transactions.forEach(tx => {
      const key = `${tx.workType}|${tx.productionType}|${tx.size}|${tx.unit}`;
      
      if (!balanceMap.has(key)) {
        balanceMap.set(key, {
          id: key,
          workType: tx.workType,
          productionType: tx.productionType,
          size: tx.size,
          unit: tx.unit,
          totalIn: 0,
          totalOut: 0,
          currentBalance: 0
        });
      }

      const balance = balanceMap.get(key)!;
      if (tx.type === 'IN') {
        balance.totalIn += tx.quantity;
      } else {
        balance.totalOut += tx.quantity;
      }
      balance.currentBalance = balance.totalIn - balance.totalOut;
    });

    // Filter out items that have 0 total in AND out (just in case)
    return Array.from(balanceMap.values()).filter(b => b.totalIn > 0 || b.totalOut > 0);
  }, [transactions]);

  const addDispatch = (txData: Omit<InventoryTransaction, 'id' | 'timestamp' | 'type' | 'source'>) => {
    const newTx: InventoryTransaction = {
      ...txData,
      id: `disp-${Date.now()}`,
      type: 'OUT',
      source: 'إذن صرف / تحميل',
      timestamp: Date.now()
    };
    setManualTransactions(prev => [newTx, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setManualTransactions(prev => prev.filter(tx => tx.id !== id));
  };

  return (
    <InventoryContext.Provider value={{ balances, transactions, addDispatch, deleteTransaction }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
