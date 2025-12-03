
// Enums
export enum UnitOfMeasure {
  UN = 'UN',
  KG = 'KG',
  LT = 'LT',
  MT = 'MT'
}

export enum PaymentMethod {
  CASH = 'DINHEIRO',
  CREDIT_CARD = 'CARTAO_CREDITO',
  DEBIT_CARD = 'CARTAO_DEBITO',
  PIX = 'PIX',
  CREDIT = 'FIADO'
}

export enum ProductStatus {
  ACTIVE = 'ATIVO',
  INACTIVE = 'INATIVO'
}

export enum UserRole {
  MASTER = 'Master',
  MANAGER = 'Gerente',
  OPERATOR = 'Operador'
}

// Interfaces
export interface Product {
  id: string;
  code: string;
  barcode: string;
  name: string;
  description?: string;
  category: string;
  unit: UnitOfMeasure;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  image?: string;
  status: ProductStatus;
  createdAt: string;
}

export interface CartItem extends Product {
  quantity: number;
  total: number;
}

export interface Customer {
  id: string;
  name: string;
  document: string; // CPF/CNPJ
  phone: string;
  email?: string;
  address?: string;
  creditLimit: number;
  active: boolean;
}

export interface Sale {
  id: string;
  items: CartItem[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paymentMethod: PaymentMethod;
  customerId?: string; // Optional if anonymous
  timestamp: string;
  synced: boolean;
}

export interface DashboardStats {
  totalSales: number;
  transactionCount: number;
  averageTicket: number;
  topProducts: { name: string; value: number }[];
}

export interface PlanConfig {
  id: string; // Changed to string to allow dynamic IDs
  name: string;
  productLimit: number; // -1 for unlimited
  userLimit: number;
  implementationFee: number;
  supportFee: number;
  features: string[];
}

// Admin / Master Interfaces
export interface Tenant {
  id: string;
  companyName: string;
  ownerName: string;
  email: string; // Used as Login
  tempPassword?: string; // Only used during creation/reset
  document: string; // CNPJ
  plan: string; // Changed to string to match PlanConfig.id
  status: 'Active' | 'Blocked' | 'Pending';
  monthlyFee: number;
  nextBilling: string;
  joinedAt: string;
  mustChangePassword?: boolean;
}

// Interface para Funcionários criados pelo Gerente
export interface TenantUser {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  password: string; // Em um sistema real, seria hash
  role: UserRole.OPERATOR;
  active: boolean;
}

// Interface para Atualizações do Sistema (Changelog)
export interface SystemUpdate {
  id: string;
  version: string;
  title: string;
  description: string;
  type: 'Feature' | 'Fix' | 'Improvement';
  date: string;
}

// Interface para Fornecedores
export interface Supplier {
  id: string;
  name: string; // Razão Social ou Nome Fantasia
  document: string; // CNPJ
  email?: string;
  phone?: string;
  contactName?: string;
  createdAt: string;
}

// Estrutura auxiliar para importação de XML
export interface InvoiceImportData {
  supplier: {
    name: string;
    document: string;
  };
  items: {
    code: string;
    name: string;
    quantity: number;
    unitPrice: number;
    unit: string;
  }[];
}