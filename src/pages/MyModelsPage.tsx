import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, type Model } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function MyModelsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModels() {
      if (!user) return;
      const { data } = await supabase
        .from('models')
        .select('*, category:categories(*)')
        .eq('designer_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setModels(data as unknown as Model[]);
      setLoading(false);
    }
    fetchModels();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this model?')) return;
    await supabase.from('models').delete().eq('id', id);
    setModels(models.filter((m) => m.id !== id));
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="badge-3d bg-success-500/10 text-success-600"><CheckCircle className="w-3 h-3" />{t('dashboard.approvedModels')}</span>;
      case 'pending':
        return <span className="badge-3d bg-warning-500/10 text-warning-600"><Clock className="w-3 h-3" />{t('dashboard.pendingModels')}</span>;
      case 'rejected':
        return <span className="badge-3d bg-error-500/10 text-error-600"><XCircle className="w-3 h-3" />{t('dashboard.rejectedModels')}</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Package className="w-12 h-12 text-slate-300 dark:text-slate-700 animate-pulse" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-4">{t('dashboard.myModels')}</h2>

      {models.length === 0 ? (
        <div className="card-3d p-12 text-center">
          <Package className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-slate-500 mb-4">No models yet</p>
          <Link to="/dashboard/upload" className="btn-3d inline-flex">
            {t('dashboard.uploadModel')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((model, i) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-3d overflow-hidden group"
            >
              <Link to={`/marketplace/${model.id}`}>
                <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={model.images?.[0] || 'https://images.pexels.com/photos/3825572/pexels-photo-3825572.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={model.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2">{statusBadge(model.status)}</div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate">{model.title}</h3>
                  <div className="flex items-center justify-between mt-2 text-sm text-slate-500">
                    <span>{model.price === 0 ? t('marketplace.free') : `$${model.price}`}</span>
                    <span>{model.downloads_count} {t('product.downloads').toLowerCase()}</span>
                  </div>
                </div>
              </Link>
              <div className="px-4 pb-4">
                <button
                  onClick={() => handleDelete(model.id)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-error-600 dark:text-error-400 hover:bg-error-500/10 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('dashboard.delete')}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
