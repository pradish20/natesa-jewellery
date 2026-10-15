/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SearchModal } from './components/SearchModal';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderReceiptModal } from './components/OrderReceiptModal';

import { HomeView } from './views/HomeView';
import { CategoryCatalogView } from './views/CategoryCatalogView';
import { CollectionsView } from './views/CollectionsView';
import { AboutView } from './views/AboutView';
import { ContactView } from './views/ContactView';
import { OrderTrackingView } from './views/OrderTrackingView';
import { AdminView } from './views/AdminView';

import { CartItem, Category, Order, Product, RateSettings } from './types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_RATES } from './data/initialData';
import { calculatePriceBreakdown } from './utils/pricing';
import { api } from './services/api';

export default function App() {
  // Navigation: Check if URL path is /admin
  const getInitialTab = (): string => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || hash === '#/admin' || hash === '#admin') {
        return 'admin';
      }
    }
    return 'home';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | undefined>(undefined);

  // Core Data
  const [rates, setRates] = useState<RateSettings>(INITIAL_RATES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [orders, setOrders] = useState<Order[]>([]);

  // Drawers & Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Cart & Wishlist State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('natesa_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('natesa_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save Cart & Wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('natesa_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('natesa_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to persist wishlist:', e);
    }
  }, [wishlist]);

  // Initial Data Fetching from Server
  const refreshAllData = async () => {
    try {
      const [fetchedRates, fetchedProducts, fetchedCategories, fetchedOrders] = await Promise.all([
        api.getRates().catch(() => INITIAL_RATES),
        api.getProducts().catch(() => INITIAL_PRODUCTS),
        api.getCategories().catch(() => INITIAL_CATEGORIES),
        api.getOrders().catch(() => [])
      ]);

      setRates(fetchedRates);
      setProducts(fetchedProducts);
      setCategories(fetchedCategories);
      setOrders(fetchedOrders);
    } catch (err) {
      console.error('Error syncing store data:', err);
    }
  };

  useEffect(() => {
    refreshAllData();

    // Listen for browser URL changes (e.g. typing /admin, back/forward buttons)
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || hash === '#/admin' || hash === '#admin') {
        setActiveTab('admin');
      } else {
        // Exited admin route: clear session
        try {
          sessionStorage.removeItem('natesa_admin_auth');
          sessionStorage.removeItem('natesa_admin_user');
          localStorage.removeItem('natesa_admin_auth');
          localStorage.removeItem('natesa_admin_user');
        } catch {
          // Ignore
        }
        setActiveTab((prev) => (prev === 'admin' ? 'home' : prev));
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Update computed prices in cart whenever rates change
  const computedCartItems: CartItem[] = cartItems.map((item) => {
    const breakdown = calculatePriceBreakdown(
      item.product.net_weight,
      item.product.metal_type,
      item.product.wastage_percent,
      item.product.making_charges,
      rates
    );

    return {
      ...item,
      computed_price: breakdown.final_price,
      computed_breakdown: breakdown
    };
  });

  // Cart Operations
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((ci) => ci.product.id === product.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }
      const breakdown = calculatePriceBreakdown(
        product.net_weight,
        product.metal_type,
        product.wastage_percent,
        product.making_charges,
        rates
      );
      return [
        ...prev,
        {
          product,
          quantity,
          computed_price: breakdown.final_price,
          computed_breakdown: breakdown
        }
      ];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Wishlist Toggle
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((w) => w.id === product.id);
      if (exists) return prev.filter((w) => w.id !== product.id);
      return [...prev, product];
    });
  };

  // Tab Navigation Helper
  const handleNavigateTab = (tab: string, categorySlug?: string) => {
    if (activeTab === 'admin' && tab !== 'admin') {
      try {
        sessionStorage.removeItem('natesa_admin_auth');
        sessionStorage.removeItem('natesa_admin_user');
        localStorage.removeItem('natesa_admin_auth');
        localStorage.removeItem('natesa_admin_user');
      } catch {
        // Ignore
      }
    }

    setActiveTab(tab);
    if (categorySlug) {
      setSelectedCategorySlug(categorySlug);
    } else {
      setSelectedCategorySlug(undefined);
    }

    // Keep URL clean and sync /admin route
    if (tab === 'admin') {
      if (window.location.pathname !== '/admin') {
        window.history.pushState(null, '', '/admin');
      }
    } else {
      if (window.location.pathname === '/admin') {
        window.history.pushState(null, '', '/');
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Order Placement
  const handleOrderPlaced = (order: Order) => {
    setCartItems([]);
    setIsCheckoutOpen(false);
    setConfirmedOrder(order);
    refreshAllData();
  };

  return (
    <div className="min-h-screen bg-[#FCF8F1] text-[#292321] flex flex-col justify-between font-sans selection:bg-[#8F171B] selection:text-[#EBDCC5]">
      
      {/* Top Header Navigation */}
      <Header
        rates={rates}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        wishlistCount={wishlist.length}
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            products={products}
            categories={categories}
            rates={rates}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeTab === 'gold' && (
          <CategoryCatalogView
            products={products}
            categories={categories}
            rates={rates}
            wishlist={wishlist}
            selectedCategorySlug={selectedCategorySlug}
            isSilverOnly={false}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onSelectProduct={(p) => setSelectedProduct(p)}
          />
        )}

        {activeTab === 'silver' && (
          <CategoryCatalogView
            products={products}
            categories={categories}
            rates={rates}
            wishlist={wishlist}
            selectedCategorySlug="silver-kolusu-anklets"
            isSilverOnly={true}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onSelectProduct={(p) => setSelectedProduct(p)}
          />
        )}

        {activeTab === 'collections' && (
          <CollectionsView
            products={products}
            rates={rates}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onSelectProduct={(p) => setSelectedProduct(p)}
          />
        )}

        {activeTab === 'about' && <AboutView />}

        {activeTab === 'contact' && <ContactView />}

        {activeTab === 'tracking' && (
          <OrderTrackingView
            onOpenReceipt={(order) => setConfirmedOrder(order)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminView
            products={products}
            categories={categories}
            orders={orders}
            rates={rates}
            onRefreshData={refreshAllData}
            onExitAdmin={() => handleNavigateTab('home')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigateTab={handleNavigateTab}
      />

      {/* Drawers & Modals */}
      <ProductDetailModal
        product={selectedProduct}
        rates={rates}
        isWishlisted={selectedProduct ? wishlist.some((w) => w.id === selectedProduct.id) : false}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
      />

      <CartDrawer
        isOpen={isCartOpen}
        cartItems={computedCartItems}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={(discount) => {
          setCouponDiscount(discount);
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        wishlistItems={wishlist}
        rates={rates}
        onClose={() => setIsWishlistOpen(false)}
        onRemoveFromWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
      />

      <SearchModal
        isOpen={isSearchOpen}
        products={products}
        rates={rates}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        cartItems={computedCartItems}
        couponDiscount={couponDiscount}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderPlaced={handleOrderPlaced}
      />

      <OrderReceiptModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
      />

    </div>
  );
}
