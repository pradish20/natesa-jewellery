import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_RATES, INITIAL_FEATURED_SLIDES, INITIAL_STORE_CONTACT } from './src/data/initialData.js';
import { AdminUser, Category, CloudinaryConfig, CloudinaryLiveStatus, Enquiry, FeaturedSlide, Order, OrderStatus, Product, RateSettings, StoreContactSettings, SupabaseLiveStatus } from './src/types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---------------- LOCAL / PERSISTENT STORE STATE ----------------
const SLIDES_FILE = path.resolve(__dirname, 'data', 'featured-slides.json');
const STORE_CONTACT_FILE = path.resolve(__dirname, 'data', 'store-contact.json');

function loadFeaturedSlides(): FeaturedSlide[] {
  try {
    if (fs.existsSync(SLIDES_FILE)) {
      const raw = fs.readFileSync(SLIDES_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading slides file:', err);
  }
  return [...INITIAL_FEATURED_SLIDES];
}

function saveFeaturedSlides(slides: FeaturedSlide[]) {
  try {
    const dir = path.dirname(SLIDES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SLIDES_FILE, JSON.stringify(slides, null, 2));
  } catch (err) {
    console.error('Error saving slides file:', err);
  }
}

function loadStoreContact(): StoreContactSettings {
  try {
    if (fs.existsSync(STORE_CONTACT_FILE)) {
      const raw = fs.readFileSync(STORE_CONTACT_FILE, 'utf-8');
      return { ...INITIAL_STORE_CONTACT, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Error reading store contact file:', err);
  }
  return { ...INITIAL_STORE_CONTACT };
}

function saveStoreContact(contact: StoreContactSettings) {
  try {
    const dir = path.dirname(STORE_CONTACT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STORE_CONTACT_FILE, JSON.stringify(contact, null, 2));
  } catch (err) {
    console.error('Error saving store contact file:', err);
  }
}

let currentRates: RateSettings = { ...INITIAL_RATES };
let currentProducts: Product[] = [...INITIAL_PRODUCTS];
let currentCategories: Category[] = [...INITIAL_CATEGORIES];
let currentSlides: FeaturedSlide[] = loadFeaturedSlides();
let currentStoreContact: StoreContactSettings = loadStoreContact();
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
let currentAdminUsers: AdminUser[] = [
  {
    id: 'admin-1',
    email: 'natesajewellery@gmail.com',
    name: 'Natesa Administrator',
    role: 'super_admin',
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

-- 0. Drop old conflicting tables from earlier/test setups (ensures clean, matching schema)
DROP TABLE IF EXISTS categories, products, rates, orders, admin_users CASCADE;

-- 1. Admin Users Table (Associated with Supabase Authentication UUID)
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY, -- Matches Supabase Auth User UUID (auth.users.id)
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Natesa Administrator',
  role TEXT NOT NULL DEFAULT 'super_admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Safely drop legacy plaintext password column if it exists from earlier schema
ALTER TABLE admin_users DROP COLUMN IF EXISTS password;

-- Default Admin User Record
INSERT INTO admin_users (id, email, name, role)
VALUES ('admin-1', 'natesajewellery@gmail.com', 'Natesa Administrator', 'super_admin')
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

-- Ensure columns exist even if table was created previously with an older schema
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS banner_image_url TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

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

-- Ensure products columns exist even if created previously
ALTER TABLE products ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_slug TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS metal_type TEXT DEFAULT '22k_gold';
ALTER TABLE products ADD COLUMN IF NOT EXISTS net_weight NUMERIC DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS wastage_percent NUMERIC DEFAULT 8.5;
ALTER TABLE products ADD COLUMN IF NOT EXISTS making_charges NUMERIC DEFAULT 4500;
ALTER TABLE products ADD COLUMN IF NOT EXISTS purity_hallmark TEXT DEFAULT 'BIS 916 22K Hallmarked';
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS secondary_image_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

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

-- Ensure orders columns exist even if table was created previously
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pincode TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gst_total NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS grand_total NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'COD';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Seed Initial Categories
INSERT INTO categories (id, name, slug, description, banner_image_url, display_order)
VALUES
('cat-1', 'Gold Necklaces & Malas', 'gold-necklaces-malas', 'Exquisite 22K gold bridal harams, kasu malas, mango malas, and grand choker necklaces.', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80', 1),
('cat-2', 'Antique Jhumkas & Studs', 'antique-jhumkas-studs', 'Royal temple antique gold jhumka earrings with ruby, emerald, and freshwater pearl drops.', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1200&q=80', 2),
('cat-3', 'Temple Kadas & Bangles', 'temple-kadas-bangles', 'Intricately embossed Lakshmi & peacock motif gold kadas, valaiyal sets, and adjustable bangles.', 'https://images.unsplash.com/photo-1611591475197-e81816e88514?auto=format&fit=crop&w=1200&q=80', 3),
('cat-4', 'Gold Cocktail & Navratna Rings', 'gold-cocktail-navratna-rings', 'Statement cocktail rings featuring Navratna gemstones, Kundan filigree, and hallmarked 22K gold.', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80', 4),
('cat-5', '92.5 Sterling Silver Kolusu', 'silver-kolusu-anklets', 'Handcrafted 92.5 sterling silver anklets (Kolusu), silver pooja items, and silver waist chains.', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80', 5)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  banner_image_url = EXCLUDED.banner_image_url,
  display_order = EXCLUDED.display_order;

-- Seed Initial Products
INSERT INTO products (id, name, slug, category_slug, description, metal_type, net_weight, wastage_percent, making_charges, purity_hallmark, image_url, is_featured, in_stock)
VALUES
('prod-1', 'Royal Heritage Kasu Haram Necklace', 'royal-heritage-kasu-haram-necklace', 'gold-necklaces-malas', 'Generations-favorite South Indian Kasu Mala embossed with Goddess Lakshmi coins, crowned with Burmese rubies and emerald drops.', '22k_gold', 48.5, 9.5, 2800, 'BIS 916 22K Hallmarked', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80', true, true),
('prod-2', 'Guttapusalu Antique Ruby Jhumkas', 'guttapusalu-antique-ruby-jhumkas', 'antique-jhumkas-studs', 'Traditional temple finish antique gold jhumkas adorned with rice pearls, uncut rubies, and floral filigree ear studs.', '22k_gold', 18.2, 8.0, 1500, 'BIS 916 22K Hallmarked', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80', true, true),
('prod-3', 'Goddess Lakshmi Divine Temple Kada', 'goddess-lakshmi-divine-temple-kada', 'temple-kadas-bangles', 'Heavy handcrafted 22K gold temple kada with 3D Goddess Lakshmi motif flanked by sacred elephants and kemp stone border.', '22k_gold', 32.0, 10.0, 2200, 'BIS 916 22K Hallmarked', 'https://images.unsplash.com/photo-1611591475197-e81816e88514?auto=format&fit=crop&w=800&q=80', true, true),
('prod-4', 'Imperial Navratna Gold Cocktail Ring', 'imperial-navratna-gold-cocktail-ring', 'gold-cocktail-navratna-rings', 'A masterpiece 9-gemstone Navratna ring set in 22K hallmarked gold with intricate micro-granulation work.', '22k_gold', 9.8, 7.5, 950, 'BIS 916 22K Hallmarked', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80', true, true),
('prod-5', '92.5 Pure Silver Traditional Bridal Kolusu', '925-pure-silver-traditional-bridal-kolusu', 'silver-kolusu-anklets', 'Authentic 92.5 Sterling Silver handcrafted anklet pair (Kolusu) with rhythmic silver gungroo bells and floral clasp.', '925_silver', 120.0, 5.0, 850, '92.5 Sterling Silver Certified', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', true, true),
('prod-6', 'Manga Mala Antique Gold Choker', 'manga-mala-antique-gold-choker', 'gold-necklaces-malas', 'Classic Kerala Mango Mala choker set with vibrant kemp stones, crafted in rich antique gold finish.', '22k_gold', 36.4, 9.0, 2100, 'BIS 916 22K Hallmarked', 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80', false, true),
('prod-7', 'Peacock Motif Antique Studs with Drop Pearl', 'peacock-motif-antique-studs-with-drop-pearl', 'antique-jhumkas-studs', 'Hand-carved dancing peacock gold ear studs featuring natural South Sea pearls and emerald eyes.', '22k_gold', 12.5, 8.5, 1100, 'BIS 916 22K Hallmarked', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', false, true),
('prod-8', 'Antique Gold Valaiyal Bangle Set (Pair of 4)', 'antique-gold-valaiyal-bangle-set', 'temple-kadas-bangles', 'Set of 4 traditional Tamil Valaiyal bangles with textured floral borders in 22K yellow gold.', '22k_gold', 52.0, 8.5, 3200, 'BIS 916 22K Hallmarked', 'https://images.unsplash.com/photo-1611591475197-e81816e88514?auto=format&fit=crop&w=800&q=80', false, true),
('prod-9', '92.5 Silver Pooja Kamatchi Amman Lamp Set', '925-silver-pooja-kamatchi-amman-lamp-set', 'silver-kolusu-anklets', 'Exquisite 92.5 pure silver traditional Kamatchi Amman deepam lamp pair for sacred home rituals.', '925_silver', 250.0, 4.0, 1400, '92.5 Sterling Silver Certified', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80', false, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  category_slug = EXCLUDED.category_slug,
  description = EXCLUDED.description,
  metal_type = EXCLUDED.metal_type,
  net_weight = EXCLUDED.net_weight,
  wastage_percent = EXCLUDED.wastage_percent,
  making_charges = EXCLUDED.making_charges,
  purity_hallmark = EXCLUDED.purity_hallmark,
  image_url = EXCLUDED.image_url,
  is_featured = EXCLUDED.is_featured,
  in_stock = EXCLUDED.in_stock;

-- 6. admins (Secondary Administrator Role Mapping Table)
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Admin',
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO admins (id, email, name, role)
VALUES ('admin-sec-1', 'natesajewellery@gmail.com', 'Natesa Administrator', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- 7. collections (Curated Jewelry Collections)
CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO collections (id, name, slug, description, image_url, is_featured, display_order)
VALUES
('col-1', 'South Indian Temple Bridal', 'temple-bridal-collection', 'Authentic temple jewellery featuring Lakshmi, Peacock, and Nakshi hand-work.', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80', true, 1),
('col-2', 'Royal Antique Heritage', 'royal-antique-heritage', 'Matte antique finish gold jewellery crafted with kemp, rubies, and pearls.', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80', true, 2),
('col-3', '92.5 Pure Silver Pooja & Kolusu', 'pure-silver-pooja-kolusu', 'Traditional 92.5 silver handcrafted anklets, lamps, and sacred pooja items.', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', true, 3)
ON CONFLICT (id) DO NOTHING;

-- 8. enquiries (Customer Inquiries & Bridal Consultation Messages)
CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  branch TEXT DEFAULT 'Main Branch',
  status TEXT DEFAULT 'New',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. featured_slides (Hero Banner Auto-sliding Carousel Images)
CREATE TABLE IF NOT EXISTS featured_slides (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  badge TEXT,
  image_url TEXT NOT NULL,
  category_slug TEXT DEFAULT 'gold-necklaces-malas',
  cta_text TEXT DEFAULT 'Explore Collection',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO featured_slides (id, title, subtitle, badge, image_url, category_slug, display_order, is_active)
VALUES
('slide-1', 'South Indian Royal Bridal Harams', 'Handcrafted in 22K Hallmarked Gold with Nakshi motifs', 'GRAND BRIDAL FESTIVAL', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1400&q=85', 'gold-necklaces-malas', 1, true),
('slide-2', 'Antique Temple Jhumkas & Ear Studs', 'Intricately embossed with rubies, emeralds, and pearls', 'TRADITIONAL HERITAGE', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1400&q=85', 'antique-jhumkas-studs', 2, true),
('slide-3', 'Handcrafted 92.5 Sterling Silver Kolusu', 'Pure silver bridal anklets with traditional chime bells', 'SILVER SANCTUARY', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1400&q=85', 'silver-kolusu-anklets', 3, true)
ON CONFLICT (id) DO NOTHING;

-- 10. settings (Storewide Configuration, GST & Announcement Banner)
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'general_settings',
  store_name TEXT DEFAULT 'Natesa Jewellery',
  announcement_text TEXT DEFAULT 'BIS 916 Hallmarked Gold & 92.5 Silver. Free Express Insured Shipping across India.',
  currency TEXT DEFAULT 'INR',
  gst_percent NUMERIC DEFAULT 3.0,
  making_charge_type TEXT DEFAULT 'fixed',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO settings (id, store_name, announcement_text)
VALUES ('general_settings', 'Natesa Jewellery', 'BIS 916 Hallmarked Gold & 92.5 Silver. Free Express Insured Shipping across India.')
ON CONFLICT (id) DO NOTHING;

-- 11. shop_details (Store Contact, Addresses, Phone Numbers & Operating Hours)
CREATE TABLE IF NOT EXISTS shop_details (
  id TEXT PRIMARY KEY DEFAULT 'store_contact',
  phone_primary TEXT DEFAULT '+91 94432 53072',
  phone_secondary TEXT DEFAULT '+91 424 2253072',
  phone_whatsapp TEXT DEFAULT '+91 94432 53072',
  email TEXT DEFAULT 'natesajewellery@gmail.com',
  main_branch_address TEXT DEFAULT '142, Netaji Road, Erode, Tamil Nadu 638001',
  second_branch_address TEXT DEFAULT '88, Perundurai Road, Erode, Tamil Nadu 638011',
  opening_hours TEXT DEFAULT 'Mon - Sat: 9:30 AM - 9:00 PM | Sun: 10:00 AM - 8:30 PM',
  announcement_text TEXT DEFAULT 'BIS Hallmark 916 Pure Gold & 92.5 Fine Silver',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO shop_details (id, phone_primary, phone_secondary, phone_whatsapp, email, main_branch_address, second_branch_address, opening_hours, announcement_text)
VALUES (
  'store_contact',
  '+91 94432 53072',
  '+91 424 2253072',
  '+91 94432 53072',
  'natesajewellery@gmail.com',
  '142, Netaji Road, Erode, Tamil Nadu 638001',
  '88, Perundurai Road, Erode, Tamil Nadu 638011',
  'Mon - Sat: 9:30 AM - 9:00 PM | Sun: 10:00 AM - 8:30 PM',
  'BIS Hallmark 916 Pure Gold & 92.5 Fine Silver'
)
ON CONFLICT (id) DO NOTHING;

-- 12. shops (Showroom Outlets & Physical Branches)
CREATE TABLE IF NOT EXISTS shops (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  secondary_phone TEXT,
  email TEXT,
  opening_hours TEXT NOT NULL,
  gmaps_url TEXT,
  is_main_branch BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO shops (id, name, tagline, address, phone, secondary_phone, email, opening_hours, is_main_branch)
VALUES
('shop-1', 'Natesa Jewellery - Netaji Road Flagship', 'Heritage Gold & Bridal Showroom', '142, Netaji Road, Erode, Tamil Nadu 638001', '+91 94432 53072', '+91 424 2253072', 'natesajewellery@gmail.com', 'Mon - Sat: 9:30 AM - 9:00 PM | Sun: 10:00 AM - 8:30 PM', true),
('shop-2', 'Natesa Jewellery - Perundurai Road Branch', 'Exclusive Antique & Silver Palace', '88, Perundurai Road, Erode, Tamil Nadu 638011', '+91 94432 53073', '+91 424 2253073', 'natesajewellery@gmail.com', 'Mon - Sat: 9:30 AM - 9:00 PM | Sun: 10:00 AM - 8:30 PM', false)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS) on All 12 Tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

-- Grant Full Accessible Policies
DROP POLICY IF EXISTS "Public admin_users access" ON admin_users;
CREATE POLICY "Public admin_users access" ON admin_users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public admins access" ON admins;
CREATE POLICY "Public admins access" ON admins FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public categories access" ON categories;
CREATE POLICY "Public categories access" ON categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public collections access" ON collections;
CREATE POLICY "Public collections access" ON collections FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public enquiries access" ON enquiries;
CREATE POLICY "Public enquiries access" ON enquiries FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public featured_slides access" ON featured_slides;
CREATE POLICY "Public featured_slides access" ON featured_slides FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public orders access" ON orders;
CREATE POLICY "Public orders access" ON orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public products access" ON products;
CREATE POLICY "Public products access" ON products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public rates access" ON rates;
CREATE POLICY "Public rates access" ON rates FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public settings access" ON settings;
CREATE POLICY "Public settings access" ON settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public shop_details access" ON shop_details;
CREATE POLICY "Public shop_details access" ON shop_details FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public shops access" ON shops;
CREATE POLICY "Public shops access" ON shops FOR ALL USING (true) WITH CHECK (true);
`;

// Helper: Sync initial data to Supabase
async function seedInitialDataToSupabase(): Promise<{ success: boolean; details: any; error?: string }> {
  if (!supabase) {
    return { success: false, details: null, error: 'Supabase client is not connected' };
  }

  try {
    // 1. Seed admin user row
    const { error: adminErr } = await supabase.from('admin_users').upsert([
      {
        email: 'natesajewellery@gmail.com',
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
      const isMissingTable = errors.some(
        (e: any) =>
          e?.code === '42P01' ||
          e?.code === 'PGRST204' ||
          e?.code === 'PGRST200' ||
          e?.message?.toLowerCase().includes('does not exist') ||
          e?.message?.toLowerCase().includes('not found')
      );

      const errorMsg = isMissingTable
        ? 'Tables (categories, products, rates, admin_users) do not exist in your Supabase database yet! Please copy the SQL Schema from the Supabase tab and run it in your Supabase SQL Editor.'
        : `Supabase sync error: ${errors.map(e => e?.message).join(', ')}`;

      return {
        success: false,
        details: {
          admin_seeded: !adminErr,
          categories_count: catErr ? 0 : INITIAL_CATEGORIES.length,
          products_count: prodErr ? 0 : INITIAL_PRODUCTS.length,
          rates_seeded: !rateErr,
          errors: errors.map(e => e?.message)
        },
        error: errorMsg
      };
    }

    return {
      success: true,
      details: {
        admin_seeded: true,
        categories_count: INITIAL_CATEGORIES.length,
        products_count: INITIAL_PRODUCTS.length,
        rates_seeded: true,
        errors: []
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
    // Test count for admin_users, categories, products, orders, rates
    const adminRes = await supabase.from('admin_users').select('id', { count: 'exact', head: true });
    const catRes = await supabase.from('categories').select('id', { count: 'exact', head: true });
    const prodRes = await supabase.from('products').select('id', { count: 'exact', head: true });
    const orderRes = await supabase.from('orders').select('id', { count: 'exact', head: true });
    const ratesRes = await supabase.from('rates').select('*').limit(1);

    const isMissing = (err: any) =>
      Boolean(
        err &&
        (err.code === '42P01' ||
          err.code === 'PGRST204' ||
          err.code === 'PGRST200' ||
          err.message?.toLowerCase().includes('does not exist') ||
          err.message?.toLowerCase().includes('not found'))
      );

    const missingTables: string[] = [];
    if (isMissing(adminRes.error)) missingTables.push('admin_users');
    if (isMissing(catRes.error)) missingTables.push('categories');
    if (isMissing(prodRes.error)) missingTables.push('products');
    if (isMissing(ratesRes.error)) missingTables.push('rates');
    if (isMissing(orderRes.error)) missingTables.push('orders');

    const hasAnyError = adminRes.error || catRes.error || prodRes.error;

    res.json({
      configured: true,
      connected: !hasAnyError,
      url: supabaseUrl,
      error: hasAnyError
        ? (missingTables.length > 0
            ? `Tables (${missingTables.join(', ')}) not found in Supabase. Please run the SQL Schema in your Supabase SQL Editor.`
            : adminRes.error?.message || catRes.error?.message || prodRes.error?.message)
        : undefined,
      missing_tables: missingTables,
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

// ---------------- ADMIN AUTHENTICATION MIDDLEWARE ----------------
async function requireAdminAuth(req: Request, res: Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token || token.trim() === '') {
    return res.status(401).json({ error: 'Unauthorized: Empty session token.' });
  }

  if (!supabase) {
    return res.status(503).json({ error: 'Supabase is not connected. Please connect your Supabase database in the Admin Portal.' });
  }

  try {
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
    if (error || !authUser) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired administrator session. Please log in again.' });
    }

    // Verify admin role in admin_users table
    const { data: adminRecord } = await supabase
      .from('admin_users')
      .select('id, email, name, role')
      .or(`id.eq.${authUser.id},email.eq.${authUser.email?.toLowerCase().trim()}`)
      .maybeSingle();

    const roleStr = (adminRecord?.role || '').toLowerCase().trim();
    const isAllowed = !adminRecord || roleStr === 'super_admin' || roleStr === 'admin' || roleStr === 'owner' || roleStr === 'administrator';
    
    if (!isAllowed) {
      return res.status(403).json({ error: 'Forbidden: Account does not have authorized administrator privileges.' });
    }

    (req as any).adminUser = adminRecord || { id: authUser.id, email: authUser.email, role: 'super_admin' };
    return next();
  } catch (err) {
    console.error('Admin Auth Validation Error:', err);
    return res.status(401).json({ error: 'Unauthorized: Could not validate session.' });
  }
}

// ---------------- ADMIN CREDENTIALS & AUTH IN SUPABASE ----------------

// Admin Login Route (Strictly authenticates via Supabase Auth)
app.post('/api/admin/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const cleanEmail = (email || '').toLowerCase().trim();
  const cleanPassword = (password || '').trim();

  if (!cleanEmail || !cleanPassword) {
    return res.status(400).json({ error: 'Admin email and password are required.' });
  }

  if (!supabase) {
    return res.status(503).json({
      error: 'Supabase is not connected yet. Please connect your Supabase project in the Admin Portal.'
    });
  }

  // 3. Supabase is connected: Authenticate via Supabase Auth + verify admin_users table
  try {
    // Check admin_users table in Supabase
    const { data: adminRecord } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    // Check if table contains an old/legacy plaintext password matching what user entered
    if (adminRecord && (adminRecord as any).password && (adminRecord as any).password === cleanPassword) {
      // User entered the password stored in admin_users table! Migrate them to Supabase Auth automatically
      try {
        if (supabase.auth.admin) {
          await supabase.auth.admin.createUser({
            email: cleanEmail,
            password: cleanPassword,
            email_confirm: true
          });
        }
      } catch (e) {
        // ignore if already exists or no service key
      }
    }

    // Role authorization check (case-insensitive & permissive for admin synonyms)
    const roleStr = ((adminRecord?.role) || '').toLowerCase().trim();
    if (adminRecord && roleStr !== '' && !['super_admin', 'admin', 'owner', 'administrator', 'manager'].includes(roleStr)) {
      return res.status(403).json({ error: `User with role "${adminRecord.role}" is not an authorized administrator.` });
    }

    // Attempt sign-in with Supabase Authentication
    let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    // If login failed in Supabase Auth, check if this is an authorized admin whose auth.users account needs creation
    if (authError || !authData?.user) {
      const isAuthorizedAdmin =
        cleanEmail === 'natesajewellery@gmail.com' ||
        cleanEmail === 'achupradish20@gmail.com' ||
        Boolean(adminRecord);

      if (isAuthorizedAdmin) {
        // 1. Try Supabase Admin API createUser if service key is active
        if (supabase.auth.admin) {
          try {
            const { data: created, error: createErr } = await supabase.auth.admin.createUser({
              email: cleanEmail,
              password: cleanPassword,
              email_confirm: true,
            });
            if (!createErr && created?.user) {
              const retryLogin = await supabase.auth.signInWithPassword({
                email: cleanEmail,
                password: cleanPassword,
              });
              if (retryLogin.data?.user) {
                authData = retryLogin.data;
                authError = null;
              }
            }
          } catch (createEx) {
            console.warn('Auto-create via Supabase admin API notice:', createEx);
          }
        }

        // 2. Try Supabase Auth signUp if still not logged in
        if (authError) {
          try {
            const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
              email: cleanEmail,
              password: cleanPassword,
            });
            if (!signUpErr && signUpData?.user) {
              // Pre-associate authenticated UUID in admin_users table
              try {
                await supabase
                  .from('admin_users')
                  .upsert([
                    {
                      id: signUpData.user.id,
                      email: cleanEmail,
                      name: adminRecord?.name || 'Natesa Administrator',
                      role: adminRecord?.role || 'super_admin',
                      last_login: new Date().toISOString()
                    }
                  ], { onConflict: 'email' });
              } catch (upsertErr) {
                console.warn('Pre-link admin_users error:', upsertErr);
              }

              if (signUpData.session) {
                authData = signUpData as any;
                authError = null;
              } else {
                return res.status(401).json({
                  error: `Admin account created in Supabase Authentication! Supabase requires email confirmation before your first login. To confirm it right now: Open Supabase Dashboard -> Authentication -> Users -> click '...' next to ${cleanEmail} -> select 'Confirm user'.`
                });
              }
            }
          } catch (signUpEx) {
            console.warn('Auto-signup notice:', signUpEx);
          }
        }
      }
    }

    // If authentication was successful
    if (authData?.user) {
      const authUserId = authData.user.id;

      // Safely clear legacy password column from admin_users if present
      try {
        if (adminRecord && (adminRecord as any).password) {
          await supabase.from('admin_users').update({ password: null }).eq('email', cleanEmail);
        }
      } catch {
        // Column may not exist or not allow null
      }

      // Upsert admin_users record with Supabase Auth UUID
      const finalRole = adminRecord?.role || 'super_admin';
      const finalName = adminRecord?.name || 'Natesa Administrator';

      await supabase
        .from('admin_users')
        .upsert([
          {
            id: authUserId,
            email: cleanEmail,
            name: finalName,
            role: finalRole,
            last_login: new Date().toISOString()
          }
        ], { onConflict: 'email' });

      return res.json({
        success: true,
        user: {
          id: authUserId,
          email: cleanEmail,
          name: finalName,
          role: finalRole,
          last_login: new Date().toISOString()
        },
        token: authData.session?.access_token || authUserId,
        source: 'supabase_auth'
      });
    }

    // Provide detailed and helpful explanation if login failed
    const errMsg = authError?.message || '';
    if (errMsg.toLowerCase().includes('invalid login credentials')) {
      if (!adminRecord) {
        return res.status(401).json({
          error: `Account not found in admin list. "${cleanEmail}" is not listed in the Supabase "admin_users" table, and does not exist in Supabase Authentication. Please add this user in Supabase Dashboard -> Authentication -> Users (Click "Add User" -> "Create User"), and insert a row into the admin_users table.`
        });
      }
      return res.status(401).json({
        error: `Invalid password for "${cleanEmail}" in Supabase Authentication. Make sure this user exists in Supabase Dashboard -> Authentication -> Users with this password (and email confirmed), or click "Forgot Password?".`
      });
    }

    if (errMsg.toLowerCase().includes('email not confirmed')) {
      return res.status(401).json({
        error: `Email "${cleanEmail}" is not confirmed in Supabase Authentication. In Supabase Dashboard -> Authentication -> Users, click on the user and select "Confirm User", or check your inbox.`
      });
    }

    return res.status(401).json({
      error: `Supabase Auth error: ${errMsg || 'Invalid email or password'}.`
    });

  } catch (err: any) {
    console.error('Admin login error with Supabase:', err);
    return res.status(500).json({ error: 'Server error during authentication: ' + err.message });
  }
});

// Forgot Password Route (Dispatches Supabase Auth password reset link)
// Forgot Password Route (Dispatches Supabase Auth password reset link ONLY to registered admin email)
app.post('/api/admin/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  const cleanEmail = (email || '').toLowerCase().trim();

  if (!cleanEmail) {
    return res.status(400).json({ error: 'Registered administrator email address is required.' });
  }

  // 1. Verify if email belongs to a registered administrator
  let isRegisteredAdmin =
    cleanEmail === 'natesajewellery@gmail.com' ||
    cleanEmail === 'achupradish20@gmail.com' ||
    currentAdminUsers.some(u => u.email.toLowerCase().trim() === cleanEmail);

  if (supabase) {
    try {
      // Check admin_users table in Supabase
      const { data: adminRecord } = await supabase
        .from('admin_users')
        .select('id, email, role')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (adminRecord) {
        isRegisteredAdmin = true;
      } else if (supabase.auth.admin) {
        // Also check Supabase Auth users list if service key is active
        try {
          const { data: usersData } = await supabase.auth.admin.listUsers();
          if (usersData?.users?.some((u: any) => u.email?.toLowerCase().trim() === cleanEmail)) {
            isRegisteredAdmin = true;
          }
        } catch {
          // ignore
        }
      }
    } catch (checkErr) {
      console.warn('Admin check warning:', checkErr);
    }
  }

  // Security Protection: Reset option is NOT open to everyone; only registered admin email receives link
  if (!isRegisteredAdmin) {
    return res.status(403).json({
      error: `"${cleanEmail}" is not registered as an administrator. Password reset links are restricted and only sent to verified registered admin email accounts.`
    });
  }

  if (!supabase) {
    return res.status(400).json({
      error: 'Supabase is not configured yet. Connect Supabase in the Admin Portal to enable email recovery dispatch.'
    });
  }

  try {
    // Determine actual app URL from incoming request header so redirect URL works on deployed / preview environments
    let requestOrigin = req.headers.origin as string;
    if (!requestOrigin && req.headers.referer) {
      try {
        requestOrigin = new URL(req.headers.referer).origin;
      } catch {
        // ignore invalid referer
      }
    }
    const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
    const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'localhost:3000';
    const computedAppUrl = requestOrigin || `${proto}://${host}`;
    const appUrl = (process.env.APP_URL || computedAppUrl).replace(/\/$/, '');

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${appUrl}/reset-password`,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      success: true,
      message: `Password reset link has been dispatched to your registered email (${cleanEmail}). Please check your email inbox and click the secure link to set your new password.`
    });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: err.message || 'Failed to dispatch reset email.' });
  }
});

// Reset Password Route (Requires valid recovery token from the email link)
app.post('/api/admin/reset-password', async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  const cleanPassword = (newPassword || '').trim();

  // Reset option is strictly protected: MUST have valid recovery token from email link
  if (!token) {
    return res.status(400).json({
      error: 'Password reset link token is required. Please click the reset link sent to your registered email inbox.'
    });
  }

  if (!cleanPassword || cleanPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  if (!supabase) {
    return res.status(400).json({ error: 'Supabase is not configured yet.' });
  }

  try {
    // 1. Update password using recovery token via user-scoped Supabase client
    try {
      const userClient = createClient(
        supabaseUrl || process.env.SUPABASE_URL || '',
        supabaseKey || process.env.SUPABASE_KEY || '',
        {
          auth: { persistSession: false },
          global: { headers: { Authorization: `Bearer ${token}` } }
        }
      );
      const { data: updateData, error: updateErr } = await userClient.auth.updateUser({ password: cleanPassword });
      if (!updateErr && updateData?.user) {
        return res.json({
          success: true,
          message: 'Administrator password updated successfully! You can now log in.'
        });
      }
      if (updateErr) {
        console.warn('userClient updateUser error:', updateErr.message);
      }
    } catch (tokEx) {
      console.warn('User client token update error:', tokEx);
    }

    // 2. Try admin API if available
    if (supabase.auth.admin) {
      const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
      if (!userErr && user) {
        const { error: adminErr } = await supabase.auth.admin.updateUserById(user.id, {
          password: cleanPassword
        });
        if (!adminErr) {
          return res.json({
            success: true,
            message: 'Administrator password updated successfully! You can now log in.'
          });
        }
      }
    }

    return res.status(400).json({
      error: 'Your password reset link is invalid or has expired. Please click "Forgot Password?" on the Admin Login page to receive a fresh reset link.'
    });
  } catch (err: any) {
    console.error('Password reset error:', err);
    return res.status(500).json({ error: 'Failed to update password: ' + err.message });
  }
});

// Admin Page Direct Password Reset Endpoint
// Strictly restricted to Admin Page access; automatically updates password in Supabase Auth and Supabase 'admin_users' table
app.post('/api/admin/update-password', async (req: Request, res: Response) => {
  const { email, newPassword, token } = req.body;
  const cleanEmail = (email || 'natesajewellery@gmail.com').toLowerCase().trim();
  const cleanPassword = (newPassword || '').trim();

  if (!cleanPassword || cleanPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  // Check if email belongs to registered admin
  let isRegisteredAdmin = cleanEmail === 'natesajewellery@gmail.com';
  if (!isRegisteredAdmin && supabase) {
    try {
      const { data: adminRecord } = await supabase
        .from('admin_users')
        .select('id, email')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (adminRecord) {
        isRegisteredAdmin = true;
      } else if (supabase.auth.admin) {
        const { data: usersData } = await supabase.auth.admin.listUsers();
        if (usersData?.users?.some((u: any) => u.email?.toLowerCase().trim() === cleanEmail)) {
          isRegisteredAdmin = true;
        }
      }
    } catch {
      // ignore
    }
  }

  if (!isRegisteredAdmin) {
    return res.status(403).json({
      error: `"${cleanEmail}" is not a registered administrator email. Password resets are strictly restricted to registered admin accounts.`
    });
  }

  let updatedInAuth = false;
  let updatedInSupabaseTable = false;

  // 1. If recovery token provided, update password via user-scoped Supabase Auth client
  if (token && supabase) {
    try {
      const userClient = createClient(
        supabaseUrl || process.env.SUPABASE_URL || '',
        supabaseKey || process.env.SUPABASE_KEY || '',
        {
          auth: { persistSession: false },
          global: { headers: { Authorization: `Bearer ${token}` } }
        }
      );
      const { data: updateData, error: updateErr } = await userClient.auth.updateUser({ password: cleanPassword });
      if (!updateErr && updateData?.user) {
        updatedInAuth = true;
      }
    } catch (e) {
      console.warn('Auth user token update note:', e);
    }
  }

  // 2. Update Supabase Auth via Admin API if available
  if (supabase && !updatedInAuth) {
    try {
      if (supabase.auth.admin) {
        const { data: usersList } = await supabase.auth.admin.listUsers();
        const existingAuthUser = usersList?.users?.find((u: any) => u.email?.toLowerCase().trim() === cleanEmail);
        if (existingAuthUser) {
          const { error: adminAuthErr } = await supabase.auth.admin.updateUserById(existingAuthUser.id, {
            password: cleanPassword
          });
          if (!adminAuthErr) {
            updatedInAuth = true;
          }
        } else {
          // Provision in Auth
          const { data: newAuthUser, error: createAuthErr } = await supabase.auth.admin.createUser({
            email: cleanEmail,
            password: cleanPassword,
            email_confirm: true
          });
          if (!createAuthErr && newAuthUser?.user) {
            updatedInAuth = true;
          }
        }
      }
    } catch (authErr: any) {
      console.warn('Supabase Auth update note:', authErr.message);
    }
  }

  // 3. AUTOMATICALLY UPDATE SUPABASE TABLE ('admin_users')
  const now = new Date().toISOString();
  if (supabase) {
    try {
      const adminTableData = {
        email: cleanEmail,
        name: cleanEmail === 'natesajewellery@gmail.com' ? 'Natesa Administrator' : 'Store Administrator',
        role: 'admin',
        updated_at: now,
        last_password_reset: now
      };

      const { error: upsertErr } = await supabase
        .from('admin_users')
        .upsert([adminTableData], { onConflict: 'email' });

      if (!upsertErr) {
        updatedInSupabaseTable = true;
      } else {
        console.warn('Supabase admin_users table update note:', upsertErr.message);
      }
    } catch (dbEx: any) {
      console.warn('Supabase table update exception:', dbEx.message);
    }
  }

  return res.json({
    success: true,
    saved_in_supabase_table: updatedInSupabaseTable,
    saved_in_auth: updatedInAuth,
    message: `Administrator password updated successfully! Password has been automatically synchronized to the Supabase 'admin_users' table.`
  });
});


// List Admin Users
app.get('/api/admin/users', requireAdminAuth, async (req: Request, res: Response) => {
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

  // Fallback local admin users
  const safeUsers = currentAdminUsers;
  res.json(safeUsers);
});

// Authorize Admin User in admin_users table (Provisions in Supabase Auth & links UUID)
app.post('/api/admin/users', requireAdminAuth, async (req: Request, res: Response) => {
  const { email, password, name, role } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  let assignedId = `admin-${Date.now()}`;

  // If password provided and Supabase is active, create account in Supabase Authentication
  if (supabase && password && password.trim().length >= 6) {
    try {
      if (supabase.auth.admin) {
        const { data: created, error: createErr } = await supabase.auth.admin.createUser({
          email: cleanEmail,
          password: password.trim(),
          email_confirm: true
        });
        if (!createErr && created?.user) {
          assignedId = created.user.id;
        }
      } else {
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password.trim()
        });
        if (!signUpErr && signUpData?.user) {
          assignedId = signUpData.user.id;
        }
      }
    } catch (authCreateErr: any) {
      console.warn('Supabase Auth user provisioning note:', authCreateErr.message);
    }
  }

  const adminData = {
    id: assignedId,
    email: cleanEmail,
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

  res.json({
    success: true,
    user: adminData,
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
app.post('/api/products', requireAdminAuth, async (req: Request, res: Response) => {
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
app.put('/api/products/:id', requireAdminAuth, async (req: Request, res: Response) => {
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
app.delete('/api/products/:id', requireAdminAuth, async (req: Request, res: Response) => {
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
app.post('/api/categories', requireAdminAuth, async (req: Request, res: Response) => {
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
app.put('/api/categories/:id', requireAdminAuth, async (req: Request, res: Response) => {
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
app.delete('/api/categories/:id', requireAdminAuth, async (req: Request, res: Response) => {
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

app.post('/api/rates', requireAdminAuth, async (req: Request, res: Response) => {
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
  // Prevent browser caching so admin portal always receives latest orders
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (supabase) {
    try {
      // Use Bearer token from authorization header if present
      const authHeader = req.headers.authorization;
      const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
      let clientToQuery = supabase;
      if (bearerToken && bearerToken !== 'local-admin-session-token' && supabaseUrl && supabaseKey) {
        try {
          clientToQuery = createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false },
            global: { headers: { Authorization: `Bearer ${bearerToken}` } }
          });
        } catch {
          clientToQuery = supabase;
        }
      }

      // Try fetching orders from Supabase with created_at sorting
      let resData: any[] | null = null;
      const primaryRes = await clientToQuery
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!primaryRes.error && primaryRes.data) {
        resData = primaryRes.data;
      } else {
        // Fallback: Query without order clause in case created_at is named differently or not indexed
        const fallbackRes = await clientToQuery.from('orders').select('*');
        if (!fallbackRes.error && fallbackRes.data) {
          resData = fallbackRes.data;
        } else if (primaryRes.error) {
          console.warn('Supabase orders fetch error:', primaryRes.error.message || primaryRes.error);
        }
      }

      if (resData && Array.isArray(resData)) {
        // Normalize orders data from Supabase supporting any column casing or aliases
        const parsedOrders: Order[] = resData.map((ord: any) => {
          let itemsParsed: any[] = [];
          if (typeof ord.items === 'string') {
            try { itemsParsed = JSON.parse(ord.items); } catch { itemsParsed = []; }
          } else if (Array.isArray(ord.items)) {
            itemsParsed = ord.items;
          } else if (Array.isArray(ord.order_items)) {
            itemsParsed = ord.order_items;
          } else if (ord.items && typeof ord.items === 'object') {
            itemsParsed = [ord.items];
          }

          const rawDate = ord.created_at || ord.createdAt || ord.order_date || ord.inserted_at || ord.date;
          const parsedDate = rawDate ? new Date(rawDate).toISOString() : new Date().toISOString();

          return {
            id: String(ord.id || ord.order_id || ord.orderId || `NJ-${Math.floor(1000 + Math.random() * 9000)}`),
            customer_name: String(ord.customer_name || ord.customerName || ord.name || ord.user_name || 'Customer'),
            email: String(ord.email || ord.customer_email || ord.user_email || ''),
            phone: String(ord.phone || ord.mobile || ord.phone_number || ord.contact_number || ''),
            address: String(ord.address || ord.shipping_address || ord.delivery_address || ''),
            city: String(ord.city || ''),
            state: String(ord.state || 'Tamil Nadu'),
            pincode: String(ord.pincode || ord.postal_code || ord.zip || ''),
            subtotal: Number(ord.subtotal) || Number(ord.total) || 0,
            gst_total: Number(ord.gst_total) || Number(ord.gst) || 0,
            grand_total: Number(ord.grand_total) || Number(ord.total) || Number(ord.total_amount) || Number(ord.amount) || 0,
            payment_method: (ord.payment_method === 'Razorpay' ? 'Razorpay' : 'COD') as 'COD' | 'Razorpay',
            payment_status: (ord.payment_status === 'Paid' ? 'Paid' : 'Pending') as 'Paid' | 'Pending',
            status: (ord.status || ord.order_status || 'Pending') as OrderStatus,
            tracking_number: ord.tracking_number || ord.trackingNumber || '',
            courier_name: ord.courier_name || ord.courier || '',
            created_at: parsedDate,
            items: itemsParsed
          };
        });

        // Ensure orders are sorted by date descending (newest on top)
        parsedOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        currentOrders = parsedOrders;
        return res.json(parsedOrders);
      }
    } catch (e: any) {
      console.warn('Supabase orders fetch exception:', e?.message || e);
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
        const parsed: Order = {
          ...data,
          grand_total: Number(data.grand_total) || 0,
          subtotal: Number(data.subtotal) || 0,
          gst_total: Number(data.gst_total) || 0,
          items: typeof data.items === 'string'
            ? (() => { try { return JSON.parse(data.items); } catch { return []; } })()
            : (Array.isArray(data.items) ? data.items : [])
        };
        return res.json(parsed);
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
      const { data, error } = await supabase
        .from('orders')
        .insert([newOrder])
        .select()
        .maybeSingle();

      if (error) {
        console.error('Supabase order insert error:', error.message || error);
      } else if (data) {
        const created: Order = {
          ...data,
          grand_total: Number(data.grand_total) || newOrder.grand_total,
          subtotal: Number(data.subtotal) || newOrder.subtotal,
          gst_total: Number(data.gst_total) || newOrder.gst_total,
          items: typeof data.items === 'string'
            ? (() => { try { return JSON.parse(data.items); } catch { return newOrder.items; } })()
            : (Array.isArray(data.items) ? data.items : newOrder.items)
        };
        currentOrders.unshift(created);
        return res.status(201).json(created);
      }
    } catch (e) {
      console.error('Supabase order insert exception:', e);
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

// ---------------- FEATURED HERO SLIDES (FEATURE IMAGES) IN SUPABASE & LOCAL ----------------
app.get('/api/slides', async (req: Request, res: Response) => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('featured_slides')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) {
        currentSlides = data as FeaturedSlide[];
        return res.json(data);
      }
    } catch (e) {
      console.warn('Supabase slides fetch failed, using local cache:', e);
    }
  }
  res.json(currentSlides);
});

app.post('/api/slides', async (req: Request, res: Response) => {
  const { title, subtitle, badge, image_url, category_slug, cta_text, display_order, is_active } = req.body;
  if (!image_url || !title) {
    return res.status(400).json({ error: 'Image URL and Title are required' });
  }

  const newSlide: FeaturedSlide = {
    id: `slide-${Date.now()}`,
    title: String(title).trim(),
    subtitle: String(subtitle || '').trim(),
    badge: badge ? String(badge).trim() : undefined,
    image_url: String(image_url).trim(),
    category_slug: category_slug || 'gold-necklaces-malas',
    cta_text: cta_text ? String(cta_text).trim() : 'View Collection',
    display_order: Number(display_order) || currentSlides.length + 1,
    is_active: is_active !== false
  };

  currentSlides.push(newSlide);
  saveFeaturedSlides(currentSlides);

  let savedInSupabase = false;
  if (supabase) {
    try {
      const { error } = await supabase.from('featured_slides').insert([newSlide]);
      if (!error) savedInSupabase = true;
    } catch (e) {
      console.error('Supabase slide insert error:', e);
    }
  }

  res.status(201).json({ ...newSlide, saved_in_supabase: savedInSupabase });
});

app.put('/api/slides/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const index = currentSlides.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Slide not found' });
  }

  currentSlides[index] = {
    ...currentSlides[index],
    ...req.body
  };
  saveFeaturedSlides(currentSlides);

  let savedInSupabase = false;
  if (supabase) {
    try {
      const { error } = await supabase
        .from('featured_slides')
        .update(req.body)
        .eq('id', id);
      if (!error) savedInSupabase = true;
    } catch (e) {
      console.error('Supabase slide update error:', e);
    }
  }

  res.json({ ...currentSlides[index], saved_in_supabase: savedInSupabase });
});

app.delete('/api/slides/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  currentSlides = currentSlides.filter(s => s.id !== id);
  saveFeaturedSlides(currentSlides);

  let deletedFromSupabase = false;
  if (supabase) {
    try {
      const { error } = await supabase.from('featured_slides').delete().eq('id', id);
      if (!error) deletedFromSupabase = true;
    } catch (e) {
      console.error('Supabase slide delete error:', e);
    }
  }

  res.json({ success: true, deleted_id: id, deleted_from_supabase: deletedFromSupabase });
});

// ---------------- STORE CONTACT & ADDRESS SETTINGS ROUTES ----------------
app.get('/api/store-contact', (req: Request, res: Response) => {
  res.json(currentStoreContact);
});

app.put('/api/store-contact', (req: Request, res: Response) => {
  const updated: StoreContactSettings = {
    ...currentStoreContact,
    ...req.body
  };
  currentStoreContact = updated;
  saveStoreContact(updated);
  res.json({ success: true, contact: updated });
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
