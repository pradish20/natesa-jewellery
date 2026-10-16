import React, { useState, useEffect } from 'react';
import {
  Lock, KeyRound, Server, Cloud, Database, LayoutDashboard, Package, Folders,
  ShoppingBag, Settings, Plus, Edit, Trash2, CheckCircle2, AlertCircle, RefreshCw, Upload,
  Copy, Check, ShieldCheck, UserCheck, ExternalLink, ArrowRight, Image as ImageIcon, Sparkles, Link2,
  MapPin, Phone, Eye, EyeOff, Clock, HelpCircle, Info, X, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  AdminUser, Category, CloudinaryConfig, CloudinaryLiveStatus, EnvStatus,
  FeaturedSlide, Order, OrderStatus, Product, RateSettings, StoreContactSettings, SupabaseLiveStatus
} from '../types';
import { api } from '../services/api';
import { formatINR } from '../utils/pricing';
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
}

export const AdminView: React.FC<AdminViewProps> = ({
  products,
  categories,
  orders,
  rates,
  slides,
  storeContact,
  onRefreshData,
  onExitAdmin
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
        sessionStorage.removeItem('natesa_admin_user');
        localStorage.removeItem('natesa_admin_auth');
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
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'slides' | 'store_contact' | 'orders' | 'rates' | 'supabase' | 'cloudinary'>('overview');

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
          sessionStorage.setItem('natesa_admin_user', JSON.stringify(res.user));
          localStorage.removeItem('natesa_admin_auth');
          localStorage.removeItem('natesa_admin_user');
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

  const handleFillDefaultAdmin = () => {
    setAdminEmail('natesajewellery@gmail.com');
    setAdminPassword('natesa123');
    setAuthError('');
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
      sessionStorage.removeItem('natesa_admin_user');
      localStorage.removeItem('natesa_admin_auth');
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

  // Store Contact Settings Handler
  const handleSaveStoreContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSaving(true);
    setContactSaveMsg(null);
    try {
      const res = await api.updateStoreContact(contactForm);
      if (res.success) {
        setContactSaveMsg({ type: 'success', text: 'Store address & phone numbers successfully updated across the website!' });
        onRefreshData();
        setTimeout(() => setContactSaveMsg(null), 5000);
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

  // ---------------- LOGIN SCREEN ----------------
  if (!isAuthenticated) {
    const isSupabaseLive = supabaseStatus?.connected === true;
    const isSupabaseConfigured = supabaseStatus?.configured === true;

    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 bg-linear-to-b from-[#FAF7F2] to-[#F3EEE6]">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#D4AF37]/50 p-6 sm:p-8 shadow-2xl space-y-5 text-center relative overflow-hidden">
          
          {/* Decorative Corner Trim */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-bl-full pointer-events-none" />
          <div className="absolute top-0 left-0 w-24 h-24 bg-[#8F171B]/5 rounded-br-full pointer-events-none" />

          {/* Icon and Title */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#580E11] to-[#8F171B] text-[#D4AF37] flex items-center justify-center mx-auto shadow-lg border border-[#D4AF37]/40 mb-3">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#292321]">Admin Portal</h1>
            <p className="text-xs text-gray-500 mt-1">Natesa Jewellery Management Portal</p>
          </div>

          {/* Live Supabase Connection Badge */}
          <div className="flex items-center justify-between bg-[#FCF8F1] border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs">
            <div className="flex items-center gap-2 text-left">
              <span className={`w-2.5 h-2.5 rounded-full ${isSupabaseLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <div>
                <span className="font-bold text-[#292321] block">
                  {isSupabaseLive ? 'Supabase Auth Active' : 'Standby Mode (Local Auth)'}
                </span>
                <span className="text-[10px] text-gray-500 block truncate max-w-[170px]">
                  {isSupabaseLive ? (supabaseStatus?.url?.replace('https://', '') || 'Connected') : 'Supabase project not connected'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSupabaseConfigMsg(null);
                setShowConnectSupabaseModal(true);
              }}
              className="text-[11px] font-semibold text-[#8F171B] hover:text-[#580E11] underline cursor-pointer"
            >
              {isSupabaseConfigured ? 'Change Project' : 'Connect Supabase'}
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            {authError && (
              <div className="bg-red-50 border border-red-200 text-[#8F171B] p-3.5 rounded-xl text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span className="font-medium leading-relaxed">{authError}</span>
                </div>
                {authError.toLowerCase().includes('not connected') && (
                  <button
                    type="button"
                    onClick={handleFillDefaultAdmin}
                    className="mt-1 text-[11px] bg-red-100 hover:bg-red-200 text-red-900 px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer block"
                  >
                    👉 Click to auto-fill default admin credentials
                  </button>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#292321] uppercase mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="natesajewellery@gmail.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full bg-[#FCF8F1] border border-[#D4AF37]/40 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:border-[#8F171B] transition-colors"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-[#292321] uppercase">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotMsg(null);
                    setForgotEmail(adminEmail);
                    setShowForgotModal(true);
                  }}
                  className="text-[11px] text-[#8F171B] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-[#8F171B] text-white hover:bg-[#580E11] py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
            >
              {loginLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
              ) : (
                <KeyRound className="w-4 h-4 text-[#D4AF37]" />
              )}
              <span>{loginLoading ? 'Authenticating with Supabase...' : 'Sign In to Admin'}</span>
            </button>
          </form>

          {/* Quick Default Admin Login Shortcut */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-left space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Default Store Owner Access
              </span>
              <button
                type="button"
                onClick={handleFillDefaultAdmin}
                className="text-[10px] bg-[#8F171B] text-white hover:bg-[#580E11] px-2 py-0.5 rounded font-semibold cursor-pointer transition-colors"
              >
                Auto Fill
              </button>
            </div>
            <p className="text-[10px] text-amber-800">
              Email: <code className="font-mono font-bold">natesajewellery@gmail.com</code> | Pass: <code className="font-mono font-bold">natesa123</code>
            </p>
          </div>

          {/* Explanatory Collapsible: "Created Table in Supabase but can't login?" */}
          <div className="border border-gray-200 rounded-xl overflow-hidden text-left text-xs bg-gray-50/50">
            <button
              type="button"
              onClick={() => setShowSetupGuide(!showSetupGuide)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-gray-700 hover:text-black font-semibold text-xs cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-1.5 text-gray-700">
                <HelpCircle className="w-4 h-4 text-[#8F171B]" />
                Created table in Supabase? Read this guide
              </span>
              {showSetupGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {showSetupGuide && (
              <div className="px-3.5 pb-3.5 pt-1 space-y-2 text-[11px] text-gray-600 border-t border-gray-100 bg-white">
                <p className="font-semibold text-gray-800">
                  Why does Supabase show &quot;Invalid login credentials&quot; after creating the table?
                </p>
                <p>
                  In Supabase, database tables (like <code className="bg-gray-100 px-1 rounded font-mono">admin_users</code>) only store user roles and permissions. Passwords are created and verified separately in <strong>Supabase Authentication</strong>!
                </p>
                <div className="bg-[#FAF7F2] p-2.5 rounded-lg border border-[#D4AF37]/30 space-y-1.5">
                  <div className="font-bold text-[#8F171B]">Quick 3-Step Setup:</div>
                  <ol className="list-decimal list-inside space-y-1 text-gray-700">
                    <li>
                      <strong>Connect Supabase:</strong> Click &quot;Connect Supabase&quot; above and enter your Project URL and Anon/Service Key.
                    </li>
                    <li>
                      <strong>Create User in Supabase Auth:</strong> In your Supabase Dashboard, go to <em>Authentication &rarr; Users &rarr; Add User &rarr; Create User</em>. Enter your email and password, and check <em>Auto Confirm User?</em>.
                    </li>
                    <li>
                      <strong>Authorize in admin_users:</strong> In Supabase SQL Editor, run:
                      <pre className="mt-1 p-1.5 bg-gray-900 text-amber-200 rounded text-[10px] overflow-x-auto font-mono">
{`INSERT INTO admin_users (id, email, name, role)
VALUES (gen_random_uuid()::text, 'your-email@example.com', 'Admin', 'super_admin')
ON CONFLICT (email) DO UPDATE SET role = 'super_admin';`}
                      </pre>
                    </li>
                  </ol>
                </div>
              </div>
            )}
          </div>

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

        {/* ================= CONNECT SUPABASE MODAL ================= */}
        {showConnectSupabaseModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#D4AF37]/50 space-y-4 text-left">
              <div className="flex justify-between items-center border-b pb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#8F171B]" />
                  <h3 className="font-serif text-lg font-bold text-[#292321]">Connect Supabase Project</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConnectSupabaseModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-gray-600">
                Enter your Supabase project credentials from your Supabase Dashboard (under <em>Project Settings &rarr; API</em>).
              </p>

              {supabaseConfigMsg && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  supabaseConfigMsg.type === 'error'
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  {supabaseConfigMsg.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  )}
                  <span>{supabaseConfigMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleQuickConnectSupabase} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#292321] uppercase mb-1">
                    Supabase Project URL *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://xyzproject.supabase.co"
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    className="w-full bg-[#FCF8F1] border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292321] uppercase mb-1">
                    Supabase Anon or Service Role Key *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="eyJhbGciOi..."
                    value={supabaseKeyInput}
                    onChange={(e) => setSupabaseKeyInput(e.target.value)}
                    className="w-full bg-[#FCF8F1] border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Use the <code>anon</code> or <code>service_role</code> key from your Supabase dashboard.
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConnectSupabaseModal(false)}
                    className="flex-1 py-2 text-xs border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={supabaseSaving}
                    className="flex-1 py-2 text-xs bg-[#8F171B] text-white hover:bg-[#580E11] rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {supabaseSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{supabaseSaving ? 'Verifying...' : 'Connect Supabase'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= FORGOT PASSWORD MODAL ================= */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#D4AF37]/50 space-y-4 text-left">
              <div className="flex justify-between items-center border-b pb-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-[#8F171B]" />
                  <h3 className="font-serif text-lg font-bold text-[#292321]">Reset Password</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-gray-600">
                Enter your authorized admin email address. We will dispatch a password reset link verified through Supabase Authentication.
              </p>

              {forgotMsg && (
                <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  forgotMsg.type === 'error'
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  {forgotMsg.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  )}
                  <span>{forgotMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#292321] uppercase mb-1">
                    Admin Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Enter your admin email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-[#FCF8F1] border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 text-xs border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2 text-xs bg-[#8F171B] text-white hover:bg-[#580E11] rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {forgotLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{forgotLoading ? 'Dispatching...' : 'Send Reset Link'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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

          {onExitAdmin && (
            <button
              onClick={handleLogout}
              className="text-[11px] bg-white/10 hover:bg-white/20 text-[#EBDCC5] px-2.5 py-1 rounded-md transition-colors cursor-pointer ml-2"
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
          { id: 'products', label: 'Products Manager', icon: Package },
          { id: 'categories', label: 'Categories Manager', icon: Folders },
          { id: 'slides', label: 'Feature Images', icon: ImageIcon },
          { id: 'store_contact', label: 'Store Address & Phone', icon: MapPin },
          { id: 'orders', label: 'Orders & Courier', icon: ShoppingBag },
          { id: 'rates', label: 'Live Rates', icon: Settings },
          { id: 'supabase', label: 'Supabase & Database', icon: Database },
          { id: 'cloudinary', label: 'Cloudinary CDN', icon: Cloud }
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

          {/* Quick Management Cards: Feature Images & Store Address/Phone */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            {/* 1. Feature Images Showcase Card */}
            <div className="bg-white p-5 rounded-2xl border border-[#D4AF37]/40 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-[#8F171B]/10 text-[#8F171B]">
                      <ImageIcon className="w-5 h-5 text-[#8F171B]" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-base text-[#292321]">Homepage Feature Images</h4>
                      <p className="text-[11px] text-gray-500">Auto-sliding hero banner with 4.2s smooth transitions</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {slidesList.filter(s => s.is_active).length} Active in Slider
                  </span>
                </div>

                {/* Thumbnails preview */}
                <div className="grid grid-cols-3 gap-2">
                  {slidesList.slice(0, 3).map((sl) => (
                    <div key={sl.id} className="relative aspect-16/10 rounded-lg overflow-hidden border border-[#D4AF37]/30 bg-black/10 group">
                      <img src={sl.image_url} alt={sl.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <span className="absolute bottom-1 left-1.5 text-[9px] text-white font-semibold line-clamp-1">
                        {sl.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
                <button
                  onClick={handleOpenAddSlide}
                  className="bg-[#8F171B] hover:bg-[#580E11] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4 text-[#D4AF37]" />
                  <span>Add Feature Image</span>
                </button>
                <button
                  onClick={() => setActiveTab('slides')}
                  className="text-xs font-semibold text-[#8F171B] hover:text-[#580E11] underline cursor-pointer"
                >
                  Manage All Slides ({slidesList.length}) →
                </button>
              </div>
            </div>

            {/* 2. Store Address & Phone Card */}
            <div className="bg-white p-5 rounded-2xl border border-[#D4AF37]/40 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-[#8F171B]/10 text-[#8F171B]">
                      <MapPin className="w-5 h-5 text-[#8F171B]" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-base text-[#292321]">Store Address & Contact Info</h4>
                      <p className="text-[11px] text-gray-500">Live showroom locations and customer phone numbers</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-[#EBDCC5] text-[#8F171B] px-2 py-0.5 rounded-full">
                    2 Showrooms
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#FCF8F1] border border-[#D4AF37]/30 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#8F171B] block">Main (Krishnagiri)</span>
                    <p className="text-gray-600 line-clamp-2 text-[11px] leading-relaxed">{contactForm.main_branch_address}</p>
                    <p className="font-mono font-semibold text-[#292321] text-[11px]">{contactForm.phone_primary}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#FCF8F1] border border-[#D4AF37]/30 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#8F171B] block">Second (Dharmapuri)</span>
                    <p className="text-gray-600 line-clamp-2 text-[11px] leading-relaxed">{contactForm.second_branch_address}</p>
                    <p className="font-mono font-semibold text-[#292321] text-[11px]">{contactForm.phone_secondary || contactForm.phone_primary}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setActiveTab('store_contact')}
                  className="bg-[#292321] hover:bg-black text-[#EBDCC5] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                >
                  <Edit className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Edit Address & Phone Numbers</span>
                </button>
                <span className="text-[11px] text-gray-400 font-mono">
                  {contactForm.opening_hours}
                </span>
              </div>
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

      {/* TAB: FEATURE IMAGES & SLIDES */}
      {activeTab === 'slides' && (
        <div className="space-y-6 animate-in fade-in duration-200 w-full">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-[#D4AF37]/40 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#8F171B] uppercase tracking-wider">HOMEPAGE HERO SHOWCASE</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Auto-sliding • 4.5s
                </span>
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#292321] mt-0.5">
                Featured Hero Banners & Slider Images
              </h3>
              <p className="text-xs text-gray-500">
                Add, reorder, or edit featured collection slides displayed in the auto-sliding hero banner on your homepage.
              </p>
            </div>

            <button
              onClick={handleOpenAddSlide}
              className="bg-[#8F171B] hover:bg-[#580E11] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all shrink-0"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" />
              <span>Add Feature Image</span>
            </button>
          </div>

          {/* Slides Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {slidesList.map((slide, idx) => (
              <div
                key={slide.id}
                className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between shadow-xs ${
                  slide.is_active ? 'border-[#D4AF37]/50' : 'border-gray-200 opacity-70'
                }`}
              >
                <div>
                  <div className="relative aspect-16/10 bg-gray-900 overflow-hidden group">
                    <img
                      src={slide.image_url}
                      alt={slide.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="bg-black/60 backdrop-blur-xs text-[#D4AF37] text-[10px] font-mono px-2 py-0.5 rounded-md font-bold">
                        #{idx + 1}
                      </span>
                      {slide.badge && (
                        <span className="bg-[#8F171B] text-white text-[10px] px-2 py-0.5 rounded-md font-semibold truncate max-w-[160px]">
                          {slide.badge}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        slide.is_active ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {slide.is_active ? 'Active in Slider' : 'Inactive'}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <h4 className="font-serif font-bold text-white text-base sm:text-lg line-clamp-1">
                        {slide.title}
                      </h4>
                      <p className="text-gray-300 text-xs line-clamp-1 font-light">
                        {slide.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-gray-500 text-[11px]">
                      <span>Target Category:</span>
                      <span className="font-mono font-semibold text-[#8F171B]">{slide.category_slug || 'General'}</span>
                    </div>
                    {slide.cta_text && (
                      <div className="flex justify-between items-center text-gray-500 text-[11px]">
                        <span>Button CTA:</span>
                        <span className="text-[#292321] font-semibold">{slide.cta_text}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-gray-100 flex items-center justify-between gap-2 mt-2">
                  <button
                    onClick={() => handleToggleSlideActive(slide)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                      slide.is_active
                        ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    {slide.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{slide.is_active ? 'Pause' : 'Activate'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditSlide(slide)}
                      className="p-1.5 text-gray-600 hover:text-[#8F171B] hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                      title="Edit slide"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                      title="Delete slide"
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

      {/* TAB: STORE ADDRESS & PHONE NUMBERS */}
      {activeTab === 'store_contact' && (
        <div className="space-y-6 animate-in fade-in duration-200 w-full">
          {/* Header */}
          <div className="bg-white p-5 rounded-2xl border border-[#D4AF37]/40 shadow-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#8F171B] uppercase tracking-wider">SHOWROOM & CONTACT MANAGEMENT</span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#292321]">
              Store Address, Phone Numbers & Business Hours
            </h3>
            <p className="text-xs text-gray-500">
              Update showroom addresses, contact phone numbers, support email, and header announcement across the entire storefront.
            </p>
          </div>

          {contactSaveMsg && (
            <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
              contactSaveMsg.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
            }`}>
              {contactSaveMsg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
              <span>{contactSaveMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveStoreContact} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Card 1: Phone Numbers & WhatsApp */}
              <div className="bg-white p-5 rounded-2xl border border-[#D4AF37]/40 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Phone className="w-4 h-4 text-[#8F171B]" />
                  <h4 className="font-serif font-bold text-base text-[#292321]">Phone Numbers & WhatsApp</h4>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-[#292321] uppercase mb-1">
                      Primary Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+91 94432 53072"
                      value={contactForm.phone_primary}
                      onChange={(e) => setContactForm({ ...contactForm, phone_primary: e.target.value })}
                      className="w-full bg-[#FCF8F1] border border-[#D4AF37]/50 rounded-xl px-3 py-2 font-mono text-xs font-semibold focus:outline-hidden focus:border-[#8F171B]"
                    />
                    <span className="text-[10px] text-gray-500 mt-1 block">Displayed in top header bar, customer call buttons, and checkout receipts.</span>
                  </div>

                  <div>
                    <label className="block font-bold text-[#292321] uppercase mb-1">
                      Secondary Phone / Landline
                    </label>
                    <input
                      type="text"
                      placeholder="+91 99444 00666"
                      value={contactForm.phone_secondary}
                      onChange={(e) => setContactForm({ ...contactForm, phone_secondary: e.target.value })}
                      className="w-full bg-[#FCF8F1] border border-[#D4AF37]/50 rounded-xl px-3 py-2 font-mono text-xs focus:outline-hidden focus:border-[#8F171B]"
                    />
                    <span className="text-[10px] text-gray-500 mt-1 block">Additional phone displayed in footer showroom details.</span>
                  </div>

                  <div>
                    <label className="block font-bold text-[#292321] uppercase mb-1">
                      WhatsApp Consultation Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+91 94432 53072"
                      value={contactForm.phone_whatsapp}
                      onChange={(e) => setContactForm({ ...contactForm, phone_whatsapp: e.target.value })}
                      className="w-full bg-[#FCF8F1] border border-[#D4AF37]/50 rounded-xl px-3 py-2 font-mono text-xs font-semibold focus:outline-hidden focus:border-[#8F171B]"
                    />
                    <span className="text-[10px] text-gray-500 mt-1 block">Used for direct WhatsApp order & custom design consultation chats.</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Email & Opening Hours */}
              <div className="bg-white p-5 rounded-2xl border border-[#D4AF37]/40 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Clock className="w-4 h-4 text-[#8F171B]" />
                  <h4 className="font-serif font-bold text-base text-[#292321]">Email & Operating Hours</h4>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-[#292321] uppercase mb-1">
                      Customer Support Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="natesajewellery@gmail.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full bg-[#FCF8F1] border border-[#D4AF37]/50 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-[#8F171B]"
                    />
                    <span className="text-[10px] text-gray-500 mt-1 block">Shown in website footer and customer order confirmations.</span>
                  </div>

                  <div>
                    <label className="block font-bold text-[#292321] uppercase mb-1">
                      Showroom Operating Hours *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Daily: 9:30 AM – 9:00 PM"
                      value={contactForm.opening_hours}
                      onChange={(e) => setContactForm({ ...contactForm, opening_hours: e.target.value })}
                      className="w-full bg-[#FCF8F1] border border-[#D4AF37]/50 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#8F171B]"
                    />
                    <span className="text-[10px] text-gray-500 mt-1 block">Daily showroom timings shown in footer and contact page.</span>
                  </div>

                  <div>
                    <label className="block font-bold text-[#292321] uppercase mb-1">
                      Top Announcement Bar Notice
                    </label>
                    <input
                      type="text"
                      placeholder="Main Branch: Krishnagiri • Live Gold & Silver Rates Updated Daily"
                      value={contactForm.announcement_text}
                      onChange={(e) => setContactForm({ ...contactForm, announcement_text: e.target.value })}
                      className="w-full bg-[#FCF8F1] border border-[#D4AF37]/50 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#8F171B]"
                    />
                    <span className="text-[10px] text-gray-500 mt-1 block">Marquee announcement text displayed at the very top of all pages.</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Main Branch Address (Krishnagiri) */}
              <div className="bg-white p-5 rounded-2xl border border-[#D4AF37]/40 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <MapPin className="w-4 h-4 text-[#8F171B]" />
                  <h4 className="font-serif font-bold text-base text-[#292321]">Main Showroom Address (Krishnagiri)</h4>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-[#292321] uppercase mb-1">
                      Full Physical Address *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={contactForm.main_branch_address}
                      onChange={(e) => setContactForm({ ...contactForm, main_branch_address: e.target.value })}
                      className="w-full bg-[#FCF8F1] border border-[#D4AF37]/50 rounded-xl p-3 text-xs leading-relaxed focus:outline-hidden focus:border-[#8F171B]"
                      placeholder="Near Old Bus Stand, Gandhi Road, Main Bazaar, Krishnagiri, Tamil Nadu — 635001"
                    />
                    <span className="text-[10px] text-gray-500 mt-1 block">Primary physical branch address featured in the footer, receipt, and contact view.</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Second Branch Address (Dharmapuri) */}
              <div className="bg-white p-5 rounded-2xl border border-[#D4AF37]/40 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <MapPin className="w-4 h-4 text-[#8F171B]" />
                  <h4 className="font-serif font-bold text-base text-[#292321]">Second Branch Address (Dharmapuri)</h4>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-[#292321] uppercase mb-1">
                      Full Physical Address *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={contactForm.second_branch_address}
                      onChange={(e) => setContactForm({ ...contactForm, second_branch_address: e.target.value })}
                      className="w-full bg-[#FCF8F1] border border-[#D4AF37]/50 rounded-xl p-3 text-xs leading-relaxed focus:outline-hidden focus:border-[#8F171B]"
                      placeholder="Bazaar Street, Opposite Town Hall, Near Gandhi Statue, Dharmapuri, Tamil Nadu — 636701"
                    />
                    <span className="text-[10px] text-gray-500 mt-1 block">Second branch address featured in the footer and contact view.</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={contactSaving}
                className="bg-[#8F171B] hover:bg-[#580E11] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {contactSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                )}
                <span>{contactSaving ? 'Saving Changes...' : 'Save Store Address & Contact Settings'}</span>
              </button>
            </div>
          </form>
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
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Image Uploaded Successfully! Hosted on: {testUploadResult.cloud_name || 'Cloudinary'}</span>
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
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'product')}
                    disabled={imageUploadLoading}
                    className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#8F171B] file:text-white hover:file:bg-[#580E11] file:cursor-pointer"
                  />
                  {imageUploadLoading && (
                    <span className="text-[11px] text-[#8F171B] font-bold flex items-center gap-1 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Uploading to CDN...
                    </span>
                  )}
                </div>
                {editingProduct.image_url?.includes('cloudinary.com') && (
                  <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                    ✓ Hosted on Cloudinary CDN
                  </span>
                )}
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
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'category')}
                    disabled={imageUploadLoading}
                    className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#8F171B] file:text-white hover:file:bg-[#580E11] file:cursor-pointer"
                  />
                  {imageUploadLoading && (
                    <span className="text-[11px] text-[#8F171B] font-bold flex items-center gap-1 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Uploading to CDN...
                    </span>
                  )}
                </div>
                {editingCategory.banner_image_url?.includes('cloudinary.com') && (
                  <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                    ✓ Hosted on Cloudinary CDN
                  </span>
                )}
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
                  <div className="mt-2 relative w-full h-32 rounded-xl overflow-hidden border border-[#D4AF37]/40 bg-gray-900">
                    <img
                      src={editingSlide.image_url}
                      alt="Slide preview"
                      className="w-full h-full object-cover"
                    />
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

    </div>
  );
};
