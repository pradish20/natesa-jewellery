import React, { useState, useEffect } from 'react';
import {
  Lock, KeyRound, Server, Cloud, Database, LayoutDashboard, Package, Folders,
  ShoppingBag, Settings, Plus, Edit, Trash2, CheckCircle2, AlertCircle, RefreshCw, Upload,
  Copy, Check, ShieldCheck, UserCheck, ExternalLink, ArrowRight
} from 'lucide-react';
import { AdminUser, Category, EnvStatus, Order, OrderStatus, Product, RateSettings, SupabaseLiveStatus } from '../types';
import { api } from '../services/api';
import { formatINR } from '../utils/pricing';

interface AdminViewProps {
  products: Product[];
  categories: Category[];
  orders: Order[];
  rates: RateSettings;
  onRefreshData: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  products,
  categories,
  orders,
  rates,
  onRefreshData
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('natesa_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('natesa_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [adminEmail, setAdminEmail] = useState<string>('natesajewellery@gmail.com');
  const [adminPassword, setAdminPassword] = useState<string>('natesa123');
  const [authError, setAuthError] = useState<string>('');
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginMode, setLoginMode] = useState<'credentials' | 'pin'>('credentials');
  const [adminPin, setAdminPin] = useState<string>('');

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'orders' | 'rates' | 'supabase'>('overview');

  // Vercel / Env & Supabase Live Status State
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseLiveStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(false);

  // Supabase Configuration Form
  const [supabaseUrlInput, setSupabaseUrlInput] = useState<string>('');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState<string>('');
  const [supabaseConfigMsg, setSupabaseConfigMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [supabaseSaving, setSupabaseSaving] = useState<boolean>(false);

  // Supabase Sync / Seed State
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [syncResultMsg, setSyncResultMsg] = useState<string>('');

  // Supabase SQL Schema State
  const [sqlSchema, setSqlSchema] = useState<string>('');
  const [sqlCopied, setSqlCopied] = useState<boolean>(false);

  // Admin Credentials Manager Form
  const [newAdminEmail, setNewAdminEmail] = useState<string>('');
  const [newAdminPassword, setNewAdminPassword] = useState<string>('');
  const [newAdminName, setNewAdminName] = useState<string>('Natesa Administrator');
  const [adminSaveMsg, setAdminSaveMsg] = useState<string>('');
  const [adminUsersList, setAdminUsersList] = useState<AdminUser[]>([]);

  // Forms / Modals
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  // Rates Form
  const [rateForm, setRateForm] = useState({
    gold_22k_rate: rates.gold_22k_rate,
    gold_24k_rate: rates.gold_24k_rate,
    silver_925_rate: rates.silver_925_rate
  });
  const [rateSavedMsg, setRateSavedMsg] = useState<string>('');

  // Fetch Status & Supabase Info
  const fetchStatusAndSupabase = async () => {
    setLoadingStatus(true);
    try {
      const [env, supa] = await Promise.all([
        api.getEnvStatus().catch(() => null),
        api.getSupabaseStatus().catch(() => null)
      ]);
      setEnvStatus(env);
      setSupabaseStatus(supa);
      if (supa?.url) {
        setSupabaseUrlInput(supa.url);
      }
    } catch (err) {
      console.error('Failed to query status:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const users = await api.getAdminUsers();
      setAdminUsersList(users);
    } catch (e) {
      console.warn('Could not load admin users:', e);
    }
  };

  const loadSqlSchema = async () => {
    try {
      const sql = await api.getSupabaseSchema();
      setSqlSchema(sql);
    } catch (e) {
      console.warn('Could not load schema:', e);
    }
  };

  useEffect(() => {
    fetchStatusAndSupabase();
    loadSqlSchema();
    if (isAuthenticated) {
      fetchAdminUsers();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setRateForm({
      gold_22k_rate: rates.gold_22k_rate,
      gold_24k_rate: rates.gold_24k_rate,
      silver_925_rate: rates.silver_925_rate
    });
  }, [rates]);

  // Handle Login via Supabase backend
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setAuthError('');

    try {
      const payload = loginMode === 'pin'
        ? { pin: adminPin }
        : { email: adminEmail, password: adminPassword };

      const res = await api.adminLogin(payload);
      if (res.success && res.user) {
        setIsAuthenticated(true);
        setCurrentUser(res.user);
        try {
          localStorage.setItem('natesa_admin_auth', 'true');
          localStorage.setItem('natesa_admin_user', JSON.stringify(res.user));
        } catch {
          // Ignore storage restrictions
        }
      } else {
        setAuthError('Login failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Invalid credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    try {
      localStorage.removeItem('natesa_admin_auth');
      localStorage.removeItem('natesa_admin_user');
    } catch {
      // Ignore
    }
  };

  // Supabase Config Save
  const handleSaveSupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseSaving(true);
    setSupabaseConfigMsg(null);

    try {
      const res = await api.saveSupabaseConfig({
        url: supabaseUrlInput,
        key: supabaseKeyInput
      });
      setSupabaseConfigMsg({ type: 'success', text: res.message || 'Supabase connected successfully!' });
      await fetchStatusAndSupabase();
      onRefreshData();
    } catch (err: any) {
      setSupabaseConfigMsg({ type: 'error', text: err.message || 'Failed to connect to Supabase.' });
    } finally {
      setSupabaseSaving(false);
    }
  };

  // 1-Click Sync Data to Supabase
  const handleSyncToSupabase = async () => {
    setSyncLoading(true);
    setSyncResultMsg('');
    try {
      const res = await api.seedSupabase();
      if (res.success) {
        setSyncResultMsg('All products, categories, rates & admin credentials successfully stored in Supabase!');
        await fetchStatusAndSupabase();
        await fetchAdminUsers();
        onRefreshData();
      } else {
        setSyncResultMsg('Sync failed: ' + (res.error || 'Unknown error. Check SQL tables.'));
      }
    } catch (err: any) {
      setSyncResultMsg('Sync error: ' + err.message);
    } finally {
      setSyncLoading(false);
    }
  };

  // Save new Admin User in Supabase
  const handleSaveAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail || !newAdminPassword) return;

    try {
      const res = await api.saveAdminUser({
        email: newAdminEmail,
        password: newAdminPassword,
        name: newAdminName,
        role: 'admin'
      });
      if (res.success) {
        setAdminSaveMsg(`Admin credentials saved successfully ${res.stored_in_supabase ? 'in Supabase' : 'locally'}!`);
        setNewAdminPassword('');
        await fetchAdminUsers();
        setTimeout(() => setAdminSaveMsg(''), 4000);
      }
    } catch (err: any) {
      setAdminSaveMsg('Error saving admin: ' + err.message);
    }
  };

  // Copy SQL Schema
  const handleCopySql = () => {
    if (navigator.clipboard && sqlSchema) {
      navigator.clipboard.writeText(sqlSchema);
      setSqlCopied(true);
      setTimeout(() => setSqlCopied(false), 3000);
    }
  };

  // Product Submit
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.category_slug) return;

    if (editingProduct.id) {
      await api.updateProduct(editingProduct.id, editingProduct);
    } else {
      await api.createProduct({
        ...editingProduct,
        metal_type: editingProduct.metal_type || '22k_gold',
        net_weight: Number(editingProduct.net_weight) || 10,
        wastage_percent: Number(editingProduct.wastage_percent) || 8.5,
        making_charges: Number(editingProduct.making_charges) || 1000,
        purity_hallmark: editingProduct.purity_hallmark || 'BIS 916 22K Hallmarked',
        image_url: editingProduct.image_url || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
        is_featured: editingProduct.is_featured ?? true,
        in_stock: editingProduct.in_stock ?? true
      });
    }

    setShowProductModal(false);
    setEditingProduct(null);
    onRefreshData();
  };

  // Product Delete
  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await api.deleteProduct(id);
      onRefreshData();
    }
  };

  // Category Submit
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) return;

    if (editingCategory.id) {
      await api.updateCategory(editingCategory.id, editingCategory);
    } else {
      await api.createCategory({
        ...editingCategory,
        banner_image_url: editingCategory.banner_image_url || 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=800&q=80'
      });
    }

    setShowCategoryModal(false);
    setEditingCategory(null);
    onRefreshData();
  };

  // Category Delete
  const handleDeleteCategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      await api.deleteCategory(id);
      onRefreshData();
    }
  };

  // File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'category') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const res = await api.uploadImage(base64);
        if (target === 'product') {
          setEditingProduct((prev) => ({ ...prev, image_url: res.url }));
        } else {
          setEditingCategory((prev) => ({ ...prev, banner_image_url: res.url }));
        }
      } catch (err) {
        console.error('Upload failed:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  // Rates Submit
  const handleSaveRates = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.updateRates(rateForm);
    setRateSavedMsg('Live Gold & Silver rates updated successfully across the store!');
    setTimeout(() => setRateSavedMsg(''), 4000);
    onRefreshData();
  };

  // Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, trackingNumber?: string) => {
    await api.updateOrderStatus(orderId, status, trackingNumber, 'DTDC Express Courier');
    onRefreshData();
  };

  // ---------------- LOGIN SCREEN ----------------
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-3 sm:px-4 py-8 sm:py-16 w-full max-w-full">
        <div className="bg-[#FCF8F1] rounded-2xl border-2 border-[#D4AF37]/50 p-5 sm:p-8 shadow-2xl space-y-5 text-center w-full">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#8F171B] text-[#EBDCC5] flex items-center justify-center mx-auto border-2 border-[#D4AF37]">
            <Lock className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#8F171B] uppercase tracking-widest block">ADMINISTRATOR PORTAL</span>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#292321]">Natesa Jewellery Management</h1>
            <p className="text-xs text-gray-500 font-light mt-1">Authenticate using your Supabase administrative credentials.</p>
          </div>

          {/* Supabase Status Pill on Login */}
          <div className="bg-white/80 border border-[#D4AF37]/40 rounded-xl p-2.5 flex items-center justify-between text-xs text-left">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#8F171B]" />
              <div>
                <span className="font-semibold block text-[#292321]">Supabase Database</span>
                <span className="text-[10px] text-gray-500">
                  {supabaseStatus?.connected
                    ? 'Connected • Storing credentials & catalog'
                    : 'Configurable in settings'}
                </span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              supabaseStatus?.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {supabaseStatus?.connected ? 'Online' : 'Standby'}
            </span>
          </div>

          {/* Toggle between Credentials and Passcode PIN */}
          <div className="flex border border-[#D4AF37]/30 rounded-lg p-0.5 bg-white text-xs font-semibold">
            <button
              type="button"
              onClick={() => setLoginMode('credentials')}
              className={`flex-1 py-1.5 rounded-md transition-all ${loginMode === 'credentials' ? 'bg-[#8F171B] text-white' : 'text-gray-600'}`}
            >
              Email & Password
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('pin')}
              className={`flex-1 py-1.5 rounded-md transition-all ${loginMode === 'pin' ? 'bg-[#8F171B] text-white' : 'text-gray-600'}`}
            >
              Quick Passcode
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            {authError && (
              <div className="bg-red-50 border border-red-200 text-[#8F171B] p-3 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {loginMode === 'credentials' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#292321] uppercase mb-1">Admin Email</label>
                  <input
                    type="email"
                    required
                    placeholder="natesajewellery@gmail.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full bg-white border border-[#D4AF37]/50 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292321] uppercase mb-1">Admin Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-white border border-[#D4AF37]/50 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold font-mono"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    Default admin: <code className="bg-gray-100 px-1 py-0.5 rounded">natesa123</code>
                  </span>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-bold text-[#292321] uppercase mb-1">Passcode / PIN</label>
                <input
                  type="password"
                  required
                  placeholder="Passcode (e.g. natesa123)"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="w-full bg-white border border-[#D4AF37]/50 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold font-mono"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-[#8F171B] text-white hover:bg-[#580E11] py-2.5 sm:py-3 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4 text-[#D4AF37]" />
              )}
              <span>{loginLoading ? 'Verifying with Supabase...' : 'Unlock Admin Console'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---------------- AUTHENTICATED ADMIN DASHBOARD ----------------
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 w-full max-w-full overflow-x-clip">
      
      {/* Admin Header with Supabase Connection Status Pill */}
      <div className="bg-[#292321] text-[#FCF8F1] p-4 sm:p-6 rounded-2xl border-2 border-[#D4AF37]/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-semibold text-[#D4AF37] uppercase tracking-widest block">STORE MANAGEMENT PORTAL</span>
            {currentUser && (
              <span className="bg-[#8F171B] text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
                {currentUser.email}
              </span>
            )}
          </div>
          <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-[#EBDCC5]">Natesa Jewellery Admin</h1>
        </div>

        {/* Live Supabase & Cloudinary Pill */}
        <div className="bg-white/10 border border-[#D4AF37]/30 rounded-xl p-2.5 sm:p-3 flex flex-wrap items-center gap-3 sm:gap-4 text-xs max-w-full">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37] shrink-0" />
            <span>
              Supabase:{' '}
              <strong className={supabaseStatus?.connected ? 'text-emerald-400 font-bold' : 'text-amber-300'}>
                {supabaseStatus?.connected ? 'Live Connected' : 'Local Persistence'}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37] shrink-0" />
            <span>
              Cloudinary:{' '}
              <strong className={envStatus?.cloudinary_configured ? 'text-emerald-400 font-bold' : 'text-amber-300'}>
                {envStatus?.cloudinary_configured ? 'Connected' : 'Local CDN Fallback'}
              </strong>
            </span>
          </div>

          <button
            onClick={fetchStatusAndSupabase}
            disabled={loadingStatus}
            className="p-1 hover:text-[#D4AF37] transition-colors ml-auto cursor-pointer"
            title="Refresh Environment & Supabase Status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleLogout}
            className="text-[11px] text-gray-300 hover:text-white underline ml-2 cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white p-2 rounded-xl border border-[#D4AF37]/40 shadow-2xs flex items-center gap-2 overflow-x-auto text-xs font-semibold w-full max-w-full">
        {[
          { id: 'overview', label: 'Overview Metrics', icon: LayoutDashboard },
          { id: 'products', label: 'Products Manager', icon: Package },
          { id: 'categories', label: 'Categories Manager', icon: Folders },
          { id: 'orders', label: 'Orders & Courier', icon: ShoppingBag },
          { id: 'rates', label: 'Live Rates', icon: Settings },
          { id: 'supabase', label: 'Supabase & Database', icon: Database }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#8F171B] text-white shadow-xs'
                  : 'text-[#292321] hover:bg-[#EBDCC5]/40'
              }`}
            >
              <Icon className="w-4 h-4 text-[#D4AF37]" />
              <span>{tab.label}</span>
              {tab.id === 'supabase' && supabaseStatus?.connected && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#D4AF37]/30 shadow-xs space-y-1 w-full">
              <span className="text-xs font-bold text-[#8F171B] uppercase">Total Products</span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-[#292321]">{products.length}</div>
              <span className="text-[11px] text-gray-500">
                {supabaseStatus?.counts.products !== null && supabaseStatus?.counts.products !== undefined
                  ? `${supabaseStatus.counts.products} stored in Supabase`
                  : 'Active in catalog'}
              </span>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#D4AF37]/30 shadow-xs space-y-1 w-full">
              <span className="text-xs font-bold text-[#8F171B] uppercase">Active Categories</span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-[#292321]">{categories.length}</div>
              <span className="text-[11px] text-gray-500">
                {supabaseStatus?.counts.categories !== null && supabaseStatus?.counts.categories !== undefined
                  ? `${supabaseStatus.counts.categories} stored in Supabase`
                  : 'Gold, Silver & Antiques'}
              </span>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#D4AF37]/30 shadow-xs space-y-1 w-full">
              <span className="text-xs font-bold text-[#8F171B] uppercase">Total Customer Orders</span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-[#292321]">{orders.length}</div>
              <span className="text-[11px] text-gray-500">Pending & Delivered</span>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#D4AF37]/30 shadow-xs space-y-1 w-full">
              <span className="text-xs font-bold text-[#8F171B] uppercase">Live 22K Gold Rate</span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-[#8F171B]">{formatINR(rates.gold_22k_rate)}/g</div>
              <span className="text-[11px] text-gray-500">Storewide calculation benchmark</span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#D4AF37]/40 shadow-xs space-y-4 w-full">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#292321]">Recent Customer Orders</h3>
            <div className="overflow-x-auto text-xs w-full">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-[#FCF8F1] text-[#8F171B] font-bold uppercase border-b border-[#D4AF37]/30">
                    <th className="p-2.5">Order ID</th>
                    <th className="p-2.5">Customer</th>
                    <th className="p-2.5">Phone</th>
                    <th className="p-2.5">Grand Total</th>
                    <th className="p-2.5">Payment</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {orders.slice(0, 5).map((ord) => (
                    <tr key={ord.id}>
                      <td className="p-2.5 font-bold text-[#8F171B]">{ord.id}</td>
                      <td className="p-2.5 font-sans font-semibold">{ord.customer_name}</td>
                      <td className="p-2.5">{ord.phone}</td>
                      <td className="p-2.5 font-bold">{formatINR(ord.grand_total)}</td>
                      <td className="p-2.5">{ord.payment_method} ({ord.payment_status})</td>
                      <td className="p-2.5 font-bold text-[#8F171B]">{ord.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGER */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-in fade-in duration-200 w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-[#D4AF37]/40">
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#292321]">Products Manager</h3>
              <p className="text-xs text-gray-500">
                {supabaseStatus?.connected
                  ? 'All changes are instantly synchronized with Supabase'
                  : 'Products saved locally and ready to sync to Supabase'}
              </p>
            </div>
            <button
              onClick={() => {
                setEditingProduct({});
                setShowProductModal(true);
              }}
              className="bg-[#8F171B] text-white hover:bg-[#580E11] px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" /> Add Product
            </button>
          </div>

          <div className="bg-white rounded-xl border border-[#D4AF37]/30 shadow-xs overflow-hidden w-full">
            <div className="overflow-x-auto text-xs w-full">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#FCF8F1] text-[#8F171B] font-bold uppercase border-b border-[#D4AF37]/30">
                    <th className="p-3">Product</th>
                    <th className="p-3">Metal / Purity</th>
                    <th className="p-3">Weight</th>
                    <th className="p-3">Wastage %</th>
                    <th className="p-3">Making (₹)</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-3 flex items-center gap-3">
                        <img src={p.image_url} alt={p.name} className="w-10 h-10 object-cover rounded-md border" />
                        <div>
                          <span className="font-bold text-[#292321] block">{p.name}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{p.id}</span>
                        </div>
                      </td>
                      <td className="p-3 uppercase font-semibold text-[11px] text-[#8F171B]">{p.metal_type}</td>
                      <td className="p-3 font-mono font-bold">{p.net_weight}g</td>
                      <td className="p-3 font-mono">{p.wastage_percent}%</td>
                      <td className="p-3 font-mono">₹{p.making_charges}</td>
                      <td className="p-3 text-gray-600">{p.category_slug}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setShowProductModal(true);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES MANAGER */}
      {activeTab === 'categories' && (
        <div className="space-y-6 animate-in fade-in duration-200 w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-[#D4AF37]/40">
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#292321]">Categories Manager</h3>
              <p className="text-xs text-gray-500">Categories stored in Supabase with banner images and URLs.</p>
            </div>
            <button
              onClick={() => {
                setEditingCategory({});
                setShowCategoryModal(true);
              }}
              className="bg-[#8F171B] text-white hover:bg-[#580E11] px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" /> Add Category
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white rounded-xl border border-[#D4AF37]/30 overflow-hidden shadow-xs space-y-2">
                <img src={cat.banner_image_url} alt={cat.name} className="w-full h-32 object-cover" />
                <div className="p-3.5 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-[#292321]">{cat.name}</h4>
                      <span className="text-[10px] text-[#8F171B] font-mono">{cat.slug}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setShowCategoryModal(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{cat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS & COURIER */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in duration-200 w-full">
          <div className="bg-white p-4 rounded-xl border border-[#D4AF37]/40">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#292321]">Customer Orders & Tracking</h3>
            <p className="text-xs text-gray-500">Update order fulfillment status and assign courier tracking numbers.</p>
          </div>

          <div className="space-y-4">
            {orders.map((ord) => (
              <div key={ord.id} className="bg-white rounded-xl border border-[#D4AF37]/30 p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
                  <div>
                    <span className="font-mono font-bold text-[#8F171B] text-sm">{ord.id}</span>
                    <span className="text-xs text-gray-500 ml-2">by {ord.customer_name} • {ord.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-600">Total: {formatINR(ord.grand_total)}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ord.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ord.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-gray-500 block">Shipping Address:</span>
                    <span className="font-medium text-gray-800">{ord.address}, {ord.city}, {ord.state} - {ord.pincode}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={ord.status}
                      onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus, ord.tracking_number)}
                      className="bg-[#FCF8F1] border border-[#D4AF37] rounded-lg px-2.5 py-1 font-semibold text-xs text-[#8F171B]"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Tracking Number"
                      defaultValue={ord.tracking_number || ''}
                      onBlur={(e) => handleUpdateOrderStatus(ord.id, ord.status, e.target.value)}
                      className="bg-white border rounded px-2 py-1 font-mono text-xs w-32"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: LIVE RATES */}
      {activeTab === 'rates' && (
        <div className="space-y-6 animate-in fade-in duration-200 w-full max-w-2xl">
          <div className="bg-white p-5 rounded-2xl border border-[#D4AF37]/40 shadow-xs space-y-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#292321]">Update Live Metal Rates</h3>
              <p className="text-xs text-gray-500">Updating rates recalculates storewide prices instantly across all jewelry.</p>
            </div>

            {rateSavedMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{rateSavedMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveRates} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-gray-700 uppercase mb-1">22K Gold Rate (₹ / Gram)</label>
                <input
                  type="number"
                  required
                  value={rateForm.gold_22k_rate}
                  onChange={(e) => setRateForm({ ...rateForm, gold_22k_rate: Number(e.target.value) })}
                  className="w-full bg-[#FCF8F1] border border-[#D4AF37]/60 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-[#8F171B]"
                />
              </div>

              <div>
                <label className="block text-gray-700 uppercase mb-1">24K Gold Rate (₹ / Gram)</label>
                <input
                  type="number"
                  required
                  value={rateForm.gold_24k_rate}
                  onChange={(e) => setRateForm({ ...rateForm, gold_24k_rate: Number(e.target.value) })}
                  className="w-full bg-[#FCF8F1] border border-[#D4AF37]/60 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-[#8F171B]"
                />
              </div>

              <div>
                <label className="block text-gray-700 uppercase mb-1">92.5 Sterling Silver Rate (₹ / Gram)</label>
                <input
                  type="number"
                  required
                  value={rateForm.silver_925_rate}
                  onChange={(e) => setRateForm({ ...rateForm, silver_925_rate: Number(e.target.value) })}
                  className="w-full bg-[#FCF8F1] border border-[#D4AF37]/60 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-[#8F171B]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#8F171B] text-white hover:bg-[#580E11] py-2.5 rounded-xl font-bold transition-all shadow-xs cursor-pointer"
              >
                Save & Recalculate Store Prices
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 6: SUPABASE & DATABASE CONFIGURATION */}
      {activeTab === 'supabase' && (
        <div className="space-y-6 animate-in fade-in duration-200 w-full">
          
          {/* Live Supabase Connection Banner */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-[#D4AF37]/50 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#D4AF37]/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#8F171B] text-[#D4AF37] flex items-center justify-center font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#292321]">
                    Supabase Database Integration
                  </h3>
                  <p className="text-xs text-gray-500">
                    Stores and persists admin credentials, catalog products, and categories in your Supabase project.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                  supabaseStatus?.connected
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${supabaseStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                  {supabaseStatus?.connected ? 'Connected to Supabase' : 'Standby / Local Fallback'}
                </span>

                <button
                  onClick={fetchStatusAndSupabase}
                  disabled={loadingStatus}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin' : ''}`} />
                  <span>Test Connection</span>
                </button>
              </div>
            </div>

            {/* Live Table Counters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#FCF8F1] border border-[#D4AF37]/40 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold text-[#8F171B] uppercase block">Admin Credentials</span>
                <span className="text-xl font-bold font-mono text-[#292321]">
                  {supabaseStatus?.counts.admin_users !== null ? `${supabaseStatus?.counts.admin_users} in Supabase` : 'Local'}
                </span>
                <span className="text-[10px] text-gray-500 block">table: admin_users</span>
              </div>

              <div className="bg-[#FCF8F1] border border-[#D4AF37]/40 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold text-[#8F171B] uppercase block">Products</span>
                <span className="text-xl font-bold font-mono text-[#292321]">
                  {supabaseStatus?.counts.products !== null ? `${supabaseStatus?.counts.products} in Supabase` : `${products.length} Local`}
                </span>
                <span className="text-[10px] text-gray-500 block">table: products</span>
              </div>

              <div className="bg-[#FCF8F1] border border-[#D4AF37]/40 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold text-[#8F171B] uppercase block">Categories</span>
                <span className="text-xl font-bold font-mono text-[#292321]">
                  {supabaseStatus?.counts.categories !== null ? `${supabaseStatus?.counts.categories} in Supabase` : `${categories.length} Local`}
                </span>
                <span className="text-[10px] text-gray-500 block">table: categories</span>
              </div>

              <div className="bg-[#FCF8F1] border border-[#D4AF37]/40 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold text-[#8F171B] uppercase block">Gold & Silver Rates</span>
                <span className="text-xl font-bold font-mono text-[#292321]">
                  {supabaseStatus?.counts.rates ? 'Synced' : 'Default'}
                </span>
                <span className="text-[10px] text-gray-500 block">table: rates</span>
              </div>
            </div>

            {/* 1-Click Sync Data Button */}
            <div className="bg-gradient-to-r from-[#8F171B]/5 to-[#D4AF37]/10 border border-[#D4AF37]/40 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h4 className="font-serif font-bold text-[#8F171B] text-sm sm:text-base">
                  1-Click Seed Store Data to Supabase
                </h4>
                <p className="text-xs text-gray-600">
                  Transfers default admin credentials, all 9 initial jewelry items, 5 categories, and rates into your Supabase database.
                </p>
              </div>

              <button
                onClick={handleSyncToSupabase}
                disabled={syncLoading || !supabaseStatus?.configured}
                className="bg-[#8F171B] hover:bg-[#580E11] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                {syncLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
                ) : (
                  <Upload className="w-4 h-4 text-[#D4AF37]" />
                )}
                <span>{syncLoading ? 'Syncing to Supabase...' : 'Sync All Data to Supabase'}</span>
              </button>
            </div>

            {syncResultMsg && (
              <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                syncResultMsg.includes('failed') || syncResultMsg.includes('error')
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{syncResultMsg}</span>
              </div>
            )}
          </div>

          {/* Vercel Deployment & Environment Variables Guide */}
          <div className="bg-gradient-to-br from-[#292321] to-[#421114] text-[#FCF8F1] p-5 sm:p-6 rounded-2xl border-2 border-[#D4AF37]/50 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#D4AF37]/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs border border-white/20">
                  ▲
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#EBDCC5]">
                    Vercel Environment Variables Setup
                  </h4>
                  <p className="text-xs text-gray-300">
                    Add these variables to your Vercel Project Dashboard (Settings → Environment Variables) to connect Supabase automatically on deploy.
                  </p>
                </div>
              </div>

              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                envStatus?.env_vars.SUPABASE_URL && envStatus?.env_vars.SUPABASE_ANON_KEY
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                  : 'bg-white/10 text-amber-300 border-amber-400/40'
              }`}>
                {envStatus?.env_vars.SUPABASE_URL && envStatus?.env_vars.SUPABASE_ANON_KEY
                  ? '✓ Active in Vercel Environment'
                  : 'Waiting for Vercel Deployment'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-[#EBDCC5] text-sm">SUPABASE_URL</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('SUPABASE_URL');
                      alert('Copied "SUPABASE_URL" to clipboard!');
                    }}
                    className="text-[10px] bg-white/10 hover:bg-white/20 text-[#D4AF37] px-2 py-0.5 rounded cursor-pointer transition-colors"
                  >
                    Copy Key Name
                  </button>
                </div>
                <p className="text-[11px] text-gray-300">
                  Your project URL from Supabase Project Settings → API (e.g. <code className="text-[#D4AF37]">https://xyz.supabase.co</code>).
                </p>
                <div className="text-[10px] text-gray-400">
                  Detected in environment: <strong className={envStatus?.env_vars.SUPABASE_URL ? 'text-emerald-400' : 'text-gray-400'}>
                    {envStatus?.env_vars.SUPABASE_URL ? 'YES' : 'Not yet set'}
                  </strong>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-[#EBDCC5] text-sm">SUPABASE_ANON_KEY</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('SUPABASE_ANON_KEY');
                      alert('Copied "SUPABASE_ANON_KEY" to clipboard!');
                    }}
                    className="text-[10px] bg-white/10 hover:bg-white/20 text-[#D4AF37] px-2 py-0.5 rounded cursor-pointer transition-colors"
                  >
                    Copy Key Name
                  </button>
                </div>
                <p className="text-[11px] text-gray-300">
                  Your public API key from Supabase Project Settings → API (starts with <code className="text-[#D4AF37]">eyJ...</code>).
                </p>
                <div className="text-[10px] text-gray-400">
                  Detected in environment: <strong className={envStatus?.env_vars.SUPABASE_ANON_KEY ? 'text-emerald-400' : 'text-gray-400'}>
                    {envStatus?.env_vars.SUPABASE_ANON_KEY ? 'YES' : 'Not yet set'}
                  </strong>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-gray-300 bg-white/5 p-3 rounded-lg border border-white/10 flex items-center justify-between">
              <span>
                💡 <strong>Deploy Tip:</strong> The app includes <code className="text-[#D4AF37]">vercel.json</code> and serverless API handlers. Once you set the environment variables in Vercel and redeploy, your admin credentials, products, and categories will automatically persist to Supabase!
              </span>
              <a
                href="https://vercel.com/docs/projects/environment-variables"
                target="_blank"
                rel="noreferrer"
                className="text-[#D4AF37] hover:underline font-bold text-xs shrink-0 ml-3 flex items-center gap-1"
              >
                Vercel Docs <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Supabase Connection Credentials Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            <div className="bg-white p-5 rounded-2xl border border-[#D4AF37]/40 shadow-xs space-y-4">
              <div className="border-b pb-3">
                <h4 className="font-serif text-lg font-bold text-[#292321]">Quick Test Connection</h4>
                <p className="text-xs text-gray-500">
                  Test your credentials or connect directly in this preview session:
                </p>
              </div>

              {supabaseConfigMsg && (
                <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  supabaseConfigMsg.type === 'error'
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{supabaseConfigMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveSupabaseConfig} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-[#292321] uppercase mb-1">
                    Supabase Project URL *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://xyzcompany.supabase.co"
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    className="w-full bg-[#FCF8F1] border border-[#D4AF37]/50 rounded-xl px-3 py-2 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#292321] uppercase mb-1">
                    Supabase Anon / Service Role Key *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    value={supabaseKeyInput}
                    onChange={(e) => setSupabaseKeyInput(e.target.value)}
                    className="w-full bg-[#FCF8F1] border border-[#D4AF37]/50 rounded-xl px-3 py-2 font-mono text-xs"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    Use either the <code className="bg-gray-100 px-1 py-0.5 rounded">anon public</code> key or <code className="bg-gray-100 px-1 py-0.5 rounded">service_role</code> key.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={supabaseSaving}
                  className="w-full bg-[#8F171B] text-white hover:bg-[#580E11] py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {supabaseSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                  )}
                  <span>{supabaseSaving ? 'Connecting & Verifying...' : 'Save & Connect Supabase'}</span>
                </button>
              </form>
            </div>

            {/* Admin Credentials Manager in Supabase */}
            <div className="bg-white p-5 rounded-2xl border border-[#D4AF37]/40 shadow-xs space-y-4">
              <div className="border-b pb-3">
                <h4 className="font-serif text-lg font-bold text-[#292321]">Admin Credentials in Supabase</h4>
                <p className="text-xs text-gray-500">
                  Create or update the administrator login credentials stored in the Supabase <code className="bg-gray-100 px-1 rounded font-mono">admin_users</code> table.
                </p>
              </div>

              {adminSaveMsg && (
                <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  adminSaveMsg.includes('Error')
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{adminSaveMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveAdminUser} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-[#292321] uppercase mb-1">Admin Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="natesajewellery@gmail.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="w-full bg-[#FCF8F1] border border-[#D4AF37]/50 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#292321] uppercase mb-1">Admin Full Name</label>
                  <input
                    type="text"
                    placeholder="Natesa Administrator"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    className="w-full bg-[#FCF8F1] border border-[#D4AF37]/50 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#292321] uppercase mb-1">New Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter secure password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="w-full bg-[#FCF8F1] border border-[#D4AF37]/50 rounded-xl px-3 py-2 font-mono text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#292321] text-[#EBDCC5] hover:bg-black py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>Save Admin Credentials to Supabase</span>
                </button>
              </form>

              {/* Existing Admin Users List */}
              {adminUsersList.length > 0 && (
                <div className="pt-2 border-t space-y-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Registered Administrators</span>
                  <div className="space-y-1">
                    {adminUsersList.map((u) => (
                      <div key={u.id} className="flex justify-between items-center bg-[#FCF8F1] p-2 rounded-lg text-xs">
                        <div>
                          <span className="font-bold text-[#292321] block">{u.name}</span>
                          <span className="text-[10px] text-gray-500">{u.email}</span>
                        </div>
                        <span className="text-[10px] bg-[#8F171B] text-white px-2 py-0.5 rounded-md font-mono">
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SQL Schema Copy Box */}
          <div className="bg-white p-5 rounded-2xl border border-[#D4AF37]/40 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
              <div>
                <h4 className="font-serif text-lg font-bold text-[#292321]">Supabase SQL Schema</h4>
                <p className="text-xs text-gray-500">
                  Run this SQL in your Supabase SQL Editor if you prefer creating the tables manually.
                </p>
              </div>

              <button
                onClick={handleCopySql}
                className="bg-[#FCF8F1] hover:bg-[#EBDCC5]/60 border border-[#D4AF37] text-[#8F171B] px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {sqlCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{sqlCopied ? 'SQL Copied!' : 'Copy SQL Schema'}</span>
              </button>
            </div>

            <pre className="bg-[#292321] text-[#EBDCC5] p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-60 leading-relaxed border border-[#D4AF37]/30">
              {sqlSchema || 'Loading SQL schema...'}
            </pre>
          </div>

        </div>
      )}

      {/* PRODUCT MODAL */}
      {showProductModal && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#FCF8F1] rounded-2xl border-2 border-[#D4AF37]/60 max-w-lg w-full p-4 sm:p-6 space-y-4 my-8">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#8F171B]">
              {editingProduct.id ? 'Edit Product' : 'Add New Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#292321] uppercase mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-white border rounded px-3 py-2 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase mb-1">Category *</label>
                  <select
                    value={editingProduct.category_slug || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category_slug: e.target.value })}
                    className="w-full bg-white border rounded px-3 py-2 font-semibold"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">Metal Type *</label>
                  <select
                    value={editingProduct.metal_type || '22k_gold'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, metal_type: e.target.value as any })}
                    className="w-full bg-white border rounded px-3 py-2 font-semibold"
                  >
                    <option value="22k_gold">22K Gold</option>
                    <option value="24k_gold">24K Gold</option>
                    <option value="925_silver">92.5 Sterling Silver</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase mb-1">Net Weight (g) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.net_weight ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, net_weight: Number(e.target.value) })}
                    className="w-full bg-white border rounded px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">Wastage % *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editingProduct.wastage_percent ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, wastage_percent: Number(e.target.value) })}
                    className="w-full bg-white border rounded px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">Making Charges (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.making_charges ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, making_charges: Number(e.target.value) })}
                    className="w-full bg-white border rounded px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-white border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Image URL or File Upload</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={editingProduct.image_url || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                  className="w-full bg-white border rounded px-3 py-2 font-mono text-xs mb-1"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'product')}
                  className="text-xs"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#8F171B] text-white py-2 rounded font-bold cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {showCategoryModal && editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-[#FCF8F1] rounded-2xl border-2 border-[#D4AF37]/60 max-w-md w-full p-4 sm:p-6 space-y-4">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#8F171B]">
              {editingCategory.id ? 'Edit Category' : 'Add New Category'}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#292321] uppercase mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full bg-white border rounded px-3 py-2 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Slug *</label>
                <input
                  type="text"
                  placeholder="e.g. gold-necklaces-malas"
                  value={editingCategory.slug || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  className="w-full bg-white border rounded px-3 py-2 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full bg-white border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Banner Image URL or Upload</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={editingCategory.banner_image_url || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, banner_image_url: e.target.value })}
                  className="w-full bg-white border rounded px-3 py-2 font-mono text-xs mb-1"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'category')}
                  className="text-xs"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#8F171B] text-white py-2 rounded font-bold cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
