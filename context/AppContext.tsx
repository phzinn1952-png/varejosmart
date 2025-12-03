
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Product, Sale, CartItem, Customer, PaymentMethod, Tenant, UserRole, PlanConfig, SystemUpdate, TenantUser, Supplier, InvoiceImportData, ProductStatus, UnitOfMeasure } from '../types';
import { MOCK_PRODUCTS, MOCK_CUSTOMERS, PLANS as INITIAL_PLANS, MOCK_TENANTS as INITIAL_TENANTS } from '../constants';

interface AppContextType {
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  tenants: Tenant[];
  plans: Record<string, PlanConfig>;
  systemUpdates: SystemUpdate[];
  tenantUsers: TenantUser[];
  suppliers: Supplier[];
  
  isAuthenticated: boolean;
  user: { name: string; role: string; email: string; mustChangePassword?: boolean; tenantId?: string } | null;
  
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (newPass: string) => Promise<boolean>;
  
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void; 
  recordSale: (items: CartItem[], total: number, paymentMethod: PaymentMethod, discount: number, customerId?: string) => void;
  
  // Tenant CRUD
  addTenant: (tenant: Tenant) => void;
  updateTenant: (tenant: Tenant) => void;
  deleteTenant: (id: string) => void; 
  resetTenantPassword: (id: string) => Promise<string>;

  // Plan CRUD
  addPlan: (plan: PlanConfig) => void;
  updatePlan: (plan: PlanConfig) => void; 
  deletePlan: (id: string) => void;

  // System Updates (Master)
  addSystemUpdate: (update: SystemUpdate) => void;

  // Team Management (Manager)
  addTenantUser: (user: TenantUser) => void;
  deleteTenantUser: (id: string) => void;
  
  // Suppliers
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  processInvoiceImport: (data: InvoiceImportData) => void;

  getDashboardStats: () => any;

  // New properties for updates notification
  hasUnseenUpdates: boolean;
  markUpdatesAsSeen: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Retail Data
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  
  // Master Admin Data
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<Record<string, PlanConfig>>({});
  const [systemUpdates, setSystemUpdates] = useState<SystemUpdate[]>([]);
  
  // Tenant Data (Employees)
  const [tenantUsers, setTenantUsers] = useState<TenantUser[]>([]);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string; email: string; mustChangePassword?: boolean; tenantId?: string } | null>(null);

  // Updates Notification State
  const [hasUnseenUpdates, setHasUnseenUpdates] = useState(false);

  // Initialization & Persistence
  useEffect(() => {
    // Auth
    const storedAuth = localStorage.getItem('vs_auth');
    const storedUser = localStorage.getItem('vs_user');
    if (storedAuth === 'true' && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }

    // Sales
    const storedSales = localStorage.getItem('vs_sales');
    if (storedSales) {
      setSales(JSON.parse(storedSales));
    }

    // Plans
    const storedPlans = localStorage.getItem('vs_plans');
    if (storedPlans) {
      setPlans(JSON.parse(storedPlans));
    } else {
      setPlans(INITIAL_PLANS);
    }

    // Tenants
    const storedTenants = localStorage.getItem('vs_tenants');
    if (storedTenants) {
      setTenants(JSON.parse(storedTenants));
    } else {
      setTenants(INITIAL_TENANTS);
    }

    // System Updates
    const storedUpdates = localStorage.getItem('vs_updates');
    if (storedUpdates) {
      setSystemUpdates(JSON.parse(storedUpdates));
    }

    // Tenant Users (Employees)
    const storedEmployees = localStorage.getItem('vs_employees');
    if (storedEmployees) {
      setTenantUsers(JSON.parse(storedEmployees));
    }
    
    // Suppliers
    const storedSuppliers = localStorage.getItem('vs_suppliers');
    if (storedSuppliers) {
      setSuppliers(JSON.parse(storedSuppliers));
    }

  }, []);

  // Check for unseen updates logic
  useEffect(() => {
    if (systemUpdates.length > 0) {
      // Sort updates just in case, taking the most recent
      const sortedUpdates = [...systemUpdates].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latestUpdateDate = sortedUpdates[0].date;
      
      const lastSeenDate = localStorage.getItem('vs_last_seen_update');
      
      // If never seen, or if latest is newer than last seen
      if (!lastSeenDate || new Date(latestUpdateDate) > new Date(lastSeenDate)) {
        setHasUnseenUpdates(true);
      } else {
        setHasUnseenUpdates(false);
      }
    }
  }, [systemUpdates]);

  const markUpdatesAsSeen = () => {
    if (systemUpdates.length > 0) {
        const sortedUpdates = [...systemUpdates].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const latestUpdateDate = sortedUpdates[0].date;
        
        localStorage.setItem('vs_last_seen_update', latestUpdateDate);
        setHasUnseenUpdates(false);
    }
  };

  // Save changes to localStorage
  useEffect(() => {
    if (Object.keys(plans).length > 0) localStorage.setItem('vs_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    if (tenants.length > 0) localStorage.setItem('vs_tenants', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    if (systemUpdates.length > 0) localStorage.setItem('vs_updates', JSON.stringify(systemUpdates));
  }, [systemUpdates]);

  useEffect(() => {
    if (tenantUsers.length > 0) localStorage.setItem('vs_employees', JSON.stringify(tenantUsers));
  }, [tenantUsers]);
  
  useEffect(() => {
    if (suppliers.length > 0) localStorage.setItem('vs_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);


  const login = async (email: string, pass: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 1. Master User Logic
        if (email === 'master@varejo.com' && pass === '123456') {
           const masterUser = { name: 'Master Admin', role: UserRole.MASTER, email, mustChangePassword: false };
           setUser(masterUser);
           setIsAuthenticated(true);
           localStorage.setItem('vs_auth', 'true');
           localStorage.setItem('vs_user', JSON.stringify(masterUser));
           resolve(true);
           return;
        }

        // 2. Check against Tenants (Owners)
        const tenantUser = tenants.find(t => t.email === email);
        if (tenantUser) {
            const isValid = tenantUser.id === 'tenant_joao' ? pass === '123456' : true; 
            
            if (isValid) {
                const role = UserRole.MANAGER;
                const userObj = { 
                    name: tenantUser.ownerName, 
                    role, 
                    email, 
                    mustChangePassword: tenantUser.mustChangePassword,
                    tenantId: tenantUser.id
                };
                setUser(userObj);
                setIsAuthenticated(true);
                localStorage.setItem('vs_auth', 'true');
                localStorage.setItem('vs_user', JSON.stringify(userObj));
                resolve(true);
                return;
            }
        }

        // 3. Check against Employees (Operators)
        const employee = tenantUsers.find(u => u.email === email && u.password === pass);
        if (employee) {
            const userObj = {
                name: employee.name,
                role: UserRole.OPERATOR,
                email: employee.email,
                mustChangePassword: false,
                tenantId: employee.tenantId
            };
            setUser(userObj);
            setIsAuthenticated(true);
            localStorage.setItem('vs_auth', 'true');
            localStorage.setItem('vs_user', JSON.stringify(userObj));
            resolve(true);
            return;
        }

        resolve(false);
      }, 800); 
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('vs_auth');
    localStorage.removeItem('vs_user');
  };

  const changePassword = async (newPass: string): Promise<boolean> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              if (user) {
                  const updatedUser = { ...user, mustChangePassword: false };
                  setUser(updatedUser);
                  localStorage.setItem('vs_user', JSON.stringify(updatedUser));
                  
                  if (user.role === UserRole.MANAGER) {
                     setTenants(prev => prev.map(t => t.email === user.email ? { ...t, mustChangePassword: false } : t));
                  }
              }
              resolve(true);
          }, 800);
      });
  }

  const resetTenantPassword = async (id: string): Promise<string> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              const tempPass = Math.random().toString(36).slice(-8);
              setTenants(prev => prev.map(t => 
                  t.id === id ? { ...t, mustChangePassword: true } : t
              ));
              resolve(tempPass);
          }, 500);
      });
  };

  // Products
  const addProduct = useCallback((product: Product) => {
    setProducts(prev => [...prev, product]);
  }, []);

  const updateProduct = useCallback((updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  // Tenants
  const addTenant = (tenant: Tenant) => {
    setTenants(prev => [...prev, tenant]);
  };
  const updateTenant = (updatedTenant: Tenant) => {
    setTenants(prev => prev.map(t => t.id === updatedTenant.id ? updatedTenant : t));
  };
  const deleteTenant = (id: string) => {
    setTenants(prev => prev.filter(t => t.id !== id));
  };

  // Plans
  const addPlan = (plan: PlanConfig) => {
    setPlans(prev => ({ ...prev, [plan.id]: plan }));
  };
  const updatePlan = (updatedPlan: PlanConfig) => {
    setPlans(prev => ({ ...prev, [updatedPlan.id]: updatedPlan }));
  };
  const deletePlan = (id: string) => {
    setPlans(prev => {
        const newPlans = { ...prev };
        delete newPlans[id];
        return newPlans;
    });
  };

  // System Updates
  const addSystemUpdate = (update: SystemUpdate) => {
      setSystemUpdates(prev => [update, ...prev]);
  };

  // Employee Management
  const addTenantUser = (newUser: TenantUser) => {
      setTenantUsers(prev => [...prev, newUser]);
  };
  const deleteTenantUser = (id: string) => {
      setTenantUsers(prev => prev.filter(u => u.id !== id));
  };
  
  // Suppliers
  const addSupplier = (supplier: Supplier) => {
    setSuppliers(prev => [...prev, supplier]);
  };
  const updateSupplier = (updatedSupplier: Supplier) => {
    setSuppliers(prev => prev.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
  };
  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };
  
  // Process Invoice Import (NFe)
  const processInvoiceImport = (data: InvoiceImportData) => {
    // 1. Add Supplier if not exists
    let supplierExists = suppliers.find(s => s.document === data.supplier.document);
    if (!supplierExists) {
        const newSupplier: Supplier = {
            id: crypto.randomUUID(),
            name: data.supplier.name,
            document: data.supplier.document,
            createdAt: new Date().toISOString()
        };
        addSupplier(newSupplier);
    }
    
    // 2. Update Products Inventory
    const updatedProducts = [...products];
    
    data.items.forEach(item => {
        // Try to find product by Name (Simplified matching)
        // In a real scenario, we would use EAN/Barcode or a mapping table
        const productIndex = updatedProducts.findIndex(p => p.name.toLowerCase() === item.name.toLowerCase() || p.code === item.code);
        
        if (productIndex >= 0) {
            // Update Stock and Cost Price
            const currentProduct = updatedProducts[productIndex];
            updatedProducts[productIndex] = {
                ...currentProduct,
                stock: currentProduct.stock + item.quantity,
                costPrice: item.unitPrice // Update cost price to latest invoice price
            };
        } else {
            // Create New Product
            const newProduct: Product = {
                id: crypto.randomUUID(),
                code: item.code || `PROD${Math.floor(Math.random() * 10000)}`,
                barcode: '', // Usually parsed from <cEAN>
                name: item.name,
                description: `Importado de NFe`,
                category: 'Geral',
                unit: UnitOfMeasure.UN,
                costPrice: item.unitPrice,
                salePrice: item.unitPrice * 1.5, // Default Markup 50%
                stock: item.quantity,
                minStock: 5,
                status: ProductStatus.ACTIVE,
                createdAt: new Date().toISOString(),
                image: ''
            };
            updatedProducts.push(newProduct);
        }
    });
    
    setProducts(updatedProducts);
  };

  const recordSale = useCallback((items: CartItem[], total: number, paymentMethod: PaymentMethod, discount: number, customerId?: string) => {
    const newSale: Sale = {
      id: crypto.randomUUID(),
      items,
      totalAmount: total + discount,
      discount,
      finalAmount: total,
      paymentMethod,
      customerId,
      timestamp: new Date().toISOString(),
      synced: false
    };

    setProducts(prevProducts => prevProducts.map(p => {
      const soldItem = items.find(i => i.id === p.id);
      if (soldItem) {
        return { ...p, stock: p.stock - soldItem.quantity };
      }
      return p;
    }));

    setSales(prevSales => {
      const newSalesHistory = [...prevSales, newSale];
      localStorage.setItem('vs_sales', JSON.stringify(newSalesHistory));
      return newSalesHistory;
    });
  }, []);

  const getDashboardStats = useCallback(() => {
    const totalSales = sales.reduce((acc, curr) => acc + curr.finalAmount, 0);
    const transactionCount = sales.length;
    const averageTicket = transactionCount > 0 ? totalSales / transactionCount : 0;

    const productSales: Record<string, number> = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return { totalSales, transactionCount, averageTicket, topProducts };
  }, [sales]);

  const contextValue = useMemo(() => ({
    products,
    sales,
    customers,
    tenants,
    plans,
    systemUpdates,
    tenantUsers,
    suppliers,
    isAuthenticated,
    user,
    login,
    logout,
    changePassword,
    resetTenantPassword,
    addProduct,
    updateProduct,
    deleteProduct,
    recordSale,
    addTenant,
    updateTenant,
    deleteTenant,
    addPlan,
    updatePlan,
    deletePlan,
    addSystemUpdate,
    addTenantUser,
    deleteTenantUser,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    processInvoiceImport,
    getDashboardStats,
    hasUnseenUpdates,
    markUpdatesAsSeen
  }), [
    products,
    sales,
    customers,
    tenants,
    plans,
    systemUpdates,
    tenantUsers,
    suppliers,
    isAuthenticated,
    user,
    login,
    logout,
    changePassword,
    resetTenantPassword,
    addProduct,
    updateProduct,
    deleteProduct,
    recordSale,
    addTenant,
    updateTenant,
    deleteTenant,
    addPlan,
    updatePlan,
    deletePlan,
    addSystemUpdate,
    addTenantUser,
    deleteTenantUser,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    processInvoiceImport,
    getDashboardStats,
    hasUnseenUpdates,
    markUpdatesAsSeen
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
