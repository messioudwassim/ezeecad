import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Link as LinkIcon, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, type Model } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { generateInvoicePdf } from '@/lib/invoice';

type DownloadRow = {
  model: Model;
  downloaded_at: string;
};

type OrderInfo = { id: string; amount: number; created_at: string };

export default function MyDownloadsPage() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [rows, setRows] = useState<DownloadRow[]>([]);
  const [ordersByModel, setOrdersByModel] = useState<Record<string, OrderInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDownloads() {
      if (!user) return;

      const { data } = await supabase
        .from('downloads')
        .select('downloaded_at, model:models(*, category:categories(*), designer:profiles!models_designer_id_fkey(*))')
        .eq('user_id', user.id)
        .order('downloaded_at', { ascending: false });

      const mapped = ((data as unknown as DownloadRow[]) || []).filter((d) => d.model);
      setRows(mapped);

      // Pour les modèles payants, on récupère le montant réellement payé
      // (peut différer du prix actuel du modèle s'il a changé depuis).
      const { data: orders } = await supabase
        .from('orders')
        .select('id, model_id, amount, created_at')
        .eq('user_id', user.id)
        .eq('status', 'paid');

      const map: Record<string, OrderInfo> = {};
      (orders || []).forEach((o) => {
        map[o.model_id] = { id: o.id, amount: o.amount, created_at: o.created_at };
      });
      setOrdersByModel(map);

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

      {rows.length === 0 ? (
        <div className="card-3d p-12 text-center">
          <Download className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-slate-500 mb-4">{t('dashboard.noDownloads')}</p>
          <Link to="/marketplace" className="btn-3d inline-flex">
            {t('nav.marketplace')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map(({ model, downloaded_at }) => {
            const order = ordersByModel[model.id];
            const date = order?.created_at || downloaded_at;
            return (
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
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>{new Date(date).toLocaleDateString('fr-DZ')}</span>
                      <span className="font-semibold text-primary-600 dark:text-primary-400">
                        {order ? `${order.amount.toLocaleString('fr-DZ')} DA` : t('dashboard.free')}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {order && (
                    <button
                      onClick={() =>
                        generateInvoicePdf({
                          orderId: order.id,
                          date: order.created_at,
                          amount: order.amount,
                          currency: 'DZD',
                          modelTitle: model.title,
                          buyerName: profile?.full_name || '',
                          buyerEmail: user?.email || '',
                        })
                      }
                      className="btn-ghost-3d text-sm"
                      title={t('dashboard.invoice')}
                    >
                      <FileText className="w-4 h-4" />
                      {t('dashboard.invoice')}
                    </button>
                  )}
                  {model.file_url && (
                    <a
                      href={model.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost-3d text-sm"
                    >
                      <LinkIcon className="w-4 h-4" />
                      {t('marketplace.download')}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}