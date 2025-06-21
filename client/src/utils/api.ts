import { AuthUser, LoginCredentials, SignupData, ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:5000/api'; // Update with your backend URL

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const user = localStorage.getItem('auth_user');
    if (user) {
      const { token } = JSON.parse(user);
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
    }
    return {
      'Content-Type': 'application/json'
    };
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: this.getAuthHeaders(),
        ...options
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'An error occurred'
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred'
      };
    }
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthUser>> {
    return this.request<AuthUser>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async signup(userData: SignupData): Promise<ApiResponse<AuthUser>> {
    return this.request<AuthUser>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/update-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  // User endpoints
  async getUsers(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/users');
  }

  async createUser(userData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  // Store endpoints
  async getStores(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/stores');
  }

  async createStore(storeData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/stores', {
      method: 'POST',
      body: JSON.stringify(storeData)
    });
  }

  // Rating endpoints
  async getRatings(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/ratings');
  }

  async submitRating(storeId: string, rating: number): Promise<ApiResponse<any>> {
    return this.request<any>('/ratings', {
      method: 'POST',
      body: JSON.stringify({ storeId, rating })
    });
  }

  async updateRating(ratingId: string, rating: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/ratings/${ratingId}`, {
      method: 'PUT',
      body: JSON.stringify({ rating })
    });
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/dashboard/stats');
  }
}

export const apiClient = new ApiClient();