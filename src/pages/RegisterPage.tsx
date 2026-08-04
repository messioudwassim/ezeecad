import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, AlertCircle, Briefcase, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Cube3D from '@/components/Cube3D';
import Logo from '@/components/Logo';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'designer'>('client');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error, needsEmailConfirmation } = await signUp(email, password, fullName, role);
    setLoading(false);
    if (error) {
      setError(error);
    } else if (needsEmailConfirmation) {
      setNeedsConfirmation(true);
    } else {
      navigate('/dashboard');
    }
  };

  if (needsConfirmation) {
    return (
      <div className="min-h-screen bg-mesh pt-16 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card-3d p-10 text-center max-w-md"
        >
          <Mail className="w-14 h-14 mx-auto text-primary-500 mb-4" />
          <h2 className="font-display text-xl font-bold mb-2">
            {t('auth.checkEmailTitle') || 'Vérifiez votre boîte mail'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {t('auth.checkEmailBody') ||
              `Un lien de confirmation a été envoyé à ${email}. Cliquez dessus pour activer votre compte, puis connectez-vous.`}
          </p>
          <Link to="/login" className="btn-3d mt-6 inline-flex">
            {t('auth.goToLogin') || 'Aller à la connexion'}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh pt-16 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:flex flex-col items-center justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-500/20 to-primary-500/20 blur-3xl rounded-full" />
            <Cube3D size={220} className="relative z-10" />
          </div>
          <div className="mt-8">
            <Logo size={48} showText={false} className="justify-center" />
          </div>
          <h2 className="font-display text-2xl font-bold mt-4 text-center">
            {t('hero.cta2')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-center max-w-sm">
            {t('hero.subtitle')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="card-3d p-8"
        >
          <h1 className="font-display text-2xl font-bold mb-1">{t('auth.registerTitle')}</h1>
          <p className="text-sm text-slate-500 mb-6">{t('hero.subtitle')}</p>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-error-500/10 text-error-600 dark:text-error-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('auth.fullName')}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-3d pl-10"
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-3d pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-3d pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('auth.role')}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                    role === 'client'
                      ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span className="text-sm font-medium">{t('auth.client')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('designer')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                    role === 'designer'
                      ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <Briefcase className="w-5 h-5" />
                  <span className="text-sm font-medium">{t('auth.designer')}</span>
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-3d w-full justify-center">
              {loading ? '...' : t('auth.registerBtn')}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {t('auth.haveAccount')}{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              {t('auth.loginLink')}
            </Link>
          </p>
          <Link to="/" className="mt-4 block text-center text-xs text-slate-400 hover:text-primary-500 transition-colors">
            {t('auth.backHome')}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
