import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { User, Save, CheckCircle, AlertCircle, Camera } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !user) return;
    const file = e.target.files[0];
    const ext = file.name.split('.').pop();
    const path = `avatars/${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('model-images').upload(path, file);
    if (!upErr) {
      const { data: urlData } = supabase.storage.from('model-images').getPublicUrl(path);
      setAvatarUrl(urlData.publicUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ full_name: fullName, avatar_url: avatarUrl })
      .eq('id', user.id);

    if (updateErr) {
      setError(updateErr.message);
    } else {
      setSuccess(true);
      await refreshProfile();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-3d p-6 md:p-8"
      >
        <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-primary-500" />
          {t('sidebar.profile')}
        </h2>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-error-500/10 text-error-600 dark:text-error-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-success-500/10 text-success-600 text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            Profile updated successfully
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-2xl overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  fullName?.[0]?.toUpperCase() || 'U'
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer hover:border-primary-400 transition-all">
                <Camera className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <div>
              <p className="text-sm text-slate-500">{profile?.role?.toUpperCase()}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t('auth.fullName')}</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-3d"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t('auth.email')}</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="input-3d opacity-60 cursor-not-allowed"
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-3d flex-1 justify-center">
              <Save className="w-4 h-4" />
              {loading ? '...' : t('dashboard.approve')}
            </button>
            <button
              type="button"
              onClick={() => signOut()}
              className="btn-ghost-3d text-error-600 dark:text-error-400"
            >
              {t('nav.logout')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
