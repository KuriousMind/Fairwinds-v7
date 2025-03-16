// TypeScript types for the data models

export interface User {
  id: string;
  userId: string;
  email: string;
  rv?: RV;
}

export interface RV {
  id: string;
  make: string;
  model: string;
  year: number;
  type?: string;
  length?: number;
  height?: number;
  width?: number;
  weight?: number;
  licensePlate?: string;
  notes?: string;
  photos?: string[];
  userId: string;
  owner?: User;
  documents?: Document[];
  maintenanceRecords?: MaintenanceRecord[];
}

export interface MaintenanceRecord {
  id: string;
  title: string;
  date: string;
  type: string;
  notes?: string;
  photos?: string[];
  rvId: string;
  rv?: RV;
  documents?: Document[];
  
  // Recurring maintenance fields
  isRecurring?: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurringInterval?: number;
  recurringEndDate?: string;
  parentRecordId?: string; // For linked recurring records
}

export interface Document {
  id: string;
  title: string;
  type: string;
  url: string;
  tags?: string[];
  rvId?: string;
  maintenanceRecordId?: string;
  rv?: RV;
  maintenanceRecord?: MaintenanceRecord;
}
