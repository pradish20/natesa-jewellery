import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_RATES } from './src/data/initialData.js';
import { AdminUser, Category, CloudinaryConfig, CloudinaryLiveStatus, Enquiry, Order, Product, RateSettings, SupabaseLiveStatus } from './src/types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---------------- LOCAL / IN-MEMORY STORE STATE ----------------
let currentRates: RateSettings = { ...INITIAL_RATES };
let currentProducts: Product[] = [...INITIAL_PRODUCTS];
let currentCategories: Category[] = [...INITIAL_CATEGORIES];
let currentOrders: Order[] = [
  {
    id: 'NJ-2026-8841',
    customer_name: 'Ananya Sundaram',
    email: 'ananya.s@example.com',
    phone: '+91 98401 23456',
    address: '42, Temple View Road, Near Tank Street',
    city: 'Krishnagiri',
    state: 'Tamil Nadu',
    pincode: '635001',
    items: [
      {
        product_id: 'prod-2',
        product_name: 'Guttapusalu Antique Ruby Jhumkas',
        net_weight: 18.2,
        metal_type: '22k_gold',
        price_per_unit: 141200,
        quantity: 1,
        image_url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 137087,
    gst_total: 4113,
    grand_total: 141200,
    payment_method: 'COD',
    payment_status: 'Pending',
    status: 'Processing',
    tracking_number: 'DTDC-TN992831',
    courier_name: 'DTDC Express Courier',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];
let currentEnquiries: Enquiry[] = [];

// Default In-Memory Admin
let currentAdminUsers: (AdminUser & { password: string })[] = [
  {
    id: 'admin-1',
    email: 'natesajewellery@gmail.com',
    name: 'Natesa Administrator',
    role: 'super_admin',
    password: 'natesa123',
    created_at: new Date().toISOString()
  }
];

// ---------------- SUPABASE CLIENT & CONFIGURATION ----------------
const CONFIG_FILE = path.resolve(__dirname, 'data', 'supabase-config.json');

function loadSavedSupabaseConfig(): { url: string; key: string } {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.key) {
        return { url: parsed.url, key: parsed.key };
      }
    }
  } catch (err) {
    console.error('Error reading supabase config file:', err);
  }
  return { url: '', key: '' };
}

function saveSupabaseConfig(url: string, key: string) {
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ url, key, updated_at: new Date().toISOString() }, null, 2));
  } catch (err) {
    console.error('Error writing supabase config file:', err);
  }
}

const savedConfig = loadSavedSupabaseConfig();
let supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  savedConfig.url ||
  '';

let supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  savedConfig.key ||
  '';

let supabase: SupabaseClient | null = null;

function isConfigValid(url: string, key: string): boolean {
  return Boolean(
    url &&
    url.startsWith('https://') &&
    url !== 'https://your-project.supabase.co' &&
    key &&
    key.length > 20 &&
    key !== 'your-anon-key' &&
    key !== 'your-service-role-key'
  );
}

function initSupabaseClient() {
  if (isConfigValid(supabaseUrl, supabaseKey)) {
    try {
      supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
      });
      console.log('✅ Supabase client initialized with URL:', supabaseUrl);
    } catch (e) {
      console.error('❌ Failed to initialize Supabase client:', e);
      supabase = null;
    }
  } else {
    supabase = null;
  }
}

initSupabaseClient();

// ---------------- CLOUDINARY CLIENT & CONFIGURATION ----------------
const CLOUDINARY_CONFIG_FILE = path.resolve(__dirname, 'data', 'cloudinary-config.json');

function loadSavedCloudinaryConfig(): { cloud_name: string; api_key: string; api_secret: string } {
  try {
    if (fs.existsSync(CLOUDINARY_CONFIG_FILE)) {
      const raw = fs.readFileSync(CLOUDINARY_CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.cloud_name && parsed.api_key && parsed.api_secret) {
        return {
          cloud_name: parsed.cloud_name,
          api_key: parsed.api_key,
          api_secret: parsed.api_secret
        };
      }
    }
  } catch (err) {
    console.error('Error reading cloudinary config file:', err);
  }
  return { cloud_name: '', api_key: '', api_secret: '' };
}

function saveCloudinaryConfigFile(cloud_name: string, api_key: string, api_secret: string) {
  try {
    const dir = path.dirname(CLOUDINARY_CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(
      CLOUDINARY_CONFIG_FILE,
      JSON.stringify({ cloud_name, api_key, api_secret, updated_at: new Date().toISOString() }, null, 2)
    );
  } catch (err) {
    console.error('Error writing cloudinary config file:', err);
  }
}

const savedCloudinaryConfig = loadSavedCloudinaryConfig();

let cloudinaryCloudName =
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.VITE_CLOUDINARY_CLOUD_NAME ||
  savedCloudinaryConfig.cloud_name ||
  '';

let cloudinaryApiKey =
  process.env.CLOUDINARY_API_KEY ||
  process.env.VITE_CLOUDINARY_API_KEY ||
  savedCloudinaryConfig.api_key ||
  '';

let cloudinaryApiSecret =
  process.env.CLOUDINARY_API_SECRET ||
  process.env.VITE_CLOUDINARY_API_SECRET ||
  savedCloudinaryConfig.api_secret ||
  '';

function isCloudinaryConfigValid(name: string, key: string, secret: string): boolean {
  return Boolean(
    name &&
    name.trim() !== '' &&
    name !== 'your-cloud-name' &&
    key &&
    key.trim() !== '' &&
    key !== 'your-api-key' &&
    secret &&
    secret.trim() !== '' &&
    secret !== 'your-api-secret'
  );
}

function initCloudinaryClient() {
  if (isCloudinaryConfigValid(cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret)) {
    try {
      cloudinary.config({
        cloud_name: cloudinaryCloudName.trim(),
        api_key: cloudinaryApiKey.trim(),
        api_secret: cloudinaryApiSecret.trim(),
        secure: true
      });
      console.log('✅ Cloudinary client initialized with cloud_name:', cloudinaryCloudName.trim());
    } catch (e) {
      console.error('❌ Failed to configure Cloudinary:', e);
    }
  }
}

initCloudinaryClient();

// ---------------- SUPABASE SQL SCHEMA EXPORT ----------------
const SUPABASE_SCHEMA_SQL = `-- Natesa Jewellery Supabase Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Natesa Administrator',
  role TEXT NOT NULL DEFAULT 'super_admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Default Admin User
INSERT INTO admin_users (id, email, password, name, role)
VALUES ('admin-1', 'natesajewellery@gmail.com', 'natesa123', 'Natesa Administrator', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  banner_image_url TEXT,
  display_order INT DEFAULT 0
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_slug TEXT NOT NULL,
  description TEXT,
  metal_type TEXT NOT NULL,
  net_weight NUMERIC NOT NULL,
  wastage_percent NUMERIC NOT NULL DEFAULT 8.5,
  making_charges NUMERIC NOT NULL DEFAULT 4500,
  purity_hallmark TEXT DEFAULT 'BIS 916 22K Hallmarked',
  image_url TEXT NOT NULL,
  secondary_image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Rates Table
CREATE TABLE IF NOT EXISTS rates (
  id TEXT PRIMARY KEY DEFAULT 'live_rates',
  gold_22k_rate NUMERIC NOT NULL DEFAULT 6720,
  gold_24k_rate NUMERIC NOT NULL DEFAULT 7330,
  silver_925_rate NUMERIC NOT NULL DEFAULT 94,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO rates (id, gold_22k_rate, gold_24k_rate, silver_925_rate)
VALUES ('live_rates', 6720, 7330, 94)
ON CONFLICT (id) DO NOTHING;

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  gst_total NUMERIC NOT NULL,
  grand_total NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'Pending',
  status TEXT NOT NULL DEFAULT 'Pending',
  tracking_number TEXT,
  courier_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on admin_users" ON admin_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on rates" ON rates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on orders" ON orders FOR ALL USING (true) WITH CHECK (true);
`;

// Helper: Sync initial data to Supabase
async function seedInitialDataToSupabase(): Promise<{ success: boolean; details: any; error?: string }> {
  if (!supabase) {
    return { success: false, details: null, error: 'Supabase client is not connected' };
  }

  try {
    // 1. Seed admin user
    const { error: adminErr } = await supabase.from('admin_users').upsert([
      {
        id: 'admin-1',
        email: 'natesajewellery@gmail.com',
        password: 'natesa123',
        name: 'Natesa Administrator',
        role: 'super_admin'
      }
    ], { onConflict: 'email' });

    // 2. Seed categories
    const { error: catErr } = await supabase.from('categories').upsert(INITIAL_CATEGORIES, { onConflict: 'id' });

    // 3. Seed products
    const { error: prodErr } = await supabase.from('products').upsert(INITIAL_PRODUCTS, { onConflict: 'id' });

    // 4. Seed rates
    const { error: rateErr } = await supabase.from('rates').upsert([
      {
        id: 'live_rates',
        gold_22k_rate: INITIAL_RATES.gold_22k_rate,
        gold_24k_rate: INITIAL_RATES.gold_24k_rate,
        silver_925_rate: INITIAL_RATES.silver_925_rate
      }
    ], { onConflict: 'id' });

    const errors = [adminErr, catErr, prodErr, rateErr].filter(Boolean);
    if (errors.length > 0) {
      console.warn('Supabase seed encountered notices/errors:', errors);
    }

    return {
      success: true,
      details: {
        admin_seeded: !adminErr,
        categories_count: INITIAL_CATEGORIES.length,
        products_count: INITIAL_PRODUCTS.length,
        rates_seeded: !rateErr,
        errors: errors.map(e => e?.message)
      }
    };
  } catch (err: any) {
    return { success: false, details: null, error: err.message };
  }
}

// ---------------- API ROUTES ----------------

// Status route for Vercel / Applet Env Indicator
app.get('/api/status', (req: Request, res: Response) => {
  const isCloudinaryActive = isCloudinaryConfigValid(cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret);
  res.json({
    supabase_configured: isConfigValid(supabaseUrl, supabaseKey),
    cloudinary_configured: isCloudinaryActive,
    env_vars: {
      SUPABASE_URL: Boolean(supabaseUrl),
      SUPABASE_ANON_KEY: Boolean(supabaseKey),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      CLOUDINARY_CLOUD_NAME: Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloud-name'),
      CLOUDINARY_API_KEY: Boolean(process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'your-api-key'),
      CLOUDINARY_API_SECRET: Boolean(process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_API_SECRET !== 'your-api-secret')
    }
  });
});

// Live Cloudinary Ping / Verification
app.get('/api/cloudinary/status', async (req: Request, res: Response) => {
  const configured = isCloudinaryConfigValid(cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret);
  if (!configured) {
    return res.json({
      configured: false,
      connected: false,
      cloud_name: cloudinaryCloudName || undefined,
      error: 'Cloudinary credentials not configured yet. Link them below or in Vercel.'
    } satisfies CloudinaryLiveStatus);
  }

  try {
    cloudinary.config({
      cloud_name: cloudinaryCloudName.trim(),
      api_key: cloudinaryApiKey.trim(),
      api_secret: cloudinaryApiSecret.trim(),
      secure: true
    });
    await cloudinary.api.ping();
    res.json({
      configured: true,
      connected: true,
      cloud_name: cloudinaryCloudName
    } satisfies CloudinaryLiveStatus);
  } catch (err: any) {
    res.json({
      configured: true,
      connected: false,
      cloud_name: cloudinaryCloudName,
      error: err.message || 'Failed to ping Cloudinary API. Please check API Key and Secret.'
    } satisfies CloudinaryLiveStatus);
  }
});

// Update Cloudinary Configuration directly from Admin UI
app.post('/api/cloudinary/config', async (req: Request, res: Response) => {
  const { cloud_name, api_key, api_secret } = req.body;
  if (!cloud_name || !api_key || !api_secret) {
    return res.status(400).json({ error: 'Cloud Name, API Key, and API Secret are required.' });
  }

  const cleanName = cloud_name.trim();
  const cleanKey = api_key.trim();
  const cleanSecret = api_secret.trim();

  if (!isCloudinaryConfigValid(cleanName, cleanKey, cleanSecret)) {
    return res.status(400).json({ error: 'Invalid Cloudinary configuration format.' });
  }

  try {
    cloudinary.config({
      cloud_name: cleanName,
      api_key: cleanKey,
      api_secret: cleanSecret,
      secure: true
    });

    // Test ping
    await cloudinary.api.ping();

    cloudinaryCloudName = cleanName;
    cloudinaryApiKey = cleanKey;
    cloudinaryApiSecret = cleanSecret;

    saveCloudinaryConfigFile(cleanName, cleanKey, cleanSecret);

    res.json({
      success: true,
      message: 'Cloudinary successfully connected and verified with live ping!',
      cloud_name: cleanName
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to verify Cloudinary credentials: ' + (err.message || 'Invalid credentials')
    });
  }
});

// Live Supabase Health & Table Counts Check
app.get('/api/supabase/status', async (req: Request, res: Response) => {
  const configured = isConfigValid(supabaseUrl, supabaseKey);
  if (!configured || !supabase) {
    return res.json({
      configured: false,
      connected: false,
      url: supabaseUrl || undefined,
      error: 'Supabase URL or Key not provided. Configure in Admin Portal.',
      counts: {
        admin_users: null,
        categories: null,
        products: null,
        rates: false,
        orders: null
      }
    } satisfies SupabaseLiveStatus);
  }

  try {
    // Test count for admin_users
    const adminRes = await supabase.from('admin_users').select('id', { count: 'exact', head: true });
    const catRes = await supabase.from('categories').select('id', { count: 'exact', head: true });
    const prodRes = await supabase.from('products').select('id', { count: 'exact', head: true });
    const orderRes = await supabase.from('orders').select('id', { count: 'exact', head: true });
    const ratesRes = await supabase.from('rates').select('*').limit(1);

    const hasAnyError = adminRes.error || catRes.error || prodRes.error;

    res.json({
      configured: true,
      connected: !hasAnyError,
      url: supabaseUrl,
      error: hasAnyError ? (adminRes.error?.message || catRes.error?.message || prodRes.error?.message) : undefined,
      counts: {
        admin_users: adminRes.count ?? (adminRes.error ? null : 0),
        categories: catRes.count ?? (catRes.error ? null : 0),
        products: prodRes.count ?? (prodRes.error ? null : 0),
        rates: Boolean(ratesRes.data && ratesRes.data.length > 0),
        orders: orderRes.count ?? (orderRes.error ? null : 0)
      }
    } satisfies SupabaseLiveStatus);
  } catch (err: any) {
    res.json({
      configured: true,
      connected: false,
      url: supabaseUrl,
      error: err.message,
      counts: {
        admin_users: null,
        categories: null,
        products: null,
        rates: false,
        orders: null
      }
    } satisfies SupabaseLiveStatus);
  }
});

// Update Supabase Project Credentials directly from Admin UI
app.post('/api/supabase/config', async (req: Request, res: Response) => {
  const { url, key } = req.body;
  if (!url || !key) {
    return res.status(400).json({ error: 'Supabase Project URL and Key are required.' });
  }

  const cleanUrl = url.trim().replace(/\/$/, '');
  const cleanKey = key.trim();

  if (!isConfigValid(cleanUrl, cleanKey)) {
    return res.status(400).json({ error: 'Invalid Supabase URL or Key format.' });
  }

  try {
    const testClient = createClient(cleanUrl, cleanKey, { auth: { persistSession: false } });
    // Test a basic call
    await testClient.from('admin_users').select('id', { count: 'exact', head: true });

    supabaseUrl = cleanUrl;
    supabaseKey = cleanKey;
    supabase = testClient;

    saveSupabaseConfig(cleanUrl, cleanKey);

    res.json({
      success: true,
      message: 'Supabase successfully connected and configured!',
      url: cleanUrl
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to connect to Supabase: ' + err.message
    });
  }
});

// Seed Initial Data to Supabase (1-Click migration)
app.post('/api/supabase/seed', async (req: Request, res: Response) => {
  const result = await seedInitialDataToSupabase();
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

// Return SQL Schema string
app.get('/api/supabase/schema', (req: Request, res: Response) => {
  res.type('text/plain').send(SUPABASE_SCHEMA_SQL);
});

// ---------------- ADMIN CREDENTIALS & AUTH IN SUPABASE ----------------

// Admin Login Route (Verifies against Supabase admin_users)
app.post('/api/admin/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const cleanEmail = (email || '').toLowerCase().trim();
  const cleanPassword = (password || '').trim();

  if (!cleanEmail || !cleanPassword) {
    return res.status(400).json({ error: 'Admin email and password are required.' });
  }

  // Try checking in Supabase admin_users table
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (!error && data) {
        if (data.password === cleanPassword) {
          // Update last_login
          await supabase
            .from('admin_users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', data.id);

          return res.json({
            success: true,
            user: {
              id: data.id,
              email: data.email,
              name: data.name,
              role: data.role,
              last_login: data.last_login
            },
            source: 'supabase_database'
          });
        } else {
          return res.status(401).json({ error: 'Invalid email or password.' });
        }
      }

      // If table exists but no users yet, seed default admin
      if (!error && !data) {
        const { count } = await supabase.from('admin_users').select('id', { count: 'exact', head: true });
        if (count === 0 && cleanEmail === 'natesajewellery@gmail.com' && cleanPassword === 'natesa123') {
          await supabase.from('admin_users').insert([
            {
              id: 'admin-1',
              email: cleanEmail,
              password: cleanPassword,
              name: 'Natesa Administrator',
              role: 'super_admin'
            }
          ]);
          return res.json({
            success: true,
            user: {
              id: 'admin-1',
              email: cleanEmail,
              name: 'Natesa Administrator',
              role: 'super_admin'
            },
            source: 'supabase_seeded'
          });
        }
      }
    } catch (err) {
      console.error('Supabase admin login error, falling back to local credentials:', err);
    }
  }

  // Fallback to local admin credentials
  const localMatch = currentAdminUsers.find(
    u => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword
  );

  if (localMatch || (cleanEmail === 'natesajewellery@gmail.com' && cleanPassword === 'natesa123')) {
    return res.json({
      success: true,
      user: {
        id: localMatch?.id || 'admin-1',
        email: cleanEmail,
        name: localMatch?.name || 'Natesa Administrator',
        role: 'super_admin'
      },
      source: 'local_credentials'
    });
  }

  return res.status(401).json({ error: 'Invalid email or password.' });
});

// List Admin Users
app.get('/api/admin/users', async (req: Request, res: Response) => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, email, name, role, created_at, last_login')
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        return res.json(data);
      }
    } catch (e) {
      console.warn('Could not read admin users from Supabase:', e);
    }
  }

  // Fallback local admin users (strip passwords)
  const safeUsers = currentAdminUsers.map(({ password, ...u }) => u);
  res.json(safeUsers);
});

// Create or Update Admin Credentials in Supabase
app.post('/api/admin/users', async (req: Request, res: Response) => {
  const { email, password, name, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const adminData = {
    id: `admin-${Date.now()}`,
    email: cleanEmail,
    password: password.trim(),
    name: name || 'Natesa Administrator',
    role: role || 'admin',
    created_at: new Date().toISOString()
  };

  let savedInSupabase = false;

  if (supabase) {
    try {
      const { error } = await supabase
        .from('admin_users')
        .upsert([adminData], { onConflict: 'email' });

      if (!error) {
        savedInSupabase = true;
      } else {
        console.warn('Supabase admin_users upsert warning:', error.message);
      }
    } catch (e: any) {
      console.error('Supabase admin_users error:', e.message);
    }
  }

  // Update in-memory
  const existingIndex = currentAdminUsers.findIndex(u => u.email.toLowerCase() === cleanEmail);
  if (existingIndex > -1) {
    currentAdminUsers[existingIndex] = { ...currentAdminUsers[existingIndex], ...adminData };
  } else {
    currentAdminUsers.push(adminData);
  }

  const { password: _, ...safeUser } = adminData;
  res.json({
    success: true,
    user: safeUser,
    stored_in_supabase: savedInSupabase
  });
});

// ---------------- PRODUCTS IN SUPABASE & LOCAL ----------------

// Products list (Fetches from Supabase if connected, falls back to in-memory)
app.get('/api/products', async (req: Request, res: Response) => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Sync in-memory cache
        currentProducts = data as Product[];
        return res.json(data);
      }
    } catch (e) {
      console.warn('Supabase products fetch failed, using local cache:', e);
    }
  }

  res.json(currentProducts);
});

// Create Product in Supabase
app.post('/api/products', async (req: Request, res: Response) => {
  const newProduct: Product = {
    ...req.body,
    id: req.body.id || `prod-${Date.now()}`,
    slug: req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    created_at: new Date().toISOString()
  };

  let savedInSupabase = false;
  if (supabase) {
    try {
      const { error } = await supabase.from('products').insert([newProduct]);
      if (!error) {
        savedInSupabase = true;
      } else {
        console.warn('Supabase product insert warning:', error.message);
      }
    } catch (e) {
      console.error('Supabase product insert error:', e);
    }
  }

  currentProducts.unshift(newProduct);
  res.status(201).json({ ...newProduct, saved_in_supabase: savedInSupabase });
});

// Update Product in Supabase
app.put('/api/products/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const index = currentProducts.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const updated = { ...currentProducts[index], ...req.body };
  currentProducts[index] = updated;

  let savedInSupabase = false;
  if (supabase) {
    try {
      const { error } = await supabase
        .from('products')
        .update(req.body)
        .eq('id', id);

      if (!error) savedInSupabase = true;
    } catch (e) {
      console.error('Supabase product update error:', e);
    }
  }

  res.json({ ...updated, saved_in_supabase: savedInSupabase });
});

// Delete Product in Supabase
app.delete('/api/products/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  currentProducts = currentProducts.filter(p => p.id !== id);

  let deletedFromSupabase = false;
  if (supabase) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) deletedFromSupabase = true;
    } catch (e) {
      console.error('Supabase product delete error:', e);
    }
  }

  res.json({ success: true, deleted_id: id, deleted_from_supabase: deletedFromSupabase });
});

// ---------------- CATEGORIES IN SUPABASE & LOCAL ----------------

// Categories list
app.get('/api/categories', async (req: Request, res: Response) => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        currentCategories = data as Category[];
        return res.json(data);
      }
    } catch (e) {
      console.warn('Supabase categories fetch failed, using local cache:', e);
    }
  }

  res.json(currentCategories);
});

// Create Category in Supabase
app.post('/api/categories', async (req: Request, res: Response) => {
  const newCategory: Category = {
    ...req.body,
    id: req.body.id || `cat-${Date.now()}`,
    slug: req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    display_order: currentCategories.length + 1
  };

  let savedInSupabase = false;
  if (supabase) {
    try {
      const { error } = await supabase.from('categories').insert([newCategory]);
      if (!error) savedInSupabase = true;
    } catch (e) {
      console.error('Supabase category insert error:', e);
    }
  }

  currentCategories.push(newCategory);
  res.status(201).json({ ...newCategory, saved_in_supabase: savedInSupabase });
});

// Update Category in Supabase
app.put('/api/categories/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const index = currentCategories.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }

  currentCategories[index] = { ...currentCategories[index], ...req.body };

  let savedInSupabase = false;
  if (supabase) {
    try {
      const { error } = await supabase
        .from('categories')
        .update(req.body)
        .eq('id', id);

      if (!error) savedInSupabase = true;
    } catch (e) {
      console.error('Supabase category update error:', e);
    }
  }

  res.json({ ...currentCategories[index], saved_in_supabase: savedInSupabase });
});

// Delete Category in Supabase
app.delete('/api/categories/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  currentCategories = currentCategories.filter(c => c.id !== id);

  let deletedFromSupabase = false;
  if (supabase) {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (!error) deletedFromSupabase = true;
    } catch (e) {
      console.error('Supabase category delete error:', e);
    }
  }

  res.json({ success: true, deleted_id: id, deleted_from_supabase: deletedFromSupabase });
});

// ---------------- RATES IN SUPABASE ----------------

app.get('/api/rates', async (req: Request, res: Response) => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('rates')
        .select('*')
        .eq('id', 'live_rates')
        .maybeSingle();

      if (!error && data) {
        currentRates = {
          gold_22k_rate: Number(data.gold_22k_rate),
          gold_24k_rate: Number(data.gold_24k_rate),
          silver_925_rate: Number(data.silver_925_rate),
          updated_at: data.updated_at || new Date().toISOString()
        };
      }
    } catch (e) {
      console.warn('Supabase rates fetch error:', e);
    }
  }
  res.json(currentRates);
});

app.post('/api/rates', async (req: Request, res: Response) => {
  const { gold_22k_rate, gold_24k_rate, silver_925_rate } = req.body;
  currentRates = {
    gold_22k_rate: Number(gold_22k_rate) || currentRates.gold_22k_rate,
    gold_24k_rate: Number(gold_24k_rate) || currentRates.gold_24k_rate,
    silver_925_rate: Number(silver_925_rate) || currentRates.silver_925_rate,
    updated_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      await supabase.from('rates').upsert([
        {
          id: 'live_rates',
          gold_22k_rate: currentRates.gold_22k_rate,
          gold_24k_rate: currentRates.gold_24k_rate,
          silver_925_rate: currentRates.silver_925_rate,
          updated_at: currentRates.updated_at
        }
      ], { onConflict: 'id' });
    } catch (e) {
      console.error('Supabase rates update error:', e);
    }
  }

  res.json({ success: true, rates: currentRates });
});

// ---------------- ORDERS IN SUPABASE ----------------

app.get('/api/orders', async (req: Request, res: Response) => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        currentOrders = data as Order[];
        return res.json(data);
      }
    } catch (e) {
      console.warn('Supabase orders fetch error:', e);
    }
  }

  res.json(currentOrders);
});

app.get('/api/orders/:query', async (req: Request, res: Response) => {
  const query = req.params.query.trim().toLowerCase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`id.ilike.%${query}%,phone.ilike.%${query}%`)
        .maybeSingle();

      if (!error && data) {
        return res.json(data);
      }
    } catch (e) {
      console.warn('Supabase order search error:', e);
    }
  }

  const order = currentOrders.find(
    o => o.id.toLowerCase() === query || o.phone.replace(/[^0-9]/g, '').includes(query.replace(/[^0-9]/g, ''))
  );

  if (!order) {
    return res.status(404).json({ error: 'Order not found for given ID or phone number' });
  }
  res.json(order);
});

app.post('/api/orders', async (req: Request, res: Response) => {
  const orderId = `NJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const newOrder: Order = {
    ...req.body,
    id: orderId,
    status: 'Pending',
    created_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      await supabase.from('orders').insert([newOrder]);
    } catch (e) {
      console.error('Supabase order insert error:', e);
    }
  }

  currentOrders.unshift(newOrder);
  res.status(201).json(newOrder);
});

app.put('/api/orders/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, tracking_number, courier_name } = req.body;
  const index = currentOrders.findIndex(o => o.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  currentOrders[index] = {
    ...currentOrders[index],
    status: status || currentOrders[index].status,
    tracking_number: tracking_number !== undefined ? tracking_number : currentOrders[index].tracking_number,
    courier_name: courier_name !== undefined ? courier_name : currentOrders[index].courier_name
  };

  if (supabase) {
    try {
      await supabase
        .from('orders')
        .update({
          status: currentOrders[index].status,
          tracking_number: currentOrders[index].tracking_number,
          courier_name: currentOrders[index].courier_name
        })
        .eq('id', id);
    } catch (e) {
      console.error('Supabase order update error:', e);
    }
  }

  res.json(currentOrders[index]);
});

// Enquiries
app.post('/api/enquiries', (req: Request, res: Response) => {
  const newEnquiry: Enquiry = {
    ...req.body,
    id: `enq-${Date.now()}`,
    created_at: new Date().toISOString()
  };
  currentEnquiries.unshift(newEnquiry);
  res.status(201).json({ success: true, enquiry: newEnquiry });
});

// File upload handler (Cloudinary real CDN upload or Base64 return)
app.post('/api/upload', async (req: Request, res: Response) => {
  const { image, folder } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'No image data provided' });
  }

  // If already an external URL
  if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://'))) {
    if (image.includes('res.cloudinary.com')) {
      return res.json({ url: image, source: 'cloudinary' });
    }
  }

  const isConfigured = isCloudinaryConfigValid(cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret);

  if (isConfigured) {
    try {
      cloudinary.config({
        cloud_name: cloudinaryCloudName.trim(),
        api_key: cloudinaryApiKey.trim(),
        api_secret: cloudinaryApiSecret.trim(),
        secure: true
      });

      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: folder || 'natesa-jewellery/products',
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }
        ]
      });

      return res.json({
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        cloud_name: cloudinaryCloudName,
        status: 'uploaded_to_cloudinary'
      });
    } catch (err: any) {
      console.error('Cloudinary upload error:', err);
      return res.status(500).json({
        error: 'Cloudinary upload error: ' + (err.message || 'Check Cloudinary credentials')
      });
    }
  }

  // Fallback if Cloudinary is not connected yet
  const simulatedUrl = typeof image === 'string' && image.startsWith('data:image')
    ? image
    : `https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80`;

  res.json({
    url: simulatedUrl,
    cloud_name: 'local-cdn-fallback',
    status: 'local_preview_buffered',
    notice: 'Cloudinary is not linked yet. Connect Cloudinary in the Admin Portal or Vercel environment variables to host images permanently on Cloudinary CDN.'
  });
});

// ---------------- VITE / STATIC SERVING ----------------
app.use(express.static(path.resolve(__dirname, 'public')));

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Natesa Jewellery Server running at http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
  });
}

export default app;
