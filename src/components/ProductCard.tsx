import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Download, Eye } from 'lucide-react';
import type { Model } from '@/lib/supabase';

type ProductCardProps = {
  model: Model;
  index?: number;
};

export default function ProductCard({ model, index = 0 }: ProductCardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'fr' | 'en' | 'ar';

  const description = model[`description_${lang}`] || model.description_en || model.description_fr;
  const imageUrl = model.images?.[0] || 'https://images.pexels.com/photos/3825572/pexels-photo-3825572.jpeg?auto=compress&cs=tinysrgb&w=600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -8 }}
      className="card-3d overflow-hidden group"
    >
      <Link to={`/marketplace/${model.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={imageUrl}
            alt={model.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute top-3 left-3">
            {model.price === 0 ? (
              <span className="badge-3d bg-success-500/90 text-white">{t('marketplace.free')}</span>
            ) : (
              <span className="badge-3d bg-primary-500/90 text-white">{model.price.toLocaleString('fr-DZ')} DA</span>
            )}
          </div>

          <div className="absolute top-3 right-3">
            <span className="badge-3d glass text-slate-700 dark:text-slate-200">
              <Download className="w-3 h-3" />
              {model.downloads_count}
            </span>
          </div>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl glass text-sm font-semibold text-white">
              <Eye className="w-4 h-4" />
              {t('product.preview')}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-display font-semibold text-base truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {model.title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{description}</p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              {model.designer?.full_name || t('product.designer')}
            </span>
            {model.category && (
              <span className="text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {model.category[`name_${lang}`] || model.category.name_en}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}