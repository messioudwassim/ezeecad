import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-mesh pt-16">
      <div className="flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0 min-h-[calc(100vh-4rem)]">
          <div className="p-4 sm:p-6 lg:p-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden mb-4 p-2 rounded-lg glass"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                {t('dashboard.welcome', { name: profile?.full_name?.split(' ')[0] || 'User' })}
              </h1>
            </div>

            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
