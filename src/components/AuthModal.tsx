/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Screen 2 & 3: Registration and Login Modal with Validation & Demo Quick-Fill
 */

import React, { useState } from 'react';
import { Lock, Mail, User, ShieldCheck, CheckCircle2, AlertCircle, X, KeyRound } from 'lucide-react';
import { UserAccount } from '../types/phonefinder';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register' && !termsAccepted) {
      setError('Please accept the Terms of Service and Privacy Policy to proceed.');
      return;
    }

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters with appropriate entropy.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        id: 'usr_sec_98214',
        email: email.trim().toLowerCase(),
        fullName: name.trim() || 'Alex Morgan',
        role: 'regular_user',
        createdAt: Date.now(),
        isVerified: true,
        twoFactorEnabled: true,
      });
      onClose();
    }, 600);
  };

  const handleQuickDemoLogin = () => {
    setEmail('alex.morgan@example.com');
    setPassword('SecurePassword123!');
    setName('Alex Morgan');
    setTermsAccepted(true);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        id: 'usr_sec_98214',
        email: 'alex.morgan@example.com',
        fullName: 'Alex Morgan',
        role: 'regular_user',
        createdAt: Date.now() - 30 * 24 * 3600 * 1000,
        isVerified: true,
        twoFactorEnabled: true,
      });
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 text-base">PhoneFinder Security</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          End-to-end device access boundary protection
        </p>

        {/* Quick Demo Fill Banner */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs flex items-center justify-between gap-2">
          <div>
            <div className="font-semibold text-blue-900">Instant Demo Evaluation</div>
            <div className="text-[11px] text-blue-700">Pre-loads verified test account with sample devices</div>
          </div>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0"
          >
            Sign In Instantly
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex border-b border-slate-200 mb-4">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold border-b-2 text-center transition-colors ${
              mode === 'login' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold border-b-2 text-center transition-colors ${
              mode === 'register' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2.5 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Full Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {mode === 'register' && (
            <label className="flex items-start gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 mt-0.5"
              />
              <span className="text-[11px] text-slate-600">
                I accept the Privacy Policy, explicit location collection terms, and confirm I am the lawful device owner.
              </span>
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors shadow-sm mt-2"
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Verified Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
