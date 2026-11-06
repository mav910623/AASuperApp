import { Suspense } from 'react';
import { connection } from 'next/server';
import { getSessionAction, getAdminDashboardDataAction } from '@/app/actions/adminActions';
import { AdminClientWrapper } from '@/components/admin/AdminClientWrapper';
import type { Metadata } from 'next';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Control Center - Team Hub',
  description: 'Team Hub management portal for sections, tools, calendar, translations, and team access PINs',
};

async function AdminContent() {
  await connection();
  const sessionRes = await getSessionAction();
  const session = sessionRes.success && sessionRes.session ? sessionRes.session : null;

  let dashboardData = null;
  if (session) {
    const dataRes = await getAdminDashboardDataAction();
    if (dataRes.success && dataRes.data) {
      dashboardData = dataRes.data;
    }
  }

  return (
    <AdminClientWrapper
      initialSession={session}
      initialData={dashboardData}
    />
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex flex-col items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-xs font-semibold text-zinc-500">Checking credentials...</p>
          </div>
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}


