import { 
  Portfolio, 
  CreateHoldingRequest, 
  SearchResult,
  Account,
  NewAccount,
  AccountUpdate
} from '@/types/portfolio';

import { UpdateHoldingRequest } from '@/hooks/usePortfolio';

export interface AssetPrice {
  symbol: string;
  price: number;
  change?: number;
  changePercent?: number;
  lastUpdated: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Portfolio endpoints
  async getPortfolio(): Promise<Portfolio> {
    const response = await this.request<Portfolio>('/api/portfolio');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch portfolio');
    }
    return response.data;
  }

  async addHolding(holding: CreateHoldingRequest): Promise<any> {
    const response = await this.request('/api/portfolio/holdings', {
      method: 'POST',
      body: JSON.stringify(holding),
    });
    if (!response.success) {
      throw new Error(response.error || 'Failed to add holding');
    }
    return response.data;
  }

  async updateHolding(id: string, updates: UpdateHoldingRequest): Promise<any> {
    const response = await this.request(`/api/portfolio/holdings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (!response.success) {
      throw new Error(response.error || 'Failed to update holding');
    }
    return response.data;
  }

  async deleteHolding(id: string): Promise<void> {
    const response = await this.request(`/api/portfolio/holdings/${id}`, {
      method: 'DELETE',
    });
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete holding');
    }
  }

  async refreshPrices(): Promise<Portfolio> {
    const response = await this.request<Portfolio>('/api/portfolio/refresh', {
      method: 'POST',
    });
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to refresh prices');
    }
    return response.data;
  }

  // Search endpoints
  async searchAssets(query: string, type?: 'stock' | 'crypto'): Promise<SearchResult[]> {
    const params = new URLSearchParams({ q: query });
    if (type) params.append('type', type);
    
    const response = await this.request<SearchResult[]>(`/api/search?${params}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to search assets');
    }
    return response.data;
  }

  // Account endpoints
  async getAccounts(isActive?: boolean): Promise<Account[]> {
    const params = isActive !== undefined ? `?active=${isActive}` : '';
    const response = await this.request<Account[]>(`/api/accounts${params}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch accounts');
    }
    return response.data;
  }

  async getAccount(id: string): Promise<Account> {
    const response = await this.request<Account>(`/api/accounts/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch account');
    }
    return response.data;
  }

  async createAccount(account: NewAccount): Promise<Account> {
    const response = await this.request<Account>('/api/accounts', {
      method: 'POST',
      body: JSON.stringify(account),
    });
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create account');
    }
    return response.data;
  }

  async updateAccount(id: string, updates: AccountUpdate): Promise<Account> {
    const response = await this.request<Account>(`/api/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update account');
    }
    return response.data;
  }

  async deleteAccount(id: string): Promise<void> {
    const response = await this.request(`/api/accounts/${id}`, {
      method: 'DELETE',
    });
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete account');
    }
  }

  async getDefaultAccount(): Promise<Account> {
    const response = await this.request<Account>('/api/accounts/default/current');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch default account');
    }
    return response.data;
  }

  async setDefaultAccount(id: string): Promise<void> {
    const response = await this.request(`/api/accounts/${id}/default`, {
      method: 'POST',
    });
    if (!response.success) {
      throw new Error(response.error || 'Failed to set default account');
    }
  }

  async getActiveAccounts(): Promise<Account[]> {
    const response = await this.request<Account[]>('/api/accounts/active/list');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch active accounts');
    }
    return response.data;
  }

  // Price endpoints
  async getPrice(symbol: string, type: 'stock' | 'crypto' = 'stock'): Promise<AssetPrice> {
    const params = new URLSearchParams({ type });
    const response = await this.request<AssetPrice>(`/api/prices/${symbol}?${params}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get price');
    }
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;