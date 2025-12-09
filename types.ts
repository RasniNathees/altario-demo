
export enum RegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum InvoiceStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export interface Registration {
  id: string;
  fullName: string;
  email: string;
  company: string;
  status: RegistrationStatus;
  createdAt: string;
  avatarUrl?: string;
  _count?: {
    invoices: number;
  };
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  registrationId: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  vatRate: number; // e.g. 0.20 for 20%
  notes?: string;
  createdAt: string;
}

// --- Pagination & API Types ---

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface DashboardStats {
 data:{
   totalRegistrations: number;
  pendingRegistrations: number;
  approvedRegistrations: number;
  rejectedRegistrations: number;
  totalRevenue: number;
  recentActivity: {
    name: string;
    status: RegistrationStatus;
    date: string;
  }[];
  statusDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
 }
}

export interface AppState {
  registrations: {
    items: Registration[];
    meta: PaginationMeta;
    loading: boolean;
    error: string | null;
  };
  invoices: {
    items: Invoice[];
    meta: PaginationMeta;
    loading: boolean;
    error: string | null;
  };
  dashboard: {
    stats: DashboardStats | null;
    loading: boolean;
    error: string | null;
  };
}
