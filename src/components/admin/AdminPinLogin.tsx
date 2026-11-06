'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Lock, Unlock, ArrowLeft, Delete, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { verifyPinAction } from '@/app/actions/adminActions';
import { AALogo } from '@/components/AALogo';
import type { AdminSession } from '@/types/app';

const KEYPAD_BUTTONS = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '7', value: '7' },
  { label: '8', value: '8' },
  { label: '9', value: '9' },
  { label: 'C', value: 'clear', isAction: true },
  { label: '0', value: '0' },
  { label: '⌫', value: 'backspace', isAction: true },
];

interface AdminPinLoginProps {
  onLoginSuccess: (session: AdminSession) => void;
}

export function AdminPinLogin({ onLoginSuccess }: AdminPinLoginProps) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const handleSubmit = useCallback(
    async (pinToVerify?: string) => {
      const targetPin = (pinToVerify !== undefined ? pinToVerify : pin).trim();
      if (!targetPin) {
        setError('Please enter your 6-digit access PIN');
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await verifyPinAction(targetPin);
        if (res.success && res.session) {
          onLoginSuccess(res.session);
        } else {
          const errMsg = !res.success ? res.error : 'Invalid or deactivated PIN';
          setError(errMsg);
          setShake(true);
          setTimeout(() => setShake(false), 500);
          setPin('');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication service error');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      } finally {
        setLoading(false);
      }
    },
    [pin, onLoginSuccess]
  );

  const handleDigit = useCallback(
    (digit: string) => {
      if (loading) return;
      setError(null);
      setPin((prev) => {
        if (prev.length >= 8) return prev;
        const next = prev + digit;
        if (next.length === 6) {
          setTimeout(() => handleSubmit(next), 80);
        }
        return next;
      });
    },
    [loading, handleSubmit]
  );

  const handleBackspace = useCallback(() => {
    if (loading) return;
    setError(null);
    setPin((prev) => prev.slice(0, -1));
  }, [loading]);

  const handleClear = useCallback(() => {
    if (loading) return;
    setError(null);
    setPin('');
  }, [loading]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleBackspace, handleSubmit, handleClear]);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm mb-6 flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>View Live App</span>
        </Link>
        <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">
          Secure Portal
        </span>
      </div>

      <div
        className={`w-full max-w-sm rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 transition-all ${
          shake ? 'animate-shake' : ''
        }`}
      >
        <div className="flex flex-col items-center text-center mb-6">
          <AALogo size="lg" className="mb-3 shadow-lg shadow-blue-900/25" />
          <h1 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Admin Control Center
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Enter your 6-digit access PIN to unlock the dashboard
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="mb-6 flex flex-col items-center">
          <div className="flex items-center justify-center gap-3">
            {[0, 1, 2, 3, 4, 5].map((idx) => (
              <div
                key={idx}
                className={`h-4 w-4 rounded-full transition-all duration-200 ${
                  pin.length > idx
                    ? 'bg-amber-500 scale-110 shadow-sm shadow-amber-500/40'
                    : 'border-2 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-3 py-1.5 rounded-full border border-red-200 dark:border-red-900/60">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Sleek Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-5">
          {KEYPAD_BUTTONS.map((btn) => {
            const isBack = btn.value === 'backspace';
            const isClr = btn.value === 'clear';
            const handleClick = () => {
              if (isBack) handleBackspace();
              else if (isClr) handleClear();
              else handleDigit(btn.value);
            };

            return (
              <button
                key={btn.value}
                type="button"
                onClick={handleClick}
                disabled={loading}
                aria-label={btn.label}
                className={`flex h-13 sm:h-14 items-center justify-center rounded-2xl text-lg sm:text-xl font-semibold transition-all active:scale-95 disabled:opacity-50 select-none ${
                  btn.isAction
                    ? 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    : 'bg-zinc-50 dark:bg-zinc-800/90 text-zinc-950 dark:text-zinc-50 border border-zinc-200/80 dark:border-zinc-700/80 hover:bg-white dark:hover:bg-zinc-700 shadow-sm'
                }`}
              >
                {isBack ? <Delete className="w-5 h-5" /> : btn.label}
              </button>
            );
          })}
        </div>

        {/* Unlock Action Button */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={loading || pin.length === 0}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/25 hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying PIN...</span>
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              <span>Unlock Dashboard</span>
            </>
          )}
        </button>

        {/* Security Notice */}
        <div className="mt-5 pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80 text-center">
          <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            Protected Admin Portal • Authorized Access Only
          </p>
        </div>
      </div>
    </div>
  );
}
