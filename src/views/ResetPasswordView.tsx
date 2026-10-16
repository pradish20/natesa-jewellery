import React, { useState, useEffect } from 'react';
import { KeyRound, CheckCircle2, AlertCircle, RefreshCw, Eye, EyeOff, ArrowLeft, ShieldCheck, Mail } from 'lucide-react';
import { api } from '../services/api';

interface ResetPasswordViewProps {
  onNavigateToAdmin: () => void;
  onNavigateToHome: () => void;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({
  onNavigateToAdmin,
  onNavigateToHome
}) => {
  const [token, setToken] = useState<string>('');
  const [email, setEmail] = useState<string>('natesajewellery@gmail.com');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Check URL hash and query params for recovery token if arrived via Supabase email link
  useEffect(() => {
    const hash = window.location.hash || '';
    const search = window.location.search || '';

    const hashMatch = hash.match(/(?:access_token|token)=([^&]+)/);
    const searchMatch = search.match(/(?:access_token|token|code)=([^&]+)/);
    const foundToken = hashMatch ? hashMatch[1] : (searchMatch ? searchMatch[1] : '');

    if (foundToken) {
      setToken(foundToken);
    }
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPassword = newPassword.trim();

    if (!cleanEmail) {
      setErrorMsg('Please enter your registered administrator email address.');
      return;
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (cleanPassword !== confirmPassword.trim()) {
      setErrorMsg('Passwords do not match. Please re-type your new password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.adminUpdatePassword({
        token: token || undefined,
        email: cleanEmail,
        newPassword: cleanPassword
      });

      setSuccessMsg(res.message || 'Administrator password updated successfully! Credentials automatically saved to Supabase admin_users table.');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        onNavigateToAdmin();
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password. Password resets are strictly restricted to registered admin accounts.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-linear-to-b from-[#FAF7F2] to-[#F3EEE6]">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#D4AF37]/50 p-6 sm:p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
        
        {/* Decorative corner glows */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-bl-full pointer-events-none" />
        <div className="absolute top-0 left-0 w-24 h-24 bg-[#8F171B]/5 rounded-br-full pointer-events-none" />

        {/* Badge & Title */}
        <div className="space-y-2">
          <div className="w-14 h-14 rounded-full bg-[#8F171B] text-[#D4AF37] flex items-center justify-center mx-auto shadow-md mb-2">
            <KeyRound className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#8F171B]/10 text-[#8F171B] border border-[#8F171B]/20 rounded-full text-[11px] font-bold tracking-wide uppercase mx-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8F171B]" />
            <span>Admin Portal Password Reset Page</span>
          </div>

          <h1 className="font-serif text-2xl font-bold text-[#292321] pt-1">
            Admin Password Reset
          </h1>
          <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
            Enter your new password below. Updating your credentials automatically synchronizes your account to the Supabase <code className="text-[#8F171B] font-mono font-bold bg-red-50 px-1 py-0.5 rounded">admin_users</code> table.
          </p>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-[#8F171B] p-3.5 rounded-xl text-xs flex items-start gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span className="font-medium leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-4 rounded-2xl text-xs flex items-start gap-3 text-left shadow-xs">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-emerald-900 leading-relaxed block">{successMsg}</span>
              <span className="text-[11px] text-emerald-700 block">Redirecting to Admin Portal...</span>
            </div>
          </div>
        )}

        {/* Reset Form */}
        <form onSubmit={handleUpdatePassword} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-[#292321] uppercase mb-1">
              Admin Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="natesajewellery@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FCF8F1] border border-[#D4AF37]/40 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:border-[#8F171B] transition-colors"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#292321] uppercase mb-1">
              New Password (min. 6 characters)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

          <div>
            <label className="block text-xs font-bold text-[#292321] uppercase mb-1">
              Confirm New Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#FCF8F1] border border-[#D4AF37]/40 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:border-[#8F171B] transition-colors font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8F171B] text-white hover:bg-[#580E11] py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
            ) : (
              <KeyRound className="w-4 h-4 text-[#D4AF37]" />
            )}
            <span>{loading ? 'Updating Password...' : 'Save New Password & Sync to Supabase'}</span>
          </button>
        </form>

        {/* Navigation links */}
        <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <button
            type="button"
            onClick={onNavigateToAdmin}
            className="text-[#8F171B] hover:underline font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Admin Portal</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToHome}
            className="text-gray-400 hover:text-[#292321] transition-colors cursor-pointer"
          >
            Return to Storefront
          </button>
        </div>
      </div>
    </div>
  );
};
