import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

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

export interface DailyReport {
  id: string;
  date: string;
  created_by?: string;
  groups: WorkerGroup[];
  createdAt: string;
}

interface ReportContextType {
  reports: DailyReport[];
  loading: boolean;
  addReport: (report: Omit<DailyReport, 'id' | 'createdAt'>) => Promise<void>;
  updateReport: (id: string, report: Omit<DailyReport, 'id' | 'createdAt'>) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const ReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/daily-reports');
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addReport = async (reportData: Omit<DailyReport, 'id' | 'createdAt'>) => {
    const { data } = await api.post('/daily-reports', reportData);
    setReports(prev => [data, ...prev]);
  };

  const updateReport = async (id: string, reportData: Omit<DailyReport, 'id' | 'createdAt'>) => {
    const { data } = await api.put(`/daily-reports/${id}`, reportData);
    setReports(prev => prev.map(r => r.id === id ? data : r));
  };

  const deleteReport = async (id: string) => {
    await api.delete(`/daily-reports/${id}`);
    setReports(prev => prev.filter(r => r.id !== id));
  };

  return (
    <ReportContext.Provider value={{ reports, loading, addReport, updateReport, deleteReport, refresh }}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportContext);
  if (!context) throw new Error('useReports must be used within ReportProvider');
  return context;
};
