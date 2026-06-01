export interface InventoryTransaction {
  id: string;
  date: string;
  type: 'IN' | 'OUT';
  source: string; // 'Production Report', 'Dispatch', 'Manual Adjustment'
  referenceId?: string; // ID of the report or invoice
  workType: string;
  productionType: string;
  size: string;
  unit: string;
  quantity: number;
  recipient?: string; // العميل (الشركة المستلمة)
  driverName?: string; // اسم السائق
  truckType?: string; // نوع الشاحنة (تريلا، ونش، الخ)
  truckOwnership?: string; // ملك أم إيجار
  notes?: string;
  timestamp: number;
}

export interface StockBalance {
  id: string; // e.g., "حجر منقبي|محكوم|20|طبلية"
  workType: string;
  productionType: string;
  size: string;
  unit: string;
  totalIn: number;
  totalOut: number;
  currentBalance: number;
}
