import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export interface Worker {
  id: number;
  name: string;
  phone: string;
  joined_at: string; // API field name
  joinDate: string;  // frontend alias
  isActive: boolean;
  is_active: boolean;
}

interface WorkerContextType {
  workers: Worker[];
  loading: boolean;
  addWorker: (worker: { name: string; phone: string; joined_at: string }) => Promise<void>;
  updateWorker: (id: number, updates: Partial<Worker>) => Promise<void>;
  deleteWorker: (id: number) => Promise<void>;
  toggleWorkerStatus: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const WorkerContext = createContext<WorkerContextType | undefined>(undefined);

/** Normalize API response → frontend Worker shape */
const normalize = (w: Record<string, unknown>): Worker => ({
  id: w.id as number,
  name: w.name as string,
  phone: (w.phone ?? '') as string,
  joined_at: (w.joined_at ?? '') as string,
  joinDate: (w.joined_at ?? '') as string,
  is_active: !!w.is_active,
  isActive: !!w.is_active,
});

export const WorkerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/workers');
      setWorkers(data.map(normalize));
    } catch (err) {
      console.error('Failed to load workers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addWorker = async (payload: { name: string; phone: string; joined_at: string }) => {
    const { data } = await api.post('/workers', { ...payload, is_active: true });
    setWorkers(prev => [...prev, normalize(data)]);
  };

  const updateWorker = async (id: number, updates: Partial<Worker>) => {
    const payload: Record<string, unknown> = {};
    if (updates.name !== undefined)     payload.name      = updates.name;
    if (updates.phone !== undefined)    payload.phone     = updates.phone;
    if (updates.joined_at !== undefined) payload.joined_at = updates.joined_at;
    if (updates.joinDate !== undefined)  payload.joined_at = updates.joinDate;
    if (updates.isActive !== undefined)  payload.is_active = updates.isActive;
    if (updates.is_active !== undefined) payload.is_active = updates.is_active;

    const { data } = await api.put(`/workers/${id}`, payload);
    setWorkers(prev => prev.map(w => w.id === id ? normalize(data) : w));
  };

  const deleteWorker = async (id: number) => {
    await api.delete(`/workers/${id}`);
    setWorkers(prev => prev.filter(w => w.id !== id));
  };

  const toggleWorkerStatus = async (id: number) => {
    const worker = workers.find(w => w.id === id);
    if (!worker) return;
    await updateWorker(id, { is_active: !worker.is_active, isActive: !worker.isActive });
  };

  return (
    <WorkerContext.Provider value={{ workers, loading, addWorker, updateWorker, deleteWorker, toggleWorkerStatus, refresh }}>
      {children}
    </WorkerContext.Provider>
  );
};

export const useWorkers = () => {
  const context = useContext(WorkerContext);
  if (!context) throw new Error('useWorkers must be used within WorkerProvider');
  return context;
};
