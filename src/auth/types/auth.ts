export interface RawJwtPayload {
  user_id: string;
  user_name: string;
  tenant_id: string;
  tenant_prefix: string;
  tenant_environment_prefix: string;
  ifs_person_id: string;
  user_scope: 'tenant' | 'system';
  customer_ids: string; // JSON string from backend
  permissions: string;  // JSON string from backend
  exp: number;
  iss: string;
  aud: string;
}

export interface UserAttributes {
  id: string;
  name: string;
  tenantId: string;
  tenantPrefix: string;
  environment: string;
  personId: string;
  scope: 'tenant' | 'system';
  customerIds: string[]; 
  permissions: Record<string, number>;
  expiresAt: number;
}

export interface Customer {
  customerId: string;
  name: string;
}

export interface AuthState {
  status: 'idle' | 'authenticated' | 'unauthenticated' | 'loading';
  accessToken: string | null;
  user: UserAttributes | null;
  scope: string | null;
  availableCustomers: Customer[];
  activeCustomer: Customer | null;
  checkIsUnassigned: () => boolean;
  // Actions
  setAuth: (token: string, customers?: Customer[]) => void;
  switchCustomer: (customerId: string) => void;
  logout: () => void;
}