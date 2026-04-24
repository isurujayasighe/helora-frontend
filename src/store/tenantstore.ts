import { create } from 'zustand';

export interface TenantInfo {
  tenantId: string;
  companyName: string; // Changed from 'name' to match API
  logo: string;        // Changed from 'logoUrl' to match API
  theme: string;
  website: string;
  environmentId: string;
  environmentName: string; // Useful for displaying "Production" vs "Staging" badges
}

interface TenantState {
  tenant: TenantInfo | null;
  setTenant: (tenant: TenantInfo) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  tenant: null,
  setTenant: (tenant) => set({ tenant }),
  clearTenant: () => set({ tenant: null }),
}));