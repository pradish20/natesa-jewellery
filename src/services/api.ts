import { AdminUser, Category, CloudinaryConfig, CloudinaryLiveStatus, Enquiry, EnvStatus, FeaturedSlide, Order, OrderStatus, Product, RateSettings, StoreContactSettings, SupabaseLiveStatus } from '../types';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    try {
      token = sessionStorage.getItem('natesa_admin_token') || localStorage.getItem('natesa_admin_token');
    } catch {
      token = null;
    }
  }

  const customHeaders = (options?.headers as Record<string, string>) || {};
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders
  };

  if (token && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });
  if (!response.ok) {
    let errorMsg = `API Error [${response.status}]`;
    try {
      const errorData = await response.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch {
      const errorText = await response.text();
      if (errorText) errorMsg = errorText;
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

export const api = {
  getEnvStatus: (): Promise<EnvStatus> => fetchJSON<EnvStatus>('/api/status'),

  // Rates
  getRates: (): Promise<RateSettings> => fetchJSON<RateSettings>('/api/rates'),

  updateRates: (rates: { gold_22k_rate: number; gold_24k_rate: number; silver_925_rate: number }): Promise<{ success: boolean; rates: RateSettings }> =>
    fetchJSON('/api/rates', {
      method: 'POST',
      body: JSON.stringify(rates)
    }),

  // Products
  getProducts: (): Promise<Product[]> => fetchJSON<Product[]>('/api/products'),

  createProduct: (product: Partial<Product>): Promise<Product> =>
    fetchJSON<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(product)
    }),

  updateProduct: (id: string, product: Partial<Product>): Promise<Product> =>
    fetchJSON<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product)
    }),

  deleteProduct: (id: string): Promise<{ success: boolean; deleted_id: string; deleted_from_supabase?: boolean }> =>
    fetchJSON(`/api/products/${id}`, {
      method: 'DELETE'
    }),

  // Categories
  getCategories: (): Promise<Category[]> => fetchJSON<Category[]>('/api/categories'),

  createCategory: (category: Partial<Category>): Promise<Category> =>
    fetchJSON<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(category)
    }),

  updateCategory: (id: string, category: Partial<Category>): Promise<Category> =>
    fetchJSON<Category>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category)
    }),

  deleteCategory: (id: string): Promise<{ success: boolean; deleted_id: string; deleted_from_supabase?: boolean }> =>
    fetchJSON(`/api/categories/${id}`, {
      method: 'DELETE'
    }),

  // Orders
  getOrders: (): Promise<Order[]> => fetchJSON<Order[]>(`/api/orders?_t=${Date.now()}`),

  trackOrder: (query: string): Promise<Order> => fetchJSON<Order>(`/api/orders/${encodeURIComponent(query)}`),

  createOrder: (order: Partial<Order>): Promise<Order> =>
    fetchJSON<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(order)
    }),

  updateOrderStatus: (
    id: string,
    status: OrderStatus,
    trackingNumber?: string,
    courierName?: string
  ): Promise<Order> =>
    fetchJSON<Order>(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, tracking_number: trackingNumber, courier_name: courierName })
    }),

  // Enquiries
  submitEnquiry: (enquiry: Partial<Enquiry>): Promise<{ success: boolean; enquiry: Enquiry }> =>
    fetchJSON('/api/enquiries', {
      method: 'POST',
      body: JSON.stringify(enquiry)
    }),

  // File Upload
  uploadImage: (imageData: string): Promise<{ url: string; cloud_name: string; status: string }> =>
    fetchJSON('/api/upload', {
      method: 'POST',
      body: JSON.stringify({ image: imageData })
    }),

  // Admin Auth & Users in Supabase
  adminLogin: (credentials: { email?: string; password?: string; pin?: string }): Promise<{
    success: boolean;
    user: AdminUser;
    source: string;
    token?: string;
  }> =>
    fetchJSON('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  getAdminUsers: (): Promise<AdminUser[]> => fetchJSON<AdminUser[]>('/api/admin/users'),

  saveAdminUser: (adminData: {
    email: string;
    password: string;
    name?: string;
    role?: string;
  }): Promise<{ success: boolean; user: AdminUser; stored_in_supabase: boolean }> =>
    fetchJSON('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(adminData)
    }),

  forgotPassword: (email: string): Promise<{ success: boolean; message: string }> =>
    fetchJSON('/api/admin/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  resetPassword: (payload: { token?: string; email?: string; newPassword: string }): Promise<{ success: boolean; message: string }> =>
    fetchJSON('/api/admin/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  adminUpdatePassword: (payload: { email: string; newPassword: string; token?: string }): Promise<{
    success: boolean;
    message: string;
    saved_in_supabase_table: boolean;
  }> =>
    fetchJSON('/api/admin/update-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Supabase Status, Config & Migration
  getSupabaseStatus: (): Promise<SupabaseLiveStatus> => fetchJSON<SupabaseLiveStatus>('/api/supabase/status'),

  saveSupabaseConfig: (config: {
    url: string;
    key: string;
  }): Promise<{ success: boolean; message: string; url: string }> =>
    fetchJSON('/api/supabase/config', {
      method: 'POST',
      body: JSON.stringify(config)
    }),

  seedSupabase: (): Promise<{ success: boolean; details: any; error?: string }> =>
    fetchJSON('/api/supabase/seed', {
      method: 'POST'
    }),

  getSupabaseSchema: async (): Promise<string> => {
    const res = await fetch('/api/supabase/schema');
    return res.text();
  },

  // Cloudinary Status & Config
  getCloudinaryStatus: (): Promise<CloudinaryLiveStatus> => fetchJSON<CloudinaryLiveStatus>('/api/cloudinary/status'),

  saveCloudinaryConfig: (config: CloudinaryConfig): Promise<{ success: boolean; message: string; cloud_name: string }> =>
    fetchJSON('/api/cloudinary/config', {
      method: 'POST',
      body: JSON.stringify(config)
    }),

  // Featured Slides
  getSlides: (): Promise<FeaturedSlide[]> => fetchJSON<FeaturedSlide[]>('/api/slides'),

  createSlide: (slide: Partial<FeaturedSlide>): Promise<FeaturedSlide> =>
    fetchJSON('/api/slides', {
      method: 'POST',
      body: JSON.stringify(slide)
    }),

  updateSlide: (id: string, slide: Partial<FeaturedSlide>): Promise<FeaturedSlide> =>
    fetchJSON(`/api/slides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(slide)
    }),

  deleteSlide: (id: string): Promise<{ success: boolean; deleted_id: string }> =>
    fetchJSON(`/api/slides/${id}`, {
      method: 'DELETE'
    }),

  // Store Contact & Address Settings
  getStoreContact: (): Promise<StoreContactSettings> => fetchJSON<StoreContactSettings>('/api/store-contact'),

  updateStoreContact: (contact: Partial<StoreContactSettings>): Promise<{ success: boolean; contact: StoreContactSettings; saved_in_supabase?: boolean }> =>
    fetchJSON('/api/store-contact', {
      method: 'PUT',
      body: JSON.stringify(contact)
    })
};
