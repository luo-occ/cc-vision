import { 
  PortfolioSummary, 
  CreateHoldingRequest, 
  UpdateHoldingRequest, 
  SearchResult, 
  AssetPrice, 
  ApiResponse 
} from '@portfolio/shared';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

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
  async getPortfolio(): Promise<PortfolioSummary> {
    const response = await this.request<PortfolioSummary>('/api/portfolio');
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

  async refreshPrices(): Promise<PortfolioSummary> {
    const response = await this.request<PortfolioSummary>('/api/portfolio/refresh', {
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
}

export const apiClient = new ApiClient();
export default apiClient;