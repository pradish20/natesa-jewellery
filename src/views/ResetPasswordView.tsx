import React, { useState, useEffect } from 'react';
import { KeyRound, Lock, CheckCircle2, AlertCircle, RefreshCw, Eye, EyeOff, ArrowLeft, Mail, ShieldCheck, MailCheck } from 'lucide-react';
import { api } from '../services/api';

interface ResetPasswordViewProps {
  onNavigateToAdmin: () => void;
  onNavigateToHome: () => void;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({
  onNavigateToAdmin,
  onNavigateToHome
}) => {
  const [mode, setMode] = useState<'request' | 'update'>('request');
  const [token, setToken] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Check URL hash and query params for Supabase recovery token from the email link
  useEffect(() => {
    const hash = window.location.hash || '';
    const search = window.location.search || '';

    // Extract access_token or token from hash or query
    const hashMatch = hash.match(/(?:access_token|token)=([^&]+)/);
    const searchMatch = search.match(/(?:access_token|token|code)=([^&]+)/);
    const foundToken = hashMatch ? hashMatch[1] : (searchMatch ? searchMatch[1] : '');

    if (foundToken) {
      setToken(foundToken);
      setMode('update');
    } else if (hash.includes('type=recovery') || search.includes('type=recovery')) {
      setMode('update');
    }
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Please enter your administrator email address.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.forgotPassword(cleanEmail);
      setSuccessMsg(res.message || `Password reset link has been dispatched to ${cleanEmail}. Please check your email inbox.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch reset link. Only registered administrator accounts can receive recovery emails.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('Password reset link token is missing or expired. Please click the reset link sent to your registered email inbox.');
      return;
    }

    if (!newPassword || newPassword.trim().length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-type your new password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.resetPassword({
        token,
        newPassword: newPassword.trim()
      });
      setSuccessMsg(res.message || 'Password updated successfully! You can now sign in with your new password.');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onNavigateToAdmin();
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password. Your reset link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-linear-to-b from-[#FAF7F2] to-[#F3EEE6]">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#D4AF37]/50 p-6 sm:p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
        
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-bl-full pointer-events-none" />
        <div className="absolute top-0 left-0 w-24 h-24 bg-[#8F171B]/5 rounded-br-full pointer-events-none" />

        {/* Icon & Title */}
        <div>
          <div className="w-14 h-14 rounded-full bg-[#8F171B] text-[#D4AF37] flex items-center justify-center mx-auto shadow-md mb-3">
            {mode === 'update' ? <KeyRound className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#292321]">
            {mode === 'update' ? 'Set New Admin Password' : 'Admin Password Recovery'}
          </h1>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            {mode === 'update'
              ? 'Enter and confirm your new secure administrator password.'
              : 'Password reset links are restricted and dispatched exclusively to verified administrator accounts.'}
          </p>
        </div>

        {/* Verified Token Badge when arrived via email link */}
        {mode === 'update' && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold mx-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Email Reset Link</span>
          </div>
        )}

        {/* Alerts */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-[#8F171B] p-3 rounded-xl text-xs flex items-start gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span className="font-medium leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3.5 rounded-xl text-xs flex items-start gap-2.5 text-left">
            {mode === 'request' ? (
              <MailCheck className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
            )}
            <div className="space-y-1">
              <span className="font-semibold leading-relaxed block">{successMsg}</span>
              {mode === 'update' && (
                <span className="text-[11px] text-emerald-700 block">Redirecting to Admin Login...</span>
              )}
            </div>
          </div>
        )}

        {/* ================= MODE 1: FORGOT PASSWORD REQUEST ================= */}
        {mode === 'request' && (
          <form onSubmit={handleRequestReset} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-[#292321] uppercase mb-1">
                Registered Administrator Email
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
              <p className="text-[11px] text-gray-400 mt-1">
                Only registered admin accounts will receive the password recovery email.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8F171B] text-white hover:bg-[#580E11] py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
              ) : (
                <KeyRound className="w-4 h-4 text-[#D4AF37]" />
              )}
              <span>{loading ? 'Verifying & Sending...' : 'Send Reset Link to Registered Email'}</span>
            </button>
          </form>
        )}

        {/* ================= MODE 2: SET NEW PASSWORD VIA EMAIL LINK TOKEN ================= */}
        {mode === 'update' && (
          <form onSubmit={handleUpdatePassword} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-[#292321] uppercase mb-1">
                New Password (minimum 6 characters)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
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
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#FCF8F1] border border-[#D4AF37]/40 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:border-[#8F171B] transition-colors font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8F171B] text-white hover:bg-[#580E11] py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
              )}
              <span>{loading ? 'Saving New Password...' : 'Save New Password & Continue'}</span>
            </button>
          </form>
        )}

        {/* Navigation links */}
        <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <button
            type="button"
            onClick={onNavigateToAdmin}
            className="text-gray-500 hover:text-[#8F171B] transition-colors cursor-pointer flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Admin Login</span>
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
