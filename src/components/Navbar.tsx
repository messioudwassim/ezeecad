import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Menu, X, Moon, Sun, Globe, LayoutDashboard, LogOut } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';

export default function Navbar() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { lang, changeLang } = useLang();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const langLabels: Record<string, string> = { fr: 'FR', en: 'EN', ar: 'AR' };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200/50 dark:border-slate-800/50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Logo size={36} />
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link to="/" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            {t('nav.home')}
          </Link>
          <Link to="/marketplace" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            {t('nav.marketplace')}
          </Link>
          {user && (
            <Link to="/dashboard" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              {t('nav.dashboard')}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              aria-label="Language"
            >
              <Globe className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-32 rounded-xl glass shadow-xl py-1">
                {(['fr', 'en', 'ar'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => { changeLang(l); setLangOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all ${
                      lang === l
                        ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {langLabels[l]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/dashboard" className="btn-ghost-3d text-sm">
                <LayoutDashboard className="w-4 h-4" />
                {profile?.full_name?.split(' ')[0] || t('nav.dashboard')}
              </Link>
              <button onClick={handleSignOut} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" aria-label="Logout">
                <LogOut className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="btn-ghost-3d text-sm">
                {t('nav.login')}
              </Link>
              <Link to="/register" className="btn-3d text-sm">
                {t('nav.register')}
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="md:hidden glass border-t border-slate-200/50 dark:border-slate-800/50 px-4 py-4 space-y-2">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">{t('nav.home')}</Link>
          <Link to="/marketplace" onClick={() => setMobileOpen(false)} className="block px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">{t('nav.marketplace')}</Link>
          {user && <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">{t('nav.dashboard')}</Link>}
          {!user && (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-ghost-3d flex-1 text-sm justify-center">{t('nav.login')}</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-3d flex-1 text-sm justify-center">{t('nav.register')}</Link>
            </div>
          )}
          {user && (
            <button onClick={handleSignOut} className="btn-ghost-3d w-full text-sm justify-center">{t('nav.logout')}</button>
          )}
        </div>
      )}
    </header>
  );
}

