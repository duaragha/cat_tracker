const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Debug logging to see what URL is being used
console.log('API URL Configuration:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  Final_API_URL: API_URL
});

export class ApiService {
  private static async request(endpoint: string, options?: RequestInit) {
    console.log(`API Request: ${options?.method || 'GET'} ${API_URL}${endpoint}`);
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`API Response:`, data);
    return data;
  }

  static profile = {
    get: () => ApiService.request('/profile'),
    create: (data: any) => ApiService.request('/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => ApiService.request(`/profile/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  };

  static washroom = {
    getAll: (catId: string) => ApiService.request(`/washroom/${catId}`),
    create: (data: any) => ApiService.request('/washroom', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => ApiService.request(`/washroom/${id}`, {
      method: 'DELETE',
    }),
  };

  static food = {
    getAll: (catId: string) => ApiService.request(`/food/${catId}`),
    create: (data: any) => ApiService.request('/food', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => ApiService.request(`/food/${id}`, {
      method: 'DELETE',
    }),
  };

  static sleep = {
    getAll: (catId: string) => ApiService.request(`/sleep/${catId}`),
    create: (data: any) => ApiService.request('/sleep', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => ApiService.request(`/sleep/${id}`, {
      method: 'DELETE',
    }),
  };

  static weight = {
    getAll: (catId: string) => ApiService.request(`/weight/${catId}`),
    create: (data: any) => ApiService.request('/weight', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => ApiService.request(`/weight/${id}`, {
      method: 'DELETE',
    }),
  };

  static photos = {
    getAll: (catId: string) => ApiService.request(`/photos/${catId}`),
    create: (data: any) => ApiService.request('/photos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => ApiService.request(`/photos/${id}`, {
      method: 'DELETE',
    }),
  };
}