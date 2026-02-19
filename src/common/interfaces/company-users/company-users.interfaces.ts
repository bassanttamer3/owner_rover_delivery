export interface ListCompanyUsersInterface {
  page: number;
  limit?: number;
  status?: 'active' | 'inactive' | 'suspended';
  role?: 'company_admin' | 'dispatcher' | 'store_manager' | 'customer_support' | 'analyst';
  search?: string
}

export interface NewCompanyUserInterface {
  name: string;
  email: string;
  phone?: string;
  role: 'company_admin' | 'dispatcher' | 'store_manager' | 'customer_support' | 'analyst';
}


export interface EditUserDataInterface {
  name?: string;
  phone?: string;
  permissions?: string[];
  role?: 'company_admin' | 'dispatcher' | 'store_manager' | 'customer_support' | 'analyst';
}
