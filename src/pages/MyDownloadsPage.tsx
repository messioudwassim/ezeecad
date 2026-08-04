import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, type Model } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function MyDownloadsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDownloads() {
      if (!user) return;
      const { data } = await supabase
        .from('downloads')
        .select('model:models(*, category:categories(*), designer:profiles!models_designer_id_fkey(*))')
        .eq('user_id', user.id)
        .order('downloaded_at', { ascending: false });
      if (data) {
        const mapped = (data as unknown as { model: Model }[]).map((d) => d.model).filter(Boolean);
        setModels(mapped);
      }
      setLoading(false);
    }
    fetchDownloads();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Download className="w-12 h-12 text-slate-300 dark:text-slate-700 animate-pulse" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-4">{t('dashboard.myDownloads')}</h2>

      {models.length === 0 ? (
        <div className="card-3d p-12 text-center">
          <Download className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-slate-500 mb-4">No downloads yet</p>
          <Link to="/marketplace" className="btn-3d inline-flex">
            {t('nav.marketplace')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {models.map((model) => (
            <div key={model.id} className="card-3d p-4 flex items-center gap-4 group">
              <Link to={`/marketplace/${model.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                  <img
                    src={model.images?.[0] || 'https://images.pexels.com/photos/3825572/pexels-photo-3825572.jpeg?auto=compress&cs=tinysrgb&w=200'}
                    alt={model.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate">{model.title}</h3>
                  <p className="text-sm text-slate-500 truncate">
                    {model.designer?.full_name || t('product.designer')}
                  </p>
                </div>
              </Link>
              {model.file_url && (
                <a
                  href={model.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost-3d text-sm flex-shrink-0"
                >
                  <LinkIcon className="w-4 h-4" />
                  {t('marketplace.download')}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
