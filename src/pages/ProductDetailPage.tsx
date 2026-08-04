import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Download, ArrowLeft, CheckCircle, AlertCircle, Box } from 'lucide-react';
import { supabase, type Model } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'fr' | 'en' | 'ar';
  const navigate = useNavigate();
  const { user } = useAuth();
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModel() {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('models')
        .select('*, category:categories(*), designer:profiles!models_designer_id_fkey(*)')
        .eq('id', id)
        .maybeSingle();
      if (error || !data) {
        setError('Model not found');
      } else {
        setModel(data as unknown as Model);
      }
      setLoading(false);
    }
    fetchModel();
  }, [id]);

  const handleDownload = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!model) return;
    setDownloading(true);
    setError(null);

    try {
      const { error: dlError } = await supabase.from('downloads').upsert({
        user_id: user.id,
        model_id: model.id,
      });
      if (dlError) throw dlError;

      await supabase.rpc('increment_download_count', { model_uuid: model.id });

      if (model.file_url) {
        window.open(model.file_url, '_blank');
      }
      setDownloaded(true);
    } catch {
      setError('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh pt-16 flex items-center justify-center">
        <div className="animate-pulse">
          <Box className="w-16 h-16 text-slate-300 dark:text-slate-700" />
        </div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="min-h-screen bg-mesh pt-16 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-error-500 mb-4" />
          <p className="text-slate-500">{error || 'Model not found'}</p>
          <Link to="/marketplace" className="btn-ghost-3d mt-4">
            <ArrowLeft className="w-4 h-4" />
            {t('marketplace.title')}
          </Link>
        </div>
      </div>
    );
  }

  const description = model[`description_${lang}`] || model.description_en || model.description_fr;
  const images = model.images?.length ? model.images : ['https://images.pexels.com/photos/3825572/pexels-photo-3825572.jpeg?auto=compress&cs=tinysrgb&w=800'];

  return (
    <div className="min-h-screen bg-mesh pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-500 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          {t('marketplace.title')}
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="card-3d overflow-hidden aspect-square bg-slate-100 dark:bg-slate-800 relative group">
              <img
                src={images[activeImage]}
                alt={model.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                {model.price === 0 ? (
                  <span className="badge-3d bg-success-500/90 text-white">{t('marketplace.free')}</span>
                ) : (
                  <span className="badge-3d bg-primary-500/90 text-white">${model.price}</span>
                )}
              </div>
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === i
                        ? 'border-primary-500 scale-105'
                        : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="font-display text-3xl font-bold">{model.title}</h1>
              <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  {model.downloads_count} {t('product.downloads').toLowerCase()}
                </span>
                {model.category && (
                  <span className="badge-3d bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {model.category[`name_${lang}`] || model.category.name_en}
                  </span>
                )}
              </div>
            </div>

            <div className="card-3d p-5">
              <h3 className="font-semibold mb-2">{t('product.designer')}</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                  {model.designer?.full_name?.[0]?.toUpperCase() || 'D'}
                </div>
                <div>
                  <p className="font-medium">{model.designer?.full_name || 'Unknown'}</p>
                  <p className="text-xs text-slate-500 capitalize">{model.designer?.role || 'designer'}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{t('product.description')}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
            </div>

            <div className="card-3d p-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{t('product.details')}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{t('product.downloads')}</span>
                <span className="font-medium">{model.downloads_count}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{t('product.category')}</span>
                <span className="font-medium">{model.category?.[`name_${lang}`] || model.category?.name_en || '-'}</span>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-error-500/10 text-error-600 dark:text-error-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              onClick={handleDownload}
              disabled={downloading || downloaded}
              className="btn-3d w-full justify-center text-base py-4"
            >
              {downloaded ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  {t('marketplace.download')}
                </>
              ) : downloading ? (
                '...'
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  {model.price === 0 ? t('marketplace.download') : t('product.buyNow')}
                </>
              )}
            </button>

            {!user && (
              <p className="text-center text-sm text-slate-500">
                <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                  {t('nav.login')}
                </Link>{' '}
                {t('marketplace.download').toLowerCase()}
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
