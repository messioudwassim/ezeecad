import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Package, Download, TrendingUp, Clock } from 'lucide-react';
import { supabase, type Model } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/ProductCard';

export default function DashboardHome() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [models, setModels] = useState<Model[]>([]);
  const [downloads, setDownloads] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setLoading(true);

      if (profile?.role === 'designer' || profile?.role === 'admin') {
        const { data } = await supabase
          .from('models')
          .select('*, category:categories(*), designer:profiles!models_designer_id_fkey(*)')
          .eq('designer_id', user.id)
          .order('created_at', { ascending: false });
        if (data) {
          setModels(data as unknown as Model[]);
          const total = (data as unknown as Model[]).reduce((sum, m) => sum + m.downloads_count, 0);
          setTotalDownloads(total);
        }
      }

      const { count } = await supabase
        .from('downloads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      setDownloads(count || 0);

      setLoading(false);
    }
    fetchData();
  }, [user, profile]);

  const stats = profile?.role === 'designer' || profile?.role === 'admin'
    ? [
        { icon: Package, label: t('dashboard.totalModels'), value: models.length, color: 'from-primary-500 to-primary-700' },
        { icon: Download, label: t('dashboard.totalDownloads'), value: totalDownloads, color: 'from-accent-500 to-accent-700' },
        { icon: Clock, label: t('dashboard.pendingModels'), value: models.filter((m) => m.status === 'pending').length, color: 'from-warning-500 to-warning-600' },
        { icon: TrendingUp, label: t('dashboard.approvedModels'), value: models.filter((m) => m.status === 'approved').length, color: 'from-success-500 to-success-700' },
      ]
    : [
        { icon: Download, label: t('dashboard.totalDownloads'), value: downloads, color: 'from-primary-500 to-primary-700' },
      ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-3d p-5"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold font-display">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Models (designer) */}
      {(profile?.role === 'designer' || profile?.role === 'admin') && (
        <div>
          <h2 className="font-display text-xl font-bold mb-4">{t('dashboard.myModels')}</h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card-3d animate-pulse p-4">
                  <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl mb-3" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : models.length === 0 ? (
            <div className="card-3d p-12 text-center">
              <Package className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-slate-500">No models yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {models.slice(0, 6).map((model, i) => (
                <ProductCard key={model.id} model={model} index={i} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
