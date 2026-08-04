import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Package, Users, Download, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, type Model } from '@/lib/supabase';

export default function AdminPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'fr' | 'en' | 'ar';
  const [models, setModels] = useState<Model[]>([]);
  const [stats, setStats] = useState({ models: 0, designers: 0, clients: 0, downloads: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    const [modelsRes, profilesRes, dlRes] = await Promise.all([
      supabase.from('models').select('*, category:categories(*), designer:profiles!models_designer_id_fkey(*)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('role'),
      supabase.from('downloads').select('*', { count: 'exact', head: true }),
    ]);

    if (modelsRes.data) setModels(modelsRes.data as unknown as Model[]);
    if (profilesRes.data) {
      const profiles = profilesRes.data as { role: string }[];
      setStats({
        models: modelsRes.data?.length || 0,
        designers: profiles.filter((p) => p.role === 'designer').length,
        clients: profiles.filter((p) => p.role === 'client').length,
        downloads: dlRes.count || 0,
      });
    }
    setLoading(false);
  }

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    await supabase.from('models').update({ status }).eq('id', id);
    setModels(models.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this model?')) return;
    await supabase.from('models').delete().eq('id', id);
    setModels(models.filter((m) => m.id !== id));
  };

  const filtered = filter === 'all' ? models : models.filter((m) => m.status === filter);

  const statCards = [
    { icon: Package, label: t('dashboard.totalModels'), value: stats.models, color: 'from-primary-500 to-primary-700' },
    { icon: Users, label: t('dashboard.totalDesigners'), value: stats.designers, color: 'from-accent-500 to-accent-700' },
    { icon: Users, label: t('dashboard.totalClients'), value: stats.clients, color: 'from-success-500 to-success-700' },
    { icon: Download, label: t('dashboard.totalDownloads'), value: stats.downloads, color: 'from-warning-500 to-warning-600' },
  ];

  const filterTabs = [
    { key: 'pending' as const, label: t('dashboard.pendingModels'), icon: Clock },
    { key: 'approved' as const, label: t('dashboard.approvedModels'), icon: CheckCircle },
    { key: 'rejected' as const, label: t('dashboard.rejectedModels'), icon: XCircle },
    { key: 'all' as const, label: 'All', icon: Package },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
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

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`badge-3d cursor-pointer transition-all ${
              filter === tab.key
                ? 'bg-primary-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
            <span className="ml-1 opacity-60">
              {tab.key === 'all' ? models.length : models.filter((m) => m.status === tab.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* Models Table */}
      {loading ? (
        <div className="card-3d p-12 text-center">
          <Package className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 animate-pulse" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-3d p-12 text-center">
          <Package className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-slate-500">No models</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((model) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-3d p-4 flex items-center gap-4"
            >
              <Link to={`/marketplace/${model.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                  <img
                    src={model.images?.[0] || 'https://images.pexels.com/photos/3825572/pexels-photo-3825572.jpeg?auto=compress&cs=tinysrgb&w=200'}
                    alt={model.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate">{model.title}</h3>
                  <p className="text-sm text-slate-500 truncate">
                    {model.designer?.full_name || 'Unknown'} · {model.category?.[`name_${lang}`] || '-'}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-2 flex-shrink-0">
                {model.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateStatus(model.id, 'approved')}
                      className="p-2 rounded-lg bg-success-500/10 text-success-600 hover:bg-success-500/20 transition-all"
                      title={t('dashboard.approve')}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateStatus(model.id, 'rejected')}
                      className="p-2 rounded-lg bg-error-500/10 text-error-600 hover:bg-error-500/20 transition-all"
                      title={t('dashboard.reject')}
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </>
                )}
                {model.status === 'approved' && (
                  <span className="badge-3d bg-success-500/10 text-success-600">
                    <CheckCircle className="w-3 h-3" />
                    {t('dashboard.approvedModels')}
                  </span>
                )}
                {model.status === 'rejected' && (
                  <span className="badge-3d bg-error-500/10 text-error-600">
                    <XCircle className="w-3 h-3" />
                    {t('dashboard.rejectedModels')}
                  </span>
                )}
                <button
                  onClick={() => handleDelete(model.id)}
                  className="p-2 rounded-lg text-error-600 hover:bg-error-500/10 transition-all"
                  title={t('dashboard.delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
