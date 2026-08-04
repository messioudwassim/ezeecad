import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Download,
  Upload,
  Shield,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const location = useLocation();

  const clientLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('sidebar.dashboard') },
    { to: '/marketplace', icon: ShoppingBag, label: t('sidebar.marketplace') },
    { to: '/dashboard/downloads', icon: Download, label: t('sidebar.myDownloads') },
    { to: '/dashboard/profile', icon: User, label: t('sidebar.profile') },
  ];

  const designerLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('sidebar.dashboard') },
    { to: '/dashboard/my-models', icon: Package, label: t('sidebar.myModels') },
    { to: '/dashboard/upload', icon: Upload, label: t('sidebar.upload') },
    { to: '/dashboard/profile', icon: User, label: t('sidebar.profile') },
  ];

  const adminLinks = [
    ...designerLinks,
    { to: '/dashboard/admin', icon: Shield, label: t('sidebar.admin') },
  ];

  const links = [
    ...(profile?.role === 'admin' ? adminLinks : profile?.role === 'designer' ? designerLinks : clientLinks),
  ];

  const NavLinks = () => (
    <div className="p-4 space-y-1">
      {links.map((link) => {
        const isActive = location.pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            onClick={onClose}
            className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
              isActive
                ? 'bg-gradient-to-r from-primary-500/10 to-accent-500/10 text-primary-600 dark:text-primary-400'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary-500 to-accent-500 rounded-r-full"
              />
            )}
            <link.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </div>
  );

  const ProfileCard = () => (
    <div className="p-4">
      <div className="rounded-xl p-3 bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
            {profile?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{profile?.full_name || 'User'}</p>
            <p className="text-xs text-slate-500 capitalize">{profile?.role || 'client'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar: part of the normal document flow, no fixed positioning
          so it can never overlap the main content or get out of sync with it. */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] glass border-r border-slate-200/50 dark:border-slate-800/50 overflow-y-auto">
        <div className="flex-1">
          <NavLinks />
        </div>
        <ProfileCard />
      </aside>

      {/* Mobile sidebar: overlay drawer, only rendered/interactive below lg */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-16 bottom-0 z-50 w-64 glass border-r border-slate-200/50 dark:border-slate-800/50 overflow-y-auto lg:hidden flex flex-col"
      >
        <div className="flex-1">
          <NavLinks />
        </div>
        <ProfileCard />
      </motion.aside>
    </>
  );
}
