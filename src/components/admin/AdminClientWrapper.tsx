'use client';

import React, { useState } from 'react';
import { AdminPinLogin } from './AdminPinLogin';
import { AdminDashboard } from './AdminDashboard';
import { getAdminDashboardDataAction } from '@/app/actions/adminActions';
import type { AdminSession, AdminDashboardData } from '@/types/app';
import { Loader2 } from 'lucide-react';

interface AdminClientWrapperProps {
  initialSession: AdminSession | null;
  initialData: AdminDashboardData | null;
}

export function AdminClientWrapper({
  initialSession,
  initialData,
}: AdminClientWrapperProps) {
  const [session, setSession] = useState<AdminSession | null>(initialSession);
  const [data, setData] = useState<AdminDashboardData | null>(initialData);
  const [loading, setLoading] = useState(false);

  const handleLoginSuccess = async (newSession: AdminSession) => {
    setSession(newSession);
    setLoading(true);
    try {
      const res = await getAdminDashboardDataAction();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('[AdminClientWrapper] Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutSuccess = () => {
    setSession(null);
    setData(null);
  };

  // If not logged in: display sleek PIN keypad
  if (!session) {
    return <AdminPinLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // If loading data after login
  if (loading || !data) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs font-semibold text-zinc-500">Loading admin control center...</p>
        </div>
      </div>
    );
  }

  // Once logged in: display full dashboard
  return (
    <AdminDashboard
      session={session}
      initialSections={data.sections}
      initialTools={data.tools}
      initialCalendar={data.calendar}
      initialDictionary={data.dictionary}
      initialPins={data.pins || []}
      onLogoutSuccess={handleLogoutSuccess}
    />
  );
}
