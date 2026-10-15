export type MetalType = '22k_gold' | '24k_gold' | '925_silver';

export interface RateSettings {
  gold_22k_rate: number;
  gold_24k_rate: number;
  silver_925_rate: number;
  updated_at: string;
}

export interface PriceBreakdown {
  rate_per_gram: number;
  metal_value: number;
  wastage_percent: number;
  wastage_value: number;
  making_charges: number;
  subtotal: number;
  gst_percent: number;
  gst_amount: number;
  final_price: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_slug: string;
  description: string;
  metal_type: MetalType;
  net_weight: number; // in grams
  wastage_percent: number; // e.g., 8.5
  making_charges: number; // fixed or making fee in INR
  purity_hallmark: string; // e.g. "BIS 916 22K Hallmarked"
  image_url: string;
  secondary_image_url?: string;
  is_featured: boolean;
  in_stock: boolean;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  banner_image_url: string;
  display_order: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  computed_price: number;
  computed_breakdown: PriceBreakdown;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItemSummary {
  product_id: string;
  product_name: string;
  net_weight: number;
  metal_type: MetalType;
  price_per_unit: number;
  quantity: number;
  image_url: string;
}

export interface Order {
  id: string; // e.g. "NJ-2026-8841"
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: OrderItemSummary[];
  subtotal: number;
  gst_total: number;
  grand_total: number;
  payment_method: 'COD' | 'Razorpay';
  payment_status: 'Pending' | 'Paid';
  status: OrderStatus;
  tracking_number?: string;
  courier_name?: string;
  created_at: string;
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  branch?: string;
  created_at: string;
}

export interface Branch {
  id: string;
  name: string;
  tagline?: string;
  address: string;
  phones: string[];
  hours: string;
  gmaps_embed?: string;
}

export interface EnvStatus {
  supabase_configured: boolean;
  cloudinary_configured: boolean;
  env_vars: {
    SUPABASE_URL: boolean;
    SUPABASE_ANON_KEY: boolean;
    SUPABASE_SERVICE_ROLE_KEY: boolean;
    CLOUDINARY_CLOUD_NAME: boolean;
    CLOUDINARY_API_KEY: boolean;
    CLOUDINARY_API_SECRET: boolean;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at?: string;
  last_login?: string;
}

export interface SupabaseConfig {
  url: string;
  key: string;
}

export interface SupabaseTableCounts {
  admin_users: number | null;
  categories: number | null;
  products: number | null;
  rates: boolean;
  orders: number | null;
}

export interface SupabaseLiveStatus {
  configured: boolean;
  connected: boolean;
  url?: string;
  error?: string;
  counts: SupabaseTableCounts;
  missing_tables?: string[];
}

export interface CloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
}

export interface CloudinaryLiveStatus {
  configured: boolean;
  connected: boolean;
  cloud_name?: string;
  error?: string;
}

