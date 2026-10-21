import React, { useState, useEffect } from 'react';
import {
  Lock, KeyRound, Server, Cloud, Database, LayoutDashboard, Package, Folders,
  ShoppingBag, Settings, Plus, Edit, Trash2, CheckCircle2, AlertCircle, RefreshCw, Upload,
  Copy, Check, ShieldCheck, UserCheck, ExternalLink, ArrowRight, Image as ImageIcon, Sparkles, Link2,
  MapPin, Phone, Eye, EyeOff, Clock, HelpCircle, Info, X, ChevronDown, ChevronUp, CreditCard, Truck
} from 'lucide-react';
import {
  AdminUser, Category, CloudinaryConfig, CloudinaryLiveStatus, EnvStatus,
  FeaturedSlide, Order, OrderStatus, Product, RateSettings, StoreContactSettings, SupabaseLiveStatus
} from '../types';
import { api } from '../services/api';
import { formatINR, getProductPrice } from '../utils/pricing';
import { INITIAL_FEATURED_SLIDES, INITIAL_STORE_CONTACT } from '../data/initialData';

interface AdminViewProps {
  products: Product[];
  categories: Category[];
  orders: Order[];
  rates: RateSettings;
  slides?: FeaturedSlide[];
  storeContact?: StoreContactSettings;
  onRefreshData: () => void;
  onExitAdmin?: () => void;
  onNavigateToResetPassword?: () => void;
}

// ---------------- EMBEDDED ADMIN FOOTER PASSWORD RESET ----------------
const AdminFooterPasswordReset: React.FC<{ defaultEmail?: string }> = ({ defaultEmail = 'natesajewellery@gmail.com' }) => {
  const [resetEmail, setResetEmail] = useState<string>(defaultEmail);
  const [newPass, setNewPass] = useState<string>('');
  const [confirmPass, setConfirmPass] = useState<string>('');
  const [showPass, setShowPass] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    const cleanEmail = resetEmail.trim();
    const cleanNewPass = newPass.trim();

    if (!cleanEmail) {
      setMsg({ type: 'error', text: 'Please enter the registered admin email address.' });
      return;
    }

    if (!cleanNewPass || cleanNewPass.length < 6) {
      setMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (cleanNewPass !== confirmPass.trim()) {
      setMsg({ type: 'error', text: 'Passwords do not match. Please re-type your new password.' });
      return;
    }

    setLoading(true);

    try {
      const res = await api.adminUpdatePassword({
        email: cleanEmail,
        newPassword: cleanNewPass
      });

      setMsg({
        type: 'success',
        text: res.message || 'Password updated successfully! Credentials automatically saved to Supabase admin_users table.'
      });
      setNewPass('');
      setConfirmPass('');
    } catch (err: any) {
      setMsg({
        type: 'error',
        text: err.message || 'Failed to update password. Password reset is strictly restricted to registered admin accounts.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t-2 border-[#D4AF37]/30 bg-[#292321] text-[#FCF8F1] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D4AF37]/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#8F171B] text-[#D4AF37] rounded-xl shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#EBDCC5]">
              Admin Password Reset & Supabase Table Sync
            </h3>
            <p className="text-xs text-gray-400">
              Only accessible in the Admin Page. Updating your password automatically syncs your credentials to the Supabase <code className="text-[#D4AF37] bg-black/40 px-1.5 py-0.5 rounded font-mono">admin_users</code> table.
            </p>
          </div>
        </div>
        <span className="text-[10px] uppercase font-mono font-semibold text-[#D4AF37] bg-white/10 px-2.5 py-1 rounded-full border border-[#D4AF37]/30 self-start sm:self-auto">
          Admin Page Only
        </span>
      </div>

      {msg && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5 ${
          msg.type === 'success' 
            ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/40' 
            : 'bg-rose-950/80 text-rose-200 border border-rose-500/40'
        }`}>
          {msg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
        <div className="sm:col-span-4">
          <label className="block text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider mb-1">
            Admin Email Address
          </label>
          <input
            type="email"
            required
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            placeholder="natesajewellery@gmail.com"
            className="w-full bg-white/10 border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-hidden focus:border-[#D4AF37]"
          />
        </div>

        <div className="sm:col-span-3">
          <label className="block text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider mb-1">
            New Admin Password
          </label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              required
              minLength={6}
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/10 border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-gray-500 focus:outline-hidden focus:border-[#D4AF37] pr-8"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
            >
              {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="sm:col-span-3">
          <label className="block text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider mb-1">
            Confirm Password
          </label>
          <input
            type={showPass ? 'text' : 'password'}
            required
            minLength={6}
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-white/10 border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-gray-500 focus:outline-hidden focus:border-[#D4AF37]"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8F171B] hover:bg-[#580E11] text-white py-2 px-3 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 h-[38px] whitespace-nowrap"
          >
            {loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
            ) : (
              <KeyRound className="w-3.5 h-3.5 text-[#D4AF37]" />
            )}
            <span>{loading ? 'Saving...' : 'Update Password'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export const AdminView: React.FC<AdminViewProps> = ({
  products,
  categories,
  orders,
  rates,
  slides,
  storeContact,
  onRefreshData,
  onExitAdmin,
  onNavigateToResetPassword
}) => {
  // Authentication State (Session-only: ends automatically when admin page is exited)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('natesa_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    try {
      const saved = sessionStorage.getItem('natesa_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Automatically end session when admin portal is exited or unmounted
  useEffect(() => {
    const endSession = () => {
      try {
        sessionStorage.removeItem('natesa_admin_auth');
        sessionStorage.removeItem('natesa_admin_token');
        sessionStorage.removeItem('natesa_admin_user');
        localStorage.removeItem('natesa_admin_auth');
        localStorage.removeItem('natesa_admin_token');
        localStorage.removeItem('natesa_admin_user');
      } catch {
        // Ignore storage errors
      }
    };

    window.addEventListener('beforeunload', endSession);
    window.addEventListener('pagehide', endSession);

    return () => {
      endSession();
      window.removeEventListener('beforeunload', endSession);
      window.removeEventListener('pagehide', endSession);
    };
  }, []);

  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [showConnectSupabaseModal, setShowConnectSupabaseModal] = useState<boolean>(false);
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotMsg, setForgotMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [forgotLoading, setForgotLoading] = useState<boolean>(false);
  const [showSetupGuide, setShowSetupGuide] = useState<boolean>(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'slides' | 'store_contact' | 'contact' | 'orders' | 'rates' | 'supabase' | 'cloudinary' | 'password-reset'>('overview');

  // Featured Slides State
  const [slidesList, setSlidesList] = useState<FeaturedSlide[]>(slides || INITIAL_FEATURED_SLIDES);
  const [showSlideModal, setShowSlideModal] = useState<boolean>(false);
  const [editingSlide, setEditingSlide] = useState<Partial<FeaturedSlide> | null>(null);
  const [slideSaving, setSlideSaving] = useState<boolean>(false);
  const [slideSaveMsg, setSlideSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [slideImageUploadLoading, setSlideImageUploadLoading] = useState<boolean>(false);

  // Store Contact & Address State
  const [contactForm, setContactForm] = useState<StoreContactSettings>(storeContact || INITIAL_STORE_CONTACT);
  const [contactSaving, setContactSaving] = useState<boolean>(false);
  const [contactSaveMsg, setContactSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Orders State & Auto-Sync
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [refreshingOrders, setRefreshingOrders] = useState<boolean>(false);
  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, string>>({});
  const [savingTrackingId, setSavingTrackingId] = useState<string | null>(null);

  // Manual Order Creation Modal State
  const [showCreateOrderModal, setShowCreateOrderModal] = useState<boolean>(false);
  const [orderSaving, setOrderSaving] = useState<boolean>(false);
  const [orderSaveMsg, setOrderSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  const [newOrderForm, setNewOrderForm] = useState({
    customer_name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Krishnagiri',
    state: 'Tamil Nadu',
    pincode: '635001',
    product_id: '',
    quantity: 1,
    payment_method: 'COD' as 'COD' | 'Razorpay',
    payment_status: 'Pending' as 'Pending' | 'Paid'
  });

  // Auto-sync orders & store updates from Supabase while logged into admin
  useEffect(() => {
    if (!isAuthenticated) return;
    onRefreshData();
    const intervalTime = activeTab === 'orders' ? 6000 : 12000;
    const timer = setInterval(() => {
      onRefreshData();
    }, intervalTime);
    return () => clearInterval(timer);
  }, [isAuthenticated, activeTab, onRefreshData]);

  // Sync state if props change or on initial mount
  useEffect(() => {
    if (slides && slides.length > 0) {
      setSlidesList(slides);
    }
  }, [slides]);

  useEffect(() => {
    if (storeContact) {
      setContactForm(storeContact);
    }
  }, [storeContact]);

  useEffect(() => {
    api.getSlides().then((res) => {
      if (res && res.length > 0) setSlidesList(res);
    }).catch(() => {});

    api.getStoreContact().then((res) => {
      if (res) setContactForm(res);
    }).catch(() => {});
  }, []);

  // Vercel / Env & Supabase Live Status State
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseLiveStatus | null>(null);
  const [cloudinaryStatus, setCloudinaryStatus] = useState<CloudinaryLiveStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(false);

  // Cloudinary Configuration Form State
  const [cloudinaryNameInput, setCloudinaryNameInput] = useState<string>('');
  const [cloudinaryKeyInput, setCloudinaryKeyInput] = useState<string>('');
  const [cloudinarySecretInput, setCloudinarySecretInput] = useState<string>('');
  const [cloudinaryConfigMsg, setCloudinaryConfigMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [cloudinarySaving, setCloudinarySaving] = useState<boolean>(false);
  const [testUploadLoading, setTestUploadLoading] = useState<boolean>(false);
  const [testUploadResult, setTestUploadResult] = useState<{ url: string; cloud_name?: string } | null>(null);
  const [testUploadError, setTestUploadError] = useState<string>('');
  const [copiedVarName, setCopiedVarName] = useState<string>('');
  const [imageUploadLoading, setImageUploadLoading] = useState<boolean>(false);

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
  const [productSaving, setProductSaving] = useState<boolean>(false);
  const [productSaveMsg, setProductSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [categorySaving, setCategorySaving] = useState<boolean>(false);
  const [categorySaveMsg, setCategorySaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      const [env, supa, cloud] = await Promise.all([
        api.getEnvStatus().catch(() => null),
        api.getSupabaseStatus().catch(() => null),
        api.getCloudinaryStatus().catch(() => null)
      ]);
      setEnvStatus(env);
      setSupabaseStatus(supa);
      setCloudinaryStatus(cloud);
      if (supa?.url) {
        setSupabaseUrlInput(supa.url);
      }
      if (cloud?.cloud_name) {
        setCloudinaryNameInput(cloud.cloud_name);
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

  const fetchSlides = async () => {
    try {
      const data = await api.getSlides();
      if (data && data.length > 0) setSlidesList(data);
    } catch (e) {
      console.warn('Could not load slides:', e);
    }
  };

  const fetchStoreContact = async () => {
    try {
      const data = await api.getStoreContact();
      if (data) setContactForm(data);
    } catch (e) {
      console.warn('Could not load contact info:', e);
    }
  };

  useEffect(() => {
    fetchStatusAndSupabase();
    loadSqlSchema();
    fetchSlides();
    fetchStoreContact();
    if (isAuthenticated) {
      fetchAdminUsers();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (slides && slides.length > 0) setSlidesList(slides);
  }, [slides]);

  useEffect(() => {
    if (storeContact) setContactForm(storeContact);
  }, [storeContact]);

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
    if (!adminEmail.trim() || !adminPassword.trim()) {
      setAuthError('Please enter both admin email and password.');
      return;
    }

    setLoginLoading(true);
    setAuthError('');

    try {
      const res = await api.adminLogin({
        email: adminEmail.trim(),
        password: adminPassword.trim()
      });
      if (res.success && res.user) {
        setIsAuthenticated(true);
        setCurrentUser(res.user);
        try {
          sessionStorage.setItem('natesa_admin_auth', 'true');
          sessionStorage.setItem('natesa_admin_token', res.token || 'local-admin-session-token');
          sessionStorage.setItem('natesa_admin_user', JSON.stringify(res.user));
          localStorage.removeItem('natesa_admin_auth');
          localStorage.removeItem('natesa_admin_token');
          localStorage.removeItem('natesa_admin_user');
        } catch {
          // Ignore storage restrictions
        }
        onRefreshData();
      } else {
        setAuthError('Login failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Invalid credentials.');
    } finally {
      setLoginLoading(false);
    }
  };



  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotMsg({ type: 'error', text: 'Please enter your admin email.' });
      return;
    }
    setForgotLoading(true);
    setForgotMsg(null);
    try {
      const res = await api.forgotPassword(forgotEmail.trim());
      setForgotMsg({ type: 'success', text: res.message || 'Password reset link sent! Please check your email.' });
    } catch (err: any) {
      setForgotMsg({ type: 'error', text: err.message || 'Failed to dispatch reset email.' });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleQuickConnectSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrlInput.trim() || !supabaseKeyInput.trim()) {
      setSupabaseConfigMsg({ type: 'error', text: 'Please enter both Supabase URL and Key.' });
      return;
    }
    setSupabaseSaving(true);
    setSupabaseConfigMsg(null);
    try {
      const res = await api.saveSupabaseConfig({
        url: supabaseUrlInput.trim(),
        key: supabaseKeyInput.trim()
      });
      setSupabaseConfigMsg({ type: 'success', text: res.message || 'Supabase successfully connected!' });
      await fetchStatusAndSupabase();
      setTimeout(() => setShowConnectSupabaseModal(false), 1200);
    } catch (err: any) {
      setSupabaseConfigMsg({ type: 'error', text: err.message || 'Connection failed.' });
    } finally {
      setSupabaseSaving(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAdminEmail('');
    setAdminPassword('');
    try {
      sessionStorage.removeItem('natesa_admin_auth');
      sessionStorage.removeItem('natesa_admin_token');
      sessionStorage.removeItem('natesa_admin_user');
      localStorage.removeItem('natesa_admin_auth');
      localStorage.removeItem('natesa_admin_token');
      localStorage.removeItem('natesa_admin_user');
    } catch {
      // Ignore
    }
    if (onExitAdmin) {
      onExitAdmin();
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

  // Featured Slides Handlers
  const handleOpenAddSlide = () => {
    setEditingSlide({
      title: '',
      subtitle: '',
      badge: 'Heritage Collection',
      image_url: '',
      category_slug: categories[0]?.slug || 'gold-necklaces-malas',
      cta_text: 'Explore Collection',
      display_order: slidesList.length + 1,
      is_active: true
    });
    setSlideSaveMsg(null);
    setShowSlideModal(true);
  };

  const handleOpenEditSlide = (slide: FeaturedSlide) => {
    setEditingSlide({ ...slide });
    setSlideSaveMsg(null);
    setShowSlideModal(true);
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide?.image_url || !editingSlide?.title) {
      setSlideSaveMsg({ type: 'error', text: 'Slide Title and Image URL are required.' });
      return;
    }

    setSlideSaving(true);
    setSlideSaveMsg(null);

    try {
      if (editingSlide.id) {
        const updated = await api.updateSlide(editingSlide.id, editingSlide);
        setSlidesList(prev => prev.map(s => (s.id === updated.id ? updated : s)));
        setSlideSaveMsg({ type: 'success', text: 'Slide updated successfully!' });
      } else {
        const created = await api.createSlide(editingSlide);
        setSlidesList(prev => [...prev, created]);
        setSlideSaveMsg({ type: 'success', text: 'New feature slide added successfully!' });
      }
      onRefreshData();
      setTimeout(() => setShowSlideModal(false), 800);
    } catch (err: any) {
      setSlideSaveMsg({ type: 'error', text: err.message || 'Failed to save slide.' });
    } finally {
      setSlideSaving(false);
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this feature slide?')) return;
    try {
      await api.deleteSlide(id);
      setSlidesList(prev => prev.filter(s => s.id !== id));
      onRefreshData();
    } catch (err: any) {
      alert('Failed to delete slide: ' + err.message);
    }
  };

  const handleToggleSlideActive = async (slide: FeaturedSlide) => {
    try {
      const updated = await api.updateSlide(slide.id, { is_active: !slide.is_active });
      setSlidesList(prev => prev.map(s => (s.id === updated.id ? updated : s)));
      onRefreshData();
    } catch (err: any) {
      alert('Failed to toggle slide status: ' + err.message);
    }
  };

  const handleSlideImageUpload = async (file: File) => {
    setSlideImageUploadLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await api.uploadImage(reader.result as string);
          setEditingSlide(prev => ({
            ...prev,
            image_url: res.url
          }));
        } catch (e: any) {
          alert('Failed to upload image: ' + (e.message || 'Unknown error'));
        } finally {
          setSlideImageUploadLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert('Error reading image: ' + err.message);
      setSlideImageUploadLoading(false);
    }
  };

  // Store Contact & Address Settings Handler
  const handleSaveStoreContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSaving(true);
    setContactSaveMsg(null);
    try {
      const res = await api.updateStoreContact(contactForm);
      if (res.success) {
        setContactSaveMsg({
          type: 'success',
          text: `Store address & phone numbers updated successfully ${res.saved_in_supabase ? 'and stored in Supabase shop_details table' : 'across the website'}!`
        });
        await onRefreshData();
        setTimeout(() => setContactSaveMsg(null), 6000);
      }
    } catch (err: any) {
      setContactSaveMsg({ type: 'error', text: err.message || 'Failed to save store contact details.' });
    } finally {
      setContactSaving(false);
    }
  };

  // Cloudinary Config Save & Ping
  const handleSaveCloudinaryConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setCloudinarySaving(true);
    setCloudinaryConfigMsg(null);
    try {
      const res = await api.saveCloudinaryConfig({
        cloud_name: cloudinaryNameInput,
        api_key: cloudinaryKeyInput,
        api_secret: cloudinarySecretInput
      });
      setCloudinaryConfigMsg({ type: 'success', text: res.message });
      await fetchStatusAndSupabase();
    } catch (err: any) {
      setCloudinaryConfigMsg({ type: 'error', text: err.message || 'Failed to verify Cloudinary credentials' });
    } finally {
      setCloudinarySaving(false);
    }
  };

  // Test Image Upload to Cloudinary
  const handleTestImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTestUploadLoading(true);
    setTestUploadError('');
    setTestUploadResult(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const res = await api.uploadImage(base64);
        setTestUploadResult({ url: res.url, cloud_name: res.cloud_name });
      } catch (err: any) {
        setTestUploadError(err.message || 'Image upload failed. Check Cloudinary settings.');
      } finally {
        setTestUploadLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedVarName(label);
      setTimeout(() => setCopiedVarName(''), 3000);
    }
  };

  // Product Submit
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name) {
      setProductSaveMsg({ type: 'error', text: 'Please enter a product name.' });
      return;
    }

    const catSlug = editingProduct.category_slug || categories[0]?.slug || 'gold-necklaces-malas';
    setProductSaving(true);
    setProductSaveMsg(null);

    try {
      if (editingProduct.id) {
        const res = await api.updateProduct(editingProduct.id, {
          ...editingProduct,
          category_slug: catSlug
        });
        setProductSaveMsg({
          type: res.saved_in_supabase ? 'success' : 'error',
          text: res.saved_in_supabase
            ? 'Product updated and saved directly in Supabase!'
            : `Saved locally. (Supabase notice: ${res.supabase_error || 'Supabase URL/Key not set. Connect in Database Config tab.'})`
        });
      } else {
        const res = await api.createProduct({
          ...editingProduct,
          category_slug: catSlug,
          metal_type: editingProduct.metal_type || '22k_gold',
          net_weight: Number(editingProduct.net_weight) || 10,
          wastage_percent: Number(editingProduct.wastage_percent) || 8.5,
          making_charges: Number(editingProduct.making_charges) || 1000,
          purity_hallmark: editingProduct.purity_hallmark || 'BIS 916 22K Hallmarked',
          image_url: editingProduct.image_url || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
          is_featured: editingProduct.is_featured ?? true,
          in_stock: editingProduct.in_stock ?? true
        });
        setProductSaveMsg({
          type: res.saved_in_supabase ? 'success' : 'error',
          text: res.saved_in_supabase
            ? 'Product created and saved directly in Supabase!'
            : `Saved locally. (Supabase notice: ${res.supabase_error || 'Supabase URL/Key not set. Connect in Database Config tab.'})`
        });
      }

      await onRefreshData();
      setTimeout(() => {
        setShowProductModal(false);
        setEditingProduct(null);
        setProductSaveMsg(null);
      }, 1200);
    } catch (err: any) {
      setProductSaveMsg({ type: 'error', text: err.message || 'Failed to save product.' });
    } finally {
      setProductSaving(false);
    }
  };

  // Product Delete
  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.deleteProduct(id);
        await onRefreshData();
      } catch (e: any) {
        alert('Failed to delete product: ' + e.message);
      }
    }
  };

  // Category Submit
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) {
      setCategorySaveMsg({ type: 'error', text: 'Please enter a category name.' });
      return;
    }

    setCategorySaving(true);
    setCategorySaveMsg(null);

    try {
      if (editingCategory.id) {
        const res = await api.updateCategory(editingCategory.id, editingCategory);
        setCategorySaveMsg({
          type: res.saved_in_supabase ? 'success' : 'error',
          text: res.saved_in_supabase
            ? 'Category updated and saved directly in Supabase!'
            : `Saved locally. (Supabase notice: ${res.supabase_error || 'Supabase URL/Key not set. Connect in Database Config tab.'})`
        });
      } else {
        const res = await api.createCategory({
          ...editingCategory,
          banner_image_url: editingCategory.banner_image_url || 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=800&q=80'
        });
        setCategorySaveMsg({
          type: res.saved_in_supabase ? 'success' : 'error',
          text: res.saved_in_supabase
            ? 'Category created and saved directly in Supabase!'
            : `Saved locally. (Supabase notice: ${res.supabase_error || 'Supabase URL/Key not set. Connect in Database Config tab.'})`
        });
      }

      await onRefreshData();
      setTimeout(() => {
        setShowCategoryModal(false);
        setEditingCategory(null);
        setCategorySaveMsg(null);
      }, 1200);
    } catch (err: any) {
      setCategorySaveMsg({ type: 'error', text: err.message || 'Failed to save category.' });
    } finally {
      setCategorySaving(false);
    }
  };

  // Category Delete
  const handleDeleteCategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await api.deleteCategory(id);
        await onRefreshData();
      } catch (e: any) {
        alert('Failed to delete category: ' + e.message);
      }
    }
  };

  // Direct Category Card Banner Upload
  const handleCategoryCardBannerUpload = async (cat: Category, file: File) => {
    setImageUploadLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const res = await api.uploadImage(reader.result as string);
          await api.updateCategory(cat.id, { banner_image_url: res.url });
          await onRefreshData();
        } catch (err: any) {
          alert('Failed to update banner image: ' + err.message);
        } finally {
          setImageUploadLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (e: any) {
      alert('Error reading file: ' + e.message);
      setImageUploadLoading(false);
    }
  };

  // Direct Category Card Banner Clear
  const handleClearCategoryCardBanner = async (cat: Category) => {
    if (!window.confirm(`Clear banner photo for category "${cat.name}"?`)) return;
    try {
      await api.updateCategory(cat.id, { banner_image_url: '' });
      await onRefreshData();
    } catch (err: any) {
      alert('Failed to clear category banner photo: ' + err.message);
    }
  };

  // File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'category') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploadLoading(true);
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
      } finally {
        setImageUploadLoading(false);
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

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleManualRefreshOrders = async () => {
    setRefreshingOrders(true);
    try {
      await onRefreshData();
    } finally {
      setTimeout(() => setRefreshingOrders(false), 500);
    }
  };

  const handleSaveTracking = async (orderId: string, currentStatus: OrderStatus) => {
    const draft = trackingDrafts[orderId];
    setSavingTrackingId(orderId);
    try {
      await api.updateOrderStatus(orderId, currentStatus, draft !== undefined ? draft : undefined, 'DTDC Express Courier');
      await onRefreshData();
    } finally {
      setSavingTrackingId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm(`Are you sure you want to delete order ${orderId}? This will remove it from Supabase.`)) {
      try {
        await api.deleteOrder(orderId);
        await onRefreshData();
      } catch (err: any) {
        alert('Failed to delete order: ' + err.message);
      }
    }
  };

  // Create Manual Order in Supabase
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderForm.customer_name || !newOrderForm.phone || !newOrderForm.address) {
      setOrderSaveMsg({ type: 'error', text: 'Customer name, phone number, and delivery address are required.' });
      return;
    }

    const selectedProd = products.find(p => p.id === newOrderForm.product_id) || products[0];
    if (!selectedProd) {
      setOrderSaveMsg({ type: 'error', text: 'Please select at least one product for the order.' });
      return;
    }

    const pricePerUnit = getProductPrice(selectedProd, rates);
    const subtotal = pricePerUnit * newOrderForm.quantity;
    const gstTotal = Math.round(subtotal * 0.03);
    const grandTotal = subtotal + gstTotal;

    setOrderSaving(true);
    setOrderSaveMsg(null);

    try {
      const orderPayload: Partial<Order> = {
        customer_name: newOrderForm.customer_name.trim(),
        phone: newOrderForm.phone.trim(),
        email: newOrderForm.email.trim(),
        address: newOrderForm.address.trim(),
        city: newOrderForm.city.trim() || 'Krishnagiri',
        state: newOrderForm.state.trim() || 'Tamil Nadu',
        pincode: newOrderForm.pincode.trim() || '635001',
        payment_method: newOrderForm.payment_method,
        payment_status: newOrderForm.payment_status,
        subtotal,
        gst_total: gstTotal,
        grand_total: grandTotal,
        items: [
          {
            product_id: selectedProd.id,
            product_name: selectedProd.name,
            net_weight: selectedProd.net_weight,
            metal_type: selectedProd.metal_type,
            price_per_unit: pricePerUnit,
            quantity: newOrderForm.quantity,
            image_url: selectedProd.image_url
          }
        ]
      };

      const created = await api.createOrder(orderPayload);
      setOrderSaveMsg({
        type: 'success',
        text: `Order ${created.id} created and saved directly to Supabase!`
      });

      await onRefreshData();
      setTimeout(() => {
        setShowCreateOrderModal(false);
        setOrderSaveMsg(null);
        setNewOrderForm({
          customer_name: '',
          phone: '',
          email: '',
          address: '',
          city: 'Krishnagiri',
          state: 'Tamil Nadu',
          pincode: '635001',
          product_id: '',
          quantity: 1,
          payment_method: 'COD',
          payment_status: 'Pending'
        });
      }, 1000);
    } catch (err: any) {
      setOrderSaveMsg({ type: 'error', text: err.message || 'Failed to save order to Supabase.' });
    } finally {
      setOrderSaving(false);
    }
  };

  // ---------------- LOGIN SCREEN (MINIMALIST & CLEAN) ----------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto space-y-6 w-full">
        <div className="w-full max-w-md bg-white rounded-2xl border border-[#D4AF37]/50 p-6 sm:p-8 shadow-xl space-y-6 text-center">
          
          <div className="w-14 h-14 rounded-full bg-[#8F171B] text-[#D4AF37] flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h1 className="font-serif text-2xl font-bold text-[#292321]">Admin Portal</h1>
            <p className="text-xs text-gray-500 mt-1">Sign in with your admin credentials</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            {authError && (
              <div className="bg-red-50 border border-red-200 text-[#8F171B] p-3 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span className="font-medium leading-relaxed">{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#292321] uppercase mb-1">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="Enter admin email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full bg-[#FCF8F1] border border-[#D4AF37]/40 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:border-[#8F171B] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#292321] uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-[#FCF8F1] border border-[#D4AF37]/40 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:border-[#8F171B] transition-colors font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-[#8F171B] text-white hover:bg-[#580E11] py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loginLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
              ) : (
                <KeyRound className="w-4 h-4 text-[#D4AF37]" />
              )}
              <span>{loginLoading ? 'Signing In...' : 'Sign In'}</span>
            </button>
          </form>

          {onExitAdmin && (
            <div className="pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={onExitAdmin}
                className="text-xs text-gray-400 hover:text-[#8F171B] transition-colors cursor-pointer"
              >
                &larr; Return to Storefront
              </button>
            </div>
          )}
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
          <button
            onClick={() => setActiveTab('supabase')}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer text-left"
            title="Configure Supabase Database"
          >
            <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37] shrink-0" />
            <span>
              Supabase:{' '}
              <strong className={supabaseStatus?.connected ? 'text-emerald-400 font-bold' : 'text-amber-300'}>
                {supabaseStatus?.connected ? 'Live Connected' : 'Local Persistence'}
              </strong>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('cloudinary')}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer text-left"
            title="Configure Cloudinary Media CDN"
          >
            <Cloud className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37] shrink-0" />
            <span>
              Cloudinary:{' '}
              <strong className={cloudinaryStatus?.connected || envStatus?.cloudinary_configured ? 'text-emerald-400 font-bold' : 'text-amber-300'}>
                {cloudinaryStatus?.connected || envStatus?.cloudinary_configured ? 'Live Connected' : 'Configure'}
              </strong>
            </span>
          </button>

          <button
            onClick={fetchStatusAndSupabase}
            disabled={loadingStatus}
            className="p-1 hover:text-[#D4AF37] transition-colors ml-auto cursor-pointer"
            title="Refresh Environment, Supabase & Cloudinary Status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin' : ''}`} />
          </button>

          {onNavigateToResetPassword && (
            <button
              onClick={onNavigateToResetPassword}
              className="text-[11px] bg-[#8F171B] hover:bg-[#580E11] text-[#EBDCC5] px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 font-bold border border-[#D4AF37]/40 shadow-xs ml-1"
              title="Open separate Password Reset page"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Reset Password Page →</span>
            </button>
          )}

          {onExitAdmin && (
            <button
              onClick={handleLogout}
              className="text-[11px] bg-white/10 hover:bg-white/20 text-[#EBDCC5] px-2.5 py-1 rounded-md transition-colors cursor-pointer ml-1"
              title="Exit admin session and return to storefront"
            >
              Exit to Store
            </button>
          )}

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
          { id: 'orders', label: 'Orders Manager', icon: ShoppingBag },
          { id: 'products', label: 'Products Manager', icon: Package },
          { id: 'categories', label: 'Categories Manager', icon: Folders },
          { id: 'slides', label: 'Banner Preview Photos', icon: ImageIcon },
          { id: 'contact', label: 'Store Address & Contact', icon: MapPin },
          { id: 'rates', label: 'Live Rates', icon: Settings },
          { id: 'supabase', label: 'Supabase & Database', icon: Database },
          { id: 'cloudinary', label: 'Cloudinary CDN', icon: Cloud },
          { id: 'password-reset', label: 'Admin Security & Reset', icon: ShieldCheck }
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
              {tab.id === 'cloudinary' && (cloudinaryStatus?.connected || envStatus?.cloudinary_configured) && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200 w-full">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full">
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#D4AF37]/30 shadow-xs space-y-1 w-full">
              <span className="text-xs font-bold text-[#8F171B] uppercase">Total Products</span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-[#292321]">{products.length}</div>
              <span className="text-[11px] text-gray-500">
                {supabaseStatus?.counts.products !== null && supabaseStatus?.counts.products !== undefined
                  ? `${supabaseStatus.counts.products} in Supabase`
                  : 'Active in catalog'}
              </span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#D4AF37]/30 shadow-xs space-y-1 w-full">
              <span className="text-xs font-bold text-[#8F171B] uppercase">Active Categories</span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-[#292321]">{categories.length}</div>
              <span className="text-[11px] text-gray-500">
                {supabaseStatus?.counts.categories !== null && supabaseStatus?.counts.categories !== undefined
                  ? `${supabaseStatus.counts.categories} in Supabase`
                  : 'Gold, Silver & Antiques'}
              </span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#D4AF37]/30 shadow-xs space-y-1 w-full">
              <span className="text-xs font-bold text-[#8F171B] uppercase">Total Orders</span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-[#8F171B]">{orders.length}</div>
              <span className="text-[11px] text-gray-500">
                {supabaseStatus?.counts.orders !== null && supabaseStatus?.counts.orders !== undefined
                  ? `${supabaseStatus.counts.orders} in Supabase orders`
                  : 'Live orders synced'}
              </span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#D4AF37]/30 shadow-xs space-y-1 w-full">
              <span className="text-xs font-bold text-[#8F171B] uppercase">Live 22K Gold Rate</span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-[#8F171B]">{formatINR(rates.gold_22k_rate)}/g</div>
              <span className="text-[11px] text-gray-500">Storewide benchmark</span>
            </div>
          </div>

          {/* Quick Action Bar for Customer Orders */}
          <div className="bg-gradient-to-r from-[#8F171B]/5 to-[#D4AF37]/10 p-5 rounded-2xl border-2 border-[#D4AF37]/50 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#8F171B] text-[#D4AF37] rounded-xl shadow-xs shrink-0">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-base sm:text-lg font-bold text-[#292321]">
                  Customer Orders Manager ({orders.length} Orders)
                </h4>
                <p className="text-xs text-gray-600">
                  Track courier status, view customer addresses, update order progress, and manually create new orders in Supabase.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('orders' as any)}
              className="bg-[#8F171B] hover:bg-[#580E11] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-colors border border-[#D4AF37]/40 shrink-0"
            >
              <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
              <span>Manage Orders in Supabase →</span>
            </button>
          </div>

          {/* Quick Action Bar for Banner Preview Photos */}
          <div className="bg-white p-5 rounded-2xl border border-[#D4AF37]/40 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#8F171B] text-[#D4AF37] rounded-xl shadow-xs shrink-0">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-base sm:text-lg font-bold text-[#292321]">
                  Banner Preview Photos ({slidesList.length} Photos)
                </h4>
                <p className="text-xs text-gray-500">
                  Manage homepage hero slider banner preview images stored in Supabase.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('slides' as any)}
                className="bg-white border border-[#D4AF37]/60 hover:bg-[#FCF8F1] text-[#292321] px-4 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                View Banner Photos Gallery
              </button>
              <button
                onClick={handleOpenAddSlide}
                className="bg-[#8F171B] hover:bg-[#580E11] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors border border-[#D4AF37]/40"
              >
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                <span>Add Banner Preview Photo</span>
              </button>
            </div>
          </div>

          {/* Quick Action Bar for Store Address & Phone Numbers */}
          <div className="bg-white p-5 rounded-2xl border border-[#D4AF37]/40 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#8F171B] text-[#D4AF37] rounded-xl shadow-xs shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-base sm:text-lg font-bold text-[#292321]">
                  Store Address & Phone Numbers
                </h4>
                <p className="text-xs text-gray-500">
                  {contactForm.main_branch_address ? `${contactForm.main_branch_address.substring(0, 65)}...` : 'Manage showroom addresses and phone numbers in Supabase shop_details table.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('contact' as any)}
              className="bg-[#8F171B] hover:bg-[#580E11] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-colors border border-[#D4AF37]/40 shrink-0"
            >
              <MapPin className="w-4 h-4 text-[#D4AF37]" />
              <span>Change Address & Phone Numbers →</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGER (SUPABASE CONNECTED) */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in duration-200 w-full">
          
          {/* Header Card */}
          <div className="bg-white p-5 rounded-2xl border-2 border-[#D4AF37]/50 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#8F171B] text-[#D4AF37] flex items-center justify-center font-bold shrink-0 shadow-xs">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#292321]">
                    Customer Orders Manager
                  </h3>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                    supabaseStatus?.connected
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${supabaseStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                    {supabaseStatus?.connected ? 'Live Synced to Supabase (orders table)' : 'Local Cache / Standby'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  View, filter, track shipping, update status, and manually create new customer orders directly in Supabase.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleManualRefreshOrders}
                disabled={refreshingOrders}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Fetch latest orders directly from Supabase"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshingOrders ? 'animate-spin' : ''}`} />
                <span>{refreshingOrders ? 'Fetching...' : 'Refresh Orders'}</span>
              </button>

              <button
                onClick={() => {
                  setNewOrderForm({
                    customer_name: '',
                    phone: '',
                    email: '',
                    address: '',
                    city: 'Krishnagiri',
                    state: 'Tamil Nadu',
                    pincode: '635001',
                    product_id: products[0]?.id || '',
                    quantity: 1,
                    payment_method: 'COD',
                    payment_status: 'Pending'
                  });
                  setOrderSaveMsg(null);
                  setShowCreateOrderModal(true);
                }}
                className="bg-[#8F171B] hover:bg-[#580E11] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer border border-[#D4AF37]/40 transition-colors"
              >
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                <span>Create Order in Supabase</span>
              </button>
            </div>
          </div>

          {/* Search & Status Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-[#D4AF37]/40 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <input
                type="text"
                placeholder="Search by Order ID (NJ-2026-XXXX), Name, or Phone..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="w-full sm:w-80 bg-[#FCF8F1] border border-[#D4AF37]/50 rounded-xl px-3.5 py-2 text-xs font-semibold text-[#292321]"
              />

              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto text-xs font-semibold pb-1 sm:pb-0">
                {['all', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                      orderStatusFilter === st
                        ? 'bg-[#8F171B] text-white shadow-xs font-bold'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {st === 'all' ? 'All Orders' : st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders Cards List */}
          {(() => {
            const filteredOrders = orders.filter((ord) => {
              if (orderStatusFilter !== 'all' && ord.status !== orderStatusFilter) return false;
              if (orderSearchQuery) {
                const q = orderSearchQuery.toLowerCase().trim();
                const matchId = ord.id.toLowerCase().includes(q);
                const matchName = ord.customer_name.toLowerCase().includes(q);
                const matchPhone = ord.phone.includes(q);
                if (!matchId && !matchName && !matchPhone) return false;
              }
              return true;
            });

            if (filteredOrders.length === 0) {
              return (
                <div className="bg-white p-12 text-center rounded-2xl border border-[#D4AF37]/30 space-y-3">
                  <ShoppingBag className="w-10 h-10 text-[#D4AF37] mx-auto" />
                  <h4 className="font-serif text-lg font-bold text-[#292321]">No orders found</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    No orders match your search or filter criteria. Click <strong>"Create Order in Supabase"</strong> above to manually add an order!
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {filteredOrders.map((ord) => {
                  const isExpanded = Boolean(expandedOrders[ord.id]);
                  return (
                    <div key={ord.id} className="bg-white rounded-2xl border-2 border-[#D4AF37]/40 shadow-xs overflow-hidden transition-all">
                      <div className="p-4 sm:p-5 bg-[#FCF8F1] border-b border-[#D4AF37]/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-[#8F171B] text-[#D4AF37] font-mono font-bold text-xs px-3 py-1.5 rounded-lg shadow-2xs">
                            {ord.id}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[#292321]">{ord.customer_name}</h4>
                            <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono">
                              <span>📞 {ord.phone}</span>
                              {ord.email && <span>• ✉️ {ord.email}</span>}
                              <span>• 📅 {new Date(ord.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                          <div className="text-right">
                            <span className="text-[10px] text-gray-500 uppercase font-bold block">Grand Total</span>
                            <span className="font-mono font-bold text-base text-[#8F171B]">{formatINR(ord.grand_total)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={ord.status}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus, ord.tracking_number)}
                              className="bg-white border border-[#D4AF37]/60 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#8F171B] cursor-pointer"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>

                            <button
                              onClick={() => toggleOrderExpand(ord.id)}
                              className="bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 p-1.5 rounded-xl cursor-pointer"
                              title="Toggle Details"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            <button
                              onClick={() => handleDeleteOrder(ord.id)}
                              className="bg-white hover:bg-red-50 border border-red-200 text-red-600 p-1.5 rounded-xl cursor-pointer transition-colors"
                              title="Delete Order from Supabase"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Order Details */}
                      {isExpanded && (
                        <div className="p-4 sm:p-5 space-y-4 text-xs animate-in fade-in duration-150">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#FCF8F1]/60 p-3.5 rounded-xl border border-[#D4AF37]/20">
                            <div>
                              <span className="font-bold text-[#8F171B] uppercase text-[10px] block mb-1">Shipping Address</span>
                              <p className="text-gray-700 font-medium leading-relaxed">
                                {ord.address}, {ord.city}, {ord.state} - {ord.pincode}
                              </p>
                            </div>

                            <div>
                              <span className="font-bold text-[#8F171B] uppercase text-[10px] block mb-1">Payment Method & Status</span>
                              <div className="space-y-0.5">
                                <p className="font-bold text-gray-800">Method: {ord.payment_method}</p>
                                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                                  ord.payment_status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  Payment: {ord.payment_status}
                                </span>
                              </div>
                            </div>

                            {/* Courier Tracking Inputs */}
                            <div className="space-y-2">
                              <span className="font-bold text-[#8F171B] uppercase text-[10px] block">Courier & Tracking</span>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="DTDC-TN992831..."
                                  defaultValue={ord.tracking_number || ''}
                                  onChange={(e) => setTrackingDrafts(prev => ({ ...prev, [ord.id]: e.target.value }))}
                                  className="w-full bg-white border border-[#D4AF37]/50 rounded-lg px-2.5 py-1 text-xs font-mono"
                                />
                                <button
                                  onClick={() => handleSaveTracking(ord.id, ord.status)}
                                  disabled={savingTrackingId === ord.id}
                                  className="bg-[#8F171B] hover:bg-[#580E11] text-white px-3 py-1 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50 shrink-0"
                                >
                                  {savingTrackingId === ord.id ? 'Saving...' : 'Save to Supabase'}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Order Items Table */}
                          <div className="space-y-2">
                            <span className="font-bold text-[#292321] uppercase text-[11px] block">Ordered Items ({ord.items?.length || 0})</span>
                            <div className="space-y-2">
                              {ord.items && ord.items.map((it, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-gray-100">
                                  <div className="flex items-center gap-3">
                                    {it.image_url ? (
                                      <img src={it.image_url} alt={it.product_name} className="w-12 h-12 object-cover rounded-lg border border-[#D4AF37]/30" />
                                    ) : (
                                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-bold">NJ</div>
                                    )}
                                    <div>
                                      <h5 className="font-bold text-xs text-[#292321]">{it.product_name}</h5>
                                      <span className="text-[10px] text-gray-500">
                                        Weight: {it.net_weight}g • Metal: {it.metal_type} • Qty: {it.quantity}
                                      </span>
                                    </div>
                                  </div>
                                  <span className="font-mono font-bold text-xs text-[#8F171B]">{formatINR(it.price_per_unit * it.quantity)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 3: PRODUCTS MANAGER */}
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
              <div key={cat.id} className="bg-white rounded-xl border border-[#D4AF37]/30 overflow-hidden shadow-xs space-y-2 flex flex-col justify-between">
                <div>
                  <div className="relative w-full h-36 bg-gray-900 overflow-hidden group">
                    <img src={cat.banner_image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                      {cat.banner_image_url && (
                        <button
                          type="button"
                          onClick={() => handleClearCategoryCardBanner(cat)}
                          className="bg-red-600/90 hover:bg-red-700 text-white px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-md border border-red-400/40 backdrop-blur-xs transition-colors cursor-pointer"
                          title="Delete category banner photo"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Clear Photo</span>
                        </button>
                      )}
                      <label className="bg-black/80 hover:bg-black text-[#D4AF37] px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 cursor-pointer shadow-md border border-[#D4AF37]/40 backdrop-blur-xs transition-colors">
                        {imageUploadLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                        <span>{imageUploadLoading ? 'Uploading...' : 'Upload Banner Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleCategoryCardBannerUpload(cat, file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                    <div className="p-3.5 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-sm text-[#292321]">{cat.name}</h4>
                            {cat.is_silver_only && (
                              <span className="bg-slate-800 text-slate-100 text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-600">
                                🥈 92.5 Silver
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#8F171B] font-mono">{cat.slug}</span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setShowCategoryModal(true);
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{cat.description}</p>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BANNER PREVIEW PHOTOS & HERO SLIDER */}
      {activeTab === 'slides' && (
        <div className="space-y-6 animate-in fade-in duration-200 w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-[#D4AF37]/40 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#8F171B] text-[#D4AF37] rounded-xl shadow-xs shrink-0">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#292321]">
                  Banner Preview Photos ({slidesList.length} Photos)
                </h3>
                <p className="text-xs text-gray-500">
                  Manage homepage hero slider banner preview images stored in Supabase table <code className="text-[#8F171B] font-mono font-bold bg-red-50 px-1 py-0.5 rounded">featured_slides</code>.
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenAddSlide}
              className="bg-[#8F171B] hover:bg-[#580E11] text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all border border-[#D4AF37]/40 shrink-0"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" />
              <span>Add Banner Preview Photo</span>
            </button>
          </div>

          {/* Banner Photos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
            {slidesList.map((slide) => (
              <div
                key={slide.id}
                className="bg-white rounded-2xl border border-[#D4AF37]/30 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="relative w-full h-48 bg-gray-900 overflow-hidden group">
                  <img
                    src={slide.image_url}
                    alt={slide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent p-3.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold text-[#D4AF37] bg-black/70 px-2.5 py-1 rounded-full border border-[#D4AF37]/40 backdrop-blur-xs">
                        {slide.badge || 'Banner Photo'}
                      </span>
                      <button
                        onClick={() => handleToggleSlideActive(slide)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                          slide.is_active !== false
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-gray-600 text-gray-200'
                        }`}
                      >
                        {slide.is_active !== false ? 'Active Live' : 'Hidden'}
                      </button>
                    </div>

                    <div>
                      <h4 className="font-serif text-base font-bold text-white drop-shadow-md">
                        {slide.title}
                      </h4>
                      {slide.subtitle && (
                        <p className="text-[11px] text-gray-200 line-clamp-1">
                          {slide.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-[#FCF8F1] border-t border-[#D4AF37]/20 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-gray-600 font-medium">
                    CTA: <strong className="text-[#8F171B]">{slide.cta_text || 'Explore Collection'}</strong>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditSlide(slide)}
                      className="p-1.5 text-blue-700 hover:bg-blue-100/80 rounded-lg cursor-pointer transition-colors"
                      title="Edit Banner Photo"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="p-1.5 text-red-700 hover:bg-red-100/80 rounded-lg cursor-pointer transition-colors"
                      title="Delete Banner Photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* TAB: STORE ADDRESS & PHONE NUMBERS MANAGER */}
      {activeTab === 'contact' && (
        <div className="space-y-6 animate-in fade-in duration-200 w-full max-w-4xl">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-[#D4AF37]/50 shadow-md space-y-5">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#8F171B] text-[#D4AF37] rounded-xl shadow-xs shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#292321]">
                    Store Address, Phone Numbers & Contact Details
                  </h3>
                  <p className="text-xs text-gray-500">
                    Update store locations, phone numbers, WhatsApp, and hours. Data is persisted in Supabase table <code className="text-[#8F171B] font-mono font-bold bg-red-50 px-1.5 py-0.5 rounded">shop_details</code>.
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#8F171B]/10 text-[#8F171B] border border-[#8F171B]/30 flex items-center gap-1.5 shrink-0">
                <Database className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Supabase shop_details</span>
              </span>
            </div>

            {contactSaveMsg && (
              <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                contactSaveMsg.type === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                {contactSaveMsg.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span className="leading-relaxed">{contactSaveMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveStoreContact} className="space-y-4 text-xs">
              
              {/* Addresses Section */}
              <div className="bg-[#FCF8F1] p-4 rounded-xl border border-[#D4AF37]/30 space-y-3">
                <h4 className="font-serif text-sm font-bold text-[#8F171B] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#D4AF37]" /> Showroom Addresses
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#292321] uppercase mb-1">
                      Main Branch Address *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="e.g. 142, Netaji Road, Erode, Tamil Nadu 638001"
                      value={contactForm.main_branch_address || ''}
                      onChange={(e) => setContactForm({ ...contactForm, main_branch_address: e.target.value })}
                      className="w-full bg-white border border-[#D4AF37]/50 rounded-xl p-2.5 font-medium text-xs leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#292321] uppercase mb-1">
                      Second Branch / Showroom Address
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. 88, Perundurai Road, Erode, Tamil Nadu 638011"
                      value={contactForm.second_branch_address || ''}
                      onChange={(e) => setContactForm({ ...contactForm, second_branch_address: e.target.value })}
                      className="w-full bg-white border border-[#D4AF37]/50 rounded-xl p-2.5 font-medium text-xs leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Phone Numbers & Email Section */}
              <div className="bg-[#FCF8F1] p-4 rounded-xl border border-[#D4AF37]/30 space-y-3">
                <h4 className="font-serif text-sm font-bold text-[#8F171B] uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-[#D4AF37]" /> Contact Phone Numbers & Email
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-[#292321] uppercase mb-1">
                      Primary Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+91 94432 53072"
                      value={contactForm.phone_primary || ''}
                      onChange={(e) => setContactForm({ ...contactForm, phone_primary: e.target.value })}
                      className="w-full bg-white border border-[#D4AF37]/50 rounded-xl px-3 py-2 font-mono text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#292321] uppercase mb-1">
                      Secondary / Landline Phone
                    </label>
                    <input
                      type="text"
                      placeholder="+91 424 2253072"
                      value={contactForm.phone_secondary || ''}
                      onChange={(e) => setContactForm({ ...contactForm, phone_secondary: e.target.value })}
                      className="w-full bg-white border border-[#D4AF37]/50 rounded-xl px-3 py-2 font-mono text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#292321] uppercase mb-1">
                      WhatsApp Business Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+91 94432 53072"
                      value={contactForm.phone_whatsapp || ''}
                      onChange={(e) => setContactForm({ ...contactForm, phone_whatsapp: e.target.value })}
                      className="w-full bg-white border border-[#D4AF37]/50 rounded-xl px-3 py-2 font-mono text-xs font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="block font-bold text-[#292321] uppercase mb-1">
                      Store Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="natesajewellery@gmail.com"
                      value={contactForm.email || ''}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full bg-white border border-[#D4AF37]/50 rounded-xl px-3 py-2 font-semibold text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Hours & Announcement Text */}
              <div className="bg-[#FCF8F1] p-4 rounded-xl border border-[#D4AF37]/30 space-y-3">
                <h4 className="font-serif text-sm font-bold text-[#8F171B] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#D4AF37]" /> Operating Hours & Storefront Announcement
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#292321] uppercase mb-1">
                      Showroom Opening Hours
                    </label>
                    <input
                      type="text"
                      placeholder="Mon - Sat: 9:30 AM - 9:00 PM | Sun: 10:00 AM - 8:30 PM"
                      value={contactForm.opening_hours || ''}
                      onChange={(e) => setContactForm({ ...contactForm, opening_hours: e.target.value })}
                      className="w-full bg-white border border-[#D4AF37]/50 rounded-xl px-3 py-2 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#292321] uppercase mb-1">
                      Storefront Top Announcement Bar
                    </label>
                    <input
                      type="text"
                      placeholder="BIS 916 Hallmarked Gold & 92.5 Silver. Free Express Insured Shipping across India."
                      value={contactForm.announcement_text || ''}
                      onChange={(e) => setContactForm({ ...contactForm, announcement_text: e.target.value })}
                      className="w-full bg-white border border-[#D4AF37]/50 rounded-xl px-3 py-2 text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={contactSaving}
                className="w-full bg-[#8F171B] hover:bg-[#580E11] text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-[#D4AF37]/50"
              >
                {contactSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
                ) : (
                  <MapPin className="w-4 h-4 text-[#D4AF37]" />
                )}
                <span>{contactSaving ? 'Saving to Supabase...' : 'Save Address & Phone Numbers to Supabase'}</span>
              </button>
            </form>

            {/* Live Preview Box */}
            <div className="mt-4 p-4 bg-[#292321] text-[#FCF8F1] rounded-xl border border-[#D4AF37]/40 space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest block">Live Storefront Header / Footer Preview</span>
              <div className="text-xs space-y-1 text-gray-300">
                <p>📍 <strong>Main Branch:</strong> {contactForm.main_branch_address || '142, Netaji Road, Erode, Tamil Nadu 638001'}</p>
                <p>📞 <strong>Phone:</strong> {contactForm.phone_primary} {contactForm.phone_secondary ? `| ${contactForm.phone_secondary}` : ''}</p>
                <p>💬 <strong>WhatsApp Order:</strong> {contactForm.phone_whatsapp}</p>
                <p>✉️ <strong>Email:</strong> {contactForm.email}</p>
              </div>
            </div>

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

            {/* Missing Tables Notice Banner */}
            {(supabaseStatus?.counts.categories === null || (supabaseStatus?.missing_tables && supabaseStatus.missing_tables.length > 0)) && (
              <div className="bg-amber-50 border-2 border-amber-400 p-5 rounded-2xl shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-amber-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base sm:text-lg font-bold text-amber-900">
                        Supabase Tables Not Formed Yet
                      </h4>
                      <p className="text-xs text-amber-800">
                        The tables (<span className="font-mono font-semibold">categories, products, rates, orders, admin_users</span>) have not been created in your Supabase project yet.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleCopySql}
                      className="bg-[#8F171B] hover:bg-[#580E11] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    >
                      {sqlCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#D4AF37]" />}
                      <span>{sqlCopied ? 'SQL Copied!' : 'Copy SQL Script'}</span>
                    </button>

                    <a
                      href="https://supabase.com/dashboard/project/_/sql/new"
                      target="_blank"
                      rel="noreferrer"
                      className="bg-white hover:bg-gray-50 border border-amber-400 text-amber-900 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <span>Open SQL Editor</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-amber-200">
                    <span className="font-bold text-[#8F171B] block mb-1">Step 1: Copy SQL</span>
                    <p className="text-gray-600 text-[11px]">Click <strong>"Copy SQL Script"</strong> above or from the box below.</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-amber-200">
                    <span className="font-bold text-[#8F171B] block mb-1">Step 2: Paste in Supabase</span>
                    <p className="text-gray-600 text-[11px]">Open Supabase Dashboard → <strong>SQL Editor</strong> → New query.</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-amber-200">
                    <span className="font-bold text-[#8F171B] block mb-1">Step 3: Click RUN</span>
                    <p className="text-gray-600 text-[11px]">Click <strong>"RUN"</strong>. Tables and categories form in ~2 seconds!</p>
                  </div>
                </div>
              </div>
            )}

            {/* Live Table Counters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className={`border rounded-xl p-3 text-center ${
                supabaseStatus?.counts.admin_users !== null ? 'bg-[#FCF8F1] border-[#D4AF37]/40' : 'bg-amber-50/70 border-amber-300'
              }`}>
                <span className="text-[10px] font-bold text-[#8F171B] uppercase block">Admin Credentials</span>
                <span className="text-base sm:text-lg font-bold font-mono text-[#292321] block my-0.5">
                  {supabaseStatus?.counts.admin_users !== null ? `${supabaseStatus?.counts.admin_users} in Supabase` : '⚠️ Not Formed'}
                </span>
                <span className="text-[10px] text-gray-500 block">table: admin_users</span>
              </div>

              <div className={`border rounded-xl p-3 text-center ${
                supabaseStatus?.counts.products !== null ? 'bg-[#FCF8F1] border-[#D4AF37]/40' : 'bg-amber-50/70 border-amber-300'
              }`}>
                <span className="text-[10px] font-bold text-[#8F171B] uppercase block">Products</span>
                <span className="text-base sm:text-lg font-bold font-mono text-[#292321] block my-0.5">
                  {supabaseStatus?.counts.products !== null ? `${supabaseStatus?.counts.products} in Supabase` : '⚠️ Not Formed'}
                </span>
                <span className="text-[10px] text-gray-500 block">table: products</span>
              </div>

              <div className={`border rounded-xl p-3 text-center ${
                supabaseStatus?.counts.categories !== null ? 'bg-[#FCF8F1] border-[#D4AF37]/40' : 'bg-amber-50/70 border-amber-300'
              }`}>
                <span className="text-[10px] font-bold text-[#8F171B] uppercase block">Categories</span>
                <span className="text-base sm:text-lg font-bold font-mono text-[#292321] block my-0.5">
                  {supabaseStatus?.counts.categories !== null ? `${supabaseStatus?.counts.categories} in Supabase` : '⚠️ Not Formed'}
                </span>
                <span className="text-[10px] text-gray-500 block">table: categories</span>
              </div>

              <div className={`border rounded-xl p-3 text-center ${
                supabaseStatus?.counts.rates ? 'bg-[#FCF8F1] border-[#D4AF37]/40' : 'bg-amber-50/70 border-amber-300'
              }`}>
                <span className="text-[10px] font-bold text-[#8F171B] uppercase block">Gold & Silver Rates</span>
                <span className="text-base sm:text-lg font-bold font-mono text-[#292321] block my-0.5">
                  {supabaseStatus?.counts.rates ? '✓ Live Synced' : '⚠️ Not Formed'}
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
              {/* Admin Forgot Password / Reset Link Dispatcher */}
              <div className="pt-3 border-t space-y-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase block">Send Password Reset Link</span>
                <p className="text-[11px] text-gray-500">
                  Dispatch a secure Supabase password reset link to any registered administrator email.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="admin@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="flex-1 bg-[#FCF8F1] border border-[#D4AF37]/50 rounded-xl px-3 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={forgotLoading}
                    className="bg-[#8F171B] hover:bg-[#580E11] text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
                  >
                    {forgotLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5 text-[#D4AF37]" />}
                    <span>{forgotLoading ? 'Sending...' : 'Send Reset Link'}</span>
                  </button>
                </div>
                {forgotMsg && (
                  <div className={`p-2 rounded-lg text-xs flex items-center gap-2 ${
                    forgotMsg.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'
                  }`}>
                    {forgotMsg.type === 'error' ? <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    <span>{forgotMsg.text}</span>
                  </div>
                )}
              </div>
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

      {/* TAB 7: CLOUDINARY MEDIA CDN */}
      {activeTab === 'cloudinary' && (
        <div className="space-y-6 animate-in fade-in duration-200 w-full">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#292321] via-[#3d1b1e] to-[#292321] text-white p-5 sm:p-6 rounded-2xl border-2 border-[#D4AF37]/40 shadow-md space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">MEDIA CDN & ASSET STORAGE</span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    cloudinaryStatus?.connected || envStatus?.cloudinary_configured
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {cloudinaryStatus?.connected || envStatus?.cloudinary_configured ? '● Connected' : '○ Not Configured'}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#EBDCC5] mt-1">Cloudinary Media Integration</h3>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://console.cloudinary.com"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#FCF8F1] hover:bg-[#EBDCC5] text-[#8F171B] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Open Cloudinary Console</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <p className="text-xs text-gray-200 leading-relaxed max-w-3xl">
              Cloudinary provides automatic high-speed image optimization (converting gold & diamond photos to lightweight WebP/AVIF format), global CDN edge caching, and permanent asset storage for your catalogue.
            </p>
          </div>

          {/* Vercel Environment Variables Card */}
          <div className="bg-gradient-to-br from-[#1c1917] to-[#292321] text-white p-5 sm:p-6 rounded-2xl border border-[#D4AF37]/50 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-[#D4AF37]" />
                <h4 className="font-bold text-sm text-[#EBDCC5]">Vercel Deployment Environment Variables</h4>
              </div>
              <span className="text-[10px] bg-[#8F171B] text-white px-2 py-0.5 rounded font-mono">
                Production Setup
              </span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              When deploying to <strong>Vercel</strong>, add these 3 variables in your Vercel Project Settings (<strong>Settings → Environment Variables</strong>). Click any button to copy the exact key name:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  key: 'CLOUDINARY_CLOUD_NAME',
                  desc: 'Your Cloudinary Cloud Name (e.g. natesa-jewels)',
                  detected: envStatus?.env_vars.CLOUDINARY_CLOUD_NAME
                },
                {
                  key: 'CLOUDINARY_API_KEY',
                  desc: 'Your public API key from Cloudinary Console',
                  detected: envStatus?.env_vars.CLOUDINARY_API_KEY
                },
                {
                  key: 'CLOUDINARY_API_SECRET',
                  desc: 'Your private API secret (keep confidential)',
                  detected: envStatus?.env_vars.CLOUDINARY_API_SECRET
                }
              ].map((item) => (
                <div key={item.key} className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono font-bold text-[#EBDCC5] text-xs">{item.key}</span>
                      <button
                        onClick={() => copyToClipboard(item.key, item.key)}
                        className="text-[10px] bg-white/10 hover:bg-white/20 text-[#D4AF37] px-2 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        {copiedVarName === item.key ? 'Copied!' : 'Copy Key'}
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-snug">{item.desc}</p>
                  </div>
                  <div className="text-[10px] text-gray-400 pt-2 border-t border-white/5">
                    Detected in Env: <strong className={item.detected ? 'text-emerald-400' : 'text-gray-400'}>
                      {item.detected ? 'YES' : 'Not set'}
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-gray-300 bg-white/5 p-3 rounded-lg border border-white/10 flex items-center justify-between">
              <span>
                💡 <strong>Vercel Tip:</strong> Once these 3 variables (along with your Supabase keys) are saved in Vercel, trigger a redeploy and all product images will be stored on your Cloudinary CDN automatically.
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

          {/* Setup Instructions & Test Connection Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            {/* Step-by-Step Guide */}
            <div className="bg-white p-5 rounded-2xl border border-[#D4AF37]/40 shadow-xs space-y-4">
              <div className="border-b pb-3">
                <h4 className="font-serif text-lg font-bold text-[#292321]">Step-by-Step: How to Link Cloudinary</h4>
                <p className="text-xs text-gray-500">
                  Follow these 4 simple steps to connect your Cloudinary media account:
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex gap-3 items-start bg-[#FCF8F1] p-3 rounded-xl border border-[#D4AF37]/30">
                  <span className="w-5 h-5 rounded-full bg-[#8F171B] text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
                  <div>
                    <h5 className="font-bold text-[#292321]">Sign Up or Log In to Cloudinary</h5>
                    <p className="text-gray-600 mt-0.5">
                      Go to <a href="https://cloudinary.com/users/register_free" target="_blank" rel="noreferrer" className="text-[#8F171B] font-bold underline">cloudinary.com</a> and sign up for a free account. Free tier includes 25GB monthly storage & bandwidth.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start bg-[#FCF8F1] p-3 rounded-xl border border-[#D4AF37]/30">
                  <span className="w-5 h-5 rounded-full bg-[#8F171B] text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
                  <div>
                    <h5 className="font-bold text-[#292321]">Copy API Keys from Cloudinary Console</h5>
                    <p className="text-gray-600 mt-0.5">
                      On the Cloudinary Console dashboard, look for <strong>Account Details</strong>. Copy your <strong>Cloud name</strong>, <strong>API Key</strong>, and <strong>API Secret</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start bg-[#FCF8F1] p-3 rounded-xl border border-[#D4AF37]/30">
                  <span className="w-5 h-5 rounded-full bg-[#8F171B] text-white flex items-center justify-center font-bold text-xs shrink-0">3</span>
                  <div>
                    <h5 className="font-bold text-[#292321]">Paste & Test in this Admin Portal</h5>
                    <p className="text-gray-600 mt-0.5">
                      Paste the 3 values in the form on the right and click <strong>Save & Test Cloudinary</strong>. The system will ping Cloudinary live to verify they work.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start bg-[#FCF8F1] p-3 rounded-xl border border-[#D4AF37]/30">
                  <span className="w-5 h-5 rounded-full bg-[#8F171B] text-white flex items-center justify-center font-bold text-xs shrink-0">4</span>
                  <div>
                    <h5 className="font-bold text-[#292321]">Add to Vercel for Live Deployment</h5>
                    <p className="text-gray-600 mt-0.5">
                      Add <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">CLOUDINARY_CLOUD_NAME</code>, <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">CLOUDINARY_API_KEY</code>, and <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">CLOUDINARY_API_SECRET</code> to your Vercel Environment Variables.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Connection Form */}
            <div className="bg-white p-5 rounded-2xl border border-[#D4AF37]/40 shadow-xs space-y-4">
              <div className="border-b pb-3">
                <h4 className="font-serif text-lg font-bold text-[#292321]">Connect & Verify Cloudinary</h4>
                <p className="text-xs text-gray-500">
                  Configure your credentials directly in this preview session:
                </p>
              </div>

              {cloudinaryConfigMsg && (
                <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  cloudinaryConfigMsg.type === 'error'
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{cloudinaryConfigMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveCloudinaryConfig} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-[#292321] uppercase mb-1">
                    Cloud Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. natesa-jewels or dx3abc12"
                    value={cloudinaryNameInput}
                    onChange={(e) => setCloudinaryNameInput(e.target.value)}
                    className="w-full bg-[#FCF8F1] border border-[#D4AF37]/50 rounded-xl px-3 py-2 font-mono text-xs"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    Found on Cloudinary Dashboard → Account Details → Cloud name
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-[#292321] uppercase mb-1">
                    API Key *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 123456789012345"
                    value={cloudinaryKeyInput}
                    onChange={(e) => setCloudinaryKeyInput(e.target.value)}
                    className="w-full bg-[#FCF8F1] border border-[#D4AF37]/50 rounded-xl px-3 py-2 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#292321] uppercase mb-1">
                    API Secret *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter Cloudinary API Secret"
                    value={cloudinarySecretInput}
                    onChange={(e) => setCloudinarySecretInput(e.target.value)}
                    className="w-full bg-[#FCF8F1] border border-[#D4AF37]/50 rounded-xl px-3 py-2 font-mono text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={cloudinarySaving}
                  className="w-full bg-[#8F171B] text-white hover:bg-[#580E11] py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {cloudinarySaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                  )}
                  <span>{cloudinarySaving ? 'Pinging Cloudinary API...' : 'Save & Verify Cloudinary'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Test Image Upload Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#D4AF37]/40 shadow-xs space-y-3">
            <div className="border-b pb-3">
              <h4 className="font-serif text-lg font-bold text-[#292321]">Test Image Upload to Cloudinary CDN</h4>
              <p className="text-xs text-gray-500">
                Upload a sample jewellery image to test if the backend uploads directly to your Cloudinary storage:
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <label className="bg-[#8F171B] hover:bg-[#580E11] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-xs">
                <Upload className="w-4 h-4 text-[#D4AF37]" />
                <span>{testUploadLoading ? 'Uploading to CDN...' : 'Choose Test Image & Upload'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleTestImageUpload}
                  disabled={testUploadLoading}
                  className="hidden"
                />
              </label>

              <span className="text-xs text-gray-500">
                Supports PNG, JPG, WEBP up to 10MB.
              </span>
            </div>

            {testUploadError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{testUploadError}</span>
              </div>
            )}

            {testUploadResult && (
              <div className="mt-3 p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-3">
                <div className="flex items-center justify-between gap-2 text-emerald-800 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Image Uploaded Successfully! Hosted on: {testUploadResult.cloud_name || 'Cloudinary'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTestUploadResult(null)}
                    className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shrink-0 shadow-xs"
                    title="Delete preview image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Preview</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={testUploadResult.url}
                    alt="Uploaded to Cloudinary"
                    className="w-24 h-24 object-cover rounded-lg border border-[#D4AF37]/40 shadow-xs"
                  />
                  <div className="space-y-1 w-full overflow-hidden">
                    <span className="text-[10px] uppercase font-bold text-gray-600">Secure CDN URL:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={testUploadResult.url}
                        className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs font-mono select-all"
                      />
                      <button
                        onClick={() => copyToClipboard(testUploadResult.url, 'uploaded_url')}
                        className="bg-white border hover:bg-gray-50 px-2 py-1 rounded text-xs shrink-0 cursor-pointer"
                      >
                        {copiedVarName === 'uploaded_url' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PRODUCT MODAL */}
      {showProductModal && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#FCF8F1] rounded-2xl border-2 border-[#D4AF37]/60 max-w-lg w-full p-4 sm:p-6 space-y-4 my-8 shadow-2xl">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#8F171B]">
              {editingProduct.id ? 'Edit Product' : 'Add New Product'}
            </h3>

            {productSaveMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                productSaveMsg.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                {productSaveMsg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0 text-red-600" /> : <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
                <span className="font-medium">{productSaveMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#292321] uppercase mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Antique Kasu Haram"
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-white border border-[#D4AF37]/50 rounded-xl px-3 py-2 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase mb-1">Category *</label>
                  <select
                    value={editingProduct.category_slug || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category_slug: e.target.value })}
                    className="w-full bg-white border border-[#D4AF37]/50 rounded-xl px-3 py-2 font-semibold"
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
                    onChange={(e) => {
                      const selectedMetal = e.target.value as any;
                      let suggestedHallmark = editingProduct.purity_hallmark;
                      if (selectedMetal === '925_silver') {
                        suggestedHallmark = '92.5 Sterling Silver Certified';
                      } else if (selectedMetal === '22k_gold' && (!suggestedHallmark || suggestedHallmark.includes('92.5'))) {
                        suggestedHallmark = 'BIS 916 22K Hallmarked';
                      } else if (selectedMetal === '24k_gold' && (!suggestedHallmark || suggestedHallmark.includes('92.5'))) {
                        suggestedHallmark = 'BIS 999 24K Hallmarked';
                      }
                      setEditingProduct({
                        ...editingProduct,
                        metal_type: selectedMetal,
                        purity_hallmark: suggestedHallmark
                      });
                    }}
                    className={`w-full border rounded-xl px-3 py-2 font-bold text-xs ${
                      editingProduct.metal_type === '925_silver'
                        ? 'bg-slate-100 border-slate-400 text-slate-900'
                        : 'bg-white border-[#D4AF37]/50 text-[#292321]'
                    }`}
                  >
                    <option value="22k_gold">✨ 22K Gold (BIS 916)</option>
                    <option value="24k_gold">✨ 24K Gold (BIS 999)</option>
                    <option value="925_silver">🥈 92.5 Sterling Silver</option>
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
                    className="w-full bg-white border border-[#D4AF37]/50 rounded-xl px-3 py-2 font-mono"
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
                    className="w-full bg-white border border-[#D4AF37]/50 rounded-xl px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">Making Charges (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.making_charges ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, making_charges: Number(e.target.value) })}
                    className="w-full bg-white border border-[#D4AF37]/50 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-white border border-[#D4AF37]/50 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Image URL or File Upload</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={editingProduct.image_url || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                  className="w-full bg-white border border-[#D4AF37]/50 rounded-xl px-3 py-2 font-mono text-xs mb-1"
                />
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'product')}
                    disabled={imageUploadLoading}
                    className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#8F171B] file:text-white hover:file:bg-[#580E11] file:cursor-pointer"
                  />
                  {imageUploadLoading && (
                    <span className="text-[11px] text-[#8F171B] font-bold flex items-center gap-1 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Uploading to CDN...
                    </span>
                  )}
                </div>

                {editingProduct.image_url && (
                  <div className="mt-2.5 p-2 bg-gray-900 border border-[#D4AF37]/40 rounded-xl flex items-center justify-between gap-3">
                    <img
                      src={editingProduct.image_url}
                      alt="Product preview"
                      className="w-16 h-16 object-cover rounded-lg border border-white/20 shrink-0"
                    />
                    <div className="flex-1 overflow-hidden text-left">
                      <span className="text-[10px] uppercase font-bold text-[#D4AF37] block">Image Preview</span>
                      <p className="text-[10px] text-gray-300 font-mono truncate">{editingProduct.image_url}</p>
                      {editingProduct.image_url.includes('cloudinary.com') && (
                        <span className="text-[10px] text-emerald-400 font-semibold block">✓ Hosted on Cloudinary CDN</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingProduct({ ...editingProduct, image_url: '' })}
                      className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-md cursor-pointer transition-colors shrink-0"
                      title="Delete preview image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Image</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductModal(false);
                    setProductSaveMsg(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2.5 rounded-xl font-bold cursor-pointer hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={productSaving}
                  className="flex-1 bg-[#8F171B] text-white hover:bg-[#580E11] py-2.5 rounded-xl font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                >
                  {productSaving ? <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" /> : <Package className="w-4 h-4 text-[#D4AF37]" />}
                  <span>{productSaving ? 'Saving Product...' : 'Save Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {showCategoryModal && editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-[#FCF8F1] rounded-2xl border-2 border-[#D4AF37]/60 max-w-md w-full p-4 sm:p-6 space-y-4 shadow-2xl">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#8F171B]">
              {editingCategory.id ? 'Edit Category' : 'Add New Category'}
            </h3>

            {categorySaveMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                categorySaveMsg.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                {categorySaveMsg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0 text-red-600" /> : <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
                <span className="font-medium">{categorySaveMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#292321] uppercase mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gold Earrings & Jhumkas"
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full bg-white border border-[#D4AF37]/50 rounded-xl px-3 py-2 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Slug</label>
                <input
                  type="text"
                  placeholder="e.g. gold-earrings-jhumkas (auto-generated if left blank)"
                  value={editingCategory.slug || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  className="w-full bg-white border border-[#D4AF37]/50 rounded-xl px-3 py-2 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short category description..."
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full bg-white border border-[#D4AF37]/50 rounded-xl px-3 py-2"
                />
              </div>

              {/* Metal Category Type Selector (Silver vs Gold) */}
              <div className="bg-white/80 p-3 rounded-xl border border-[#D4AF37]/40 space-y-2">
                <label className="block font-bold text-[#8F171B] uppercase text-[11px]">Category Metal Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${
                    !editingCategory.is_silver_only
                      ? 'bg-[#FCF8F1] border-[#8F171B] font-bold text-[#8F171B]'
                      : 'bg-white border-gray-200 text-gray-700'
                  }`}>
                    <input
                      type="radio"
                      name="cat_metal_type"
                      checked={!editingCategory.is_silver_only}
                      onChange={() => setEditingCategory({ ...editingCategory, is_silver_only: false })}
                      className="accent-[#8F171B]"
                    />
                    <span>✨ Gold & General</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${
                    editingCategory.is_silver_only
                      ? 'bg-slate-100 border-slate-600 font-bold text-slate-800'
                      : 'bg-white border-gray-200 text-gray-700'
                  }`}>
                    <input
                      type="radio"
                      name="cat_metal_type"
                      checked={Boolean(editingCategory.is_silver_only)}
                      onChange={() => setEditingCategory({ ...editingCategory, is_silver_only: true })}
                      className="accent-slate-700"
                    />
                    <span>🥈 92.5 Silver Only</span>
                  </label>
                </div>
                <span className="text-[10px] text-gray-500 block">
                  {editingCategory.is_silver_only
                    ? 'Silver categories display in the 92.5 Sterling Silver collection & auto-saves to Supabase.'
                    : 'Standard categories use 22K/24K Gold rates & auto-saves to Supabase.'}
                </span>
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Banner Preview Photo URL or Upload</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={editingCategory.banner_image_url || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, banner_image_url: e.target.value })}
                  className="w-full bg-white border border-[#D4AF37]/50 rounded-xl px-3 py-2 font-mono text-xs mb-1"
                />
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'category')}
                    disabled={imageUploadLoading}
                    className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#8F171B] file:text-white hover:file:bg-[#580E11] file:cursor-pointer"
                  />
                  {imageUploadLoading && (
                    <span className="text-[11px] text-[#8F171B] font-bold flex items-center gap-1 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Uploading to CDN...
                    </span>
                  )}
                </div>
                {editingCategory.banner_image_url && (
                  <div className="mt-2.5 p-2 bg-gray-900 border border-[#D4AF37]/40 rounded-xl flex items-center justify-between gap-3">
                    <img
                      src={editingCategory.banner_image_url}
                      alt="Category banner preview"
                      className="w-16 h-16 object-cover rounded-lg border border-white/20 shrink-0"
                    />
                    <div className="flex-1 overflow-hidden text-left">
                      <span className="text-[10px] uppercase font-bold text-[#D4AF37] block">Banner Image Preview</span>
                      <p className="text-[10px] text-gray-300 font-mono truncate">{editingCategory.banner_image_url}</p>
                      {editingCategory.banner_image_url.includes('cloudinary.com') && (
                        <span className="text-[10px] text-emerald-400 font-semibold block">✓ Hosted on Cloudinary CDN</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingCategory({ ...editingCategory, banner_image_url: '' })}
                      className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-md cursor-pointer transition-colors shrink-0"
                      title="Delete preview image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Image</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setCategorySaveMsg(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2.5 rounded-xl font-bold cursor-pointer hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={categorySaving}
                  className="flex-1 bg-[#8F171B] text-white hover:bg-[#580E11] py-2.5 rounded-xl font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                >
                  {categorySaving ? <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" /> : <Folders className="w-4 h-4 text-[#D4AF37]" />}
                  <span>{categorySaving ? 'Saving Category...' : 'Save Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FEATURED SLIDE MODAL */}
      {showSlideModal && editingSlide && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#FCF8F1] rounded-2xl border-2 border-[#D4AF37]/60 max-w-lg w-full p-4 sm:p-6 space-y-4 my-8 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#8F171B]">
              {editingSlide.id ? 'Edit Featured Slide' : 'Add New Feature Slide'}
            </h3>

            {slideSaveMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                slideSaveMsg.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                {slideSaveMsg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
                <span>{slideSaveMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveSlide} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#292321] uppercase mb-1">Slide Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Kasu & Mango Haram"
                  value={editingSlide.title || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  className="w-full bg-white border border-[#D4AF37]/50 rounded-xl px-3 py-2 font-semibold text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-[#292321] uppercase mb-1">Subtitle / Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Signature bridal masterpiece with custom weight options and live rate pricing."
                  value={editingSlide.subtitle || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                  className="w-full bg-white border border-[#D4AF37]/50 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#292321] uppercase mb-1">Badge / Tagline</label>
                  <input
                    type="text"
                    placeholder="e.g. Signature Bridal Masterpiece"
                    value={editingSlide.badge || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, badge: e.target.value })}
                    className="w-full bg-white border border-[#D4AF37]/50 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#292321] uppercase mb-1">Target Category *</label>
                  <select
                    value={editingSlide.category_slug || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, category_slug: e.target.value })}
                    className="w-full bg-white border border-[#D4AF37]/50 rounded-xl px-3 py-2 font-semibold text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#292321] uppercase mb-1">Button CTA Text</label>
                  <input
                    type="text"
                    placeholder="e.g. View Gold Necklaces & Malas"
                    value={editingSlide.cta_text || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, cta_text: e.target.value })}
                    className="w-full bg-white border border-[#D4AF37]/50 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#292321] uppercase mb-1">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={editingSlide.display_order || 1}
                    onChange={(e) => setEditingSlide({ ...editingSlide, display_order: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white border border-[#D4AF37]/50 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Image URL with Cloudinary Upload Option */}
              <div className="space-y-1.5 pt-1">
                <label className="block font-bold text-[#292321] uppercase mb-1">Feature Image *</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/... or Cloudinary URL"
                    value={editingSlide.image_url || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, image_url: e.target.value })}
                    className="flex-1 bg-white border border-[#D4AF37]/50 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                  <label className="bg-[#292321] hover:bg-black text-[#D4AF37] px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs">
                    {slideImageUploadLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{slideImageUploadLoading ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleSlideImageUpload(file);
                      }}
                    />
                  </label>
                </div>
                {editingSlide.image_url && (
                  <div className="mt-2 relative w-full h-32 rounded-xl overflow-hidden border border-[#D4AF37]/40 bg-gray-900 group">
                    <img
                      src={editingSlide.image_url}
                      alt="Slide preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-between p-3">
                      <div className="text-left overflow-hidden">
                        <span className="text-[10px] uppercase font-bold text-[#D4AF37] block">Slide Banner Preview</span>
                        <p className="text-[10px] text-gray-200 font-mono truncate max-w-[220px]">{editingSlide.image_url}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingSlide({ ...editingSlide, image_url: '' })}
                        className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-md cursor-pointer transition-colors shrink-0"
                        title="Delete preview image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Image</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="slideActive"
                  checked={editingSlide.is_active !== false}
                  onChange={(e) => setEditingSlide({ ...editingSlide, is_active: e.target.checked })}
                  className="rounded text-[#8F171B] focus:ring-[#8F171B] cursor-pointer"
                />
                <label htmlFor="slideActive" className="text-xs text-gray-700 cursor-pointer font-medium">
                  Active in Hero Slider (will auto-slide on homepage)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowSlideModal(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-xs hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={slideSaving}
                  className="px-5 py-2 bg-[#8F171B] hover:bg-[#580E11] text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {slideSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />}
                  <span>{slideSaving ? 'Saving...' : 'Save Feature Slide'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB: ADMIN SECURITY & PASSWORD RESET */}
      {activeTab === 'password-reset' && (
        <div className="space-y-6 animate-in fade-in duration-200 w-full">
          <div className="bg-white p-6 rounded-2xl border border-[#D4AF37]/40 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
              <div className="p-3 bg-[#8F171B] text-[#D4AF37] rounded-xl shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-[#292321]">Admin Password & Credentials Management</h2>
                <p className="text-xs text-gray-500">
                  Update administrator credentials. Resetting your password automatically updates your account in the Supabase <code className="text-[#8F171B] bg-red-50 px-1.5 py-0.5 rounded font-mono font-bold">admin_users</code> table and Supabase Auth.
                </p>
              </div>
            </div>

            <AdminFooterPasswordReset defaultEmail={currentUser?.email || 'natesajewellery@gmail.com'} />
          </div>
        </div>
      )}

      {/* Admin Page Footer Password Reset Redirect Section */}
      {activeTab !== 'password-reset' && (
        <div className="mt-8 pt-6 border-t-2 border-[#D4AF37]/30 bg-[#292321] text-[#FCF8F1] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#8F171B] text-[#D4AF37] rounded-xl shadow-xs shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#EBDCC5]">
                Admin Password Reset Page
              </h3>
              <p className="text-xs text-gray-400">
                Only accessible from inside the Admin Portal. Updating your password automatically syncs your credentials to the Supabase <code className="text-[#D4AF37] bg-black/40 px-1.5 py-0.5 rounded font-mono">admin_users</code> table.
              </p>
            </div>
          </div>
          {onNavigateToResetPassword && (
            <button
              onClick={onNavigateToResetPassword}
              className="bg-[#8F171B] hover:bg-[#580E11] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-[#D4AF37]/50 shrink-0"
            >
              <KeyRound className="w-4 h-4 text-[#D4AF37]" />
              <span>Go to Password Reset Page →</span>
            </button>
          )}
        </div>
      )}

    </div>
  );
};
