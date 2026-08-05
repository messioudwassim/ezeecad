import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Box } from 'lucide-react';
import { supabase, type Model, type Category } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

export default function MarketplacePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'fr' | 'en' | 'ar';
  const [searchParams, setSearchParams] = useSearchParams();
  const [models, setModels] = useState<Model[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'priceLow' | 'priceHigh'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [modelsRes, categoriesRes] = await Promise.all([
        supabase
          .from('models')
          .select('*, category:categories(*), designer:profiles!models_designer_id_fkey(*)')
          .eq('status', 'approved')
          .order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name_en'),
      ]);
      if (modelsRes.data) setModels(modelsRes.data as unknown as Model[]);
      if (categoriesRes.data) setCategories(categoriesRes.data as Category[]);
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  const filteredModels = useMemo(() => {
    let result = [...models];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description_en.toLowerCase().includes(q) ||
          m.description_fr.toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== 'all') {
      const cat = categories.find((c) => c.slug === selectedCategory);
      if (cat) result = result.filter((m) => m.category_id === cat.id);
    }
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'popular':
        result.sort((a, b) => b.downloads_count - a.downloads_count);
        break;
      case 'priceLow':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'priceHigh':
        result.sort((a, b) => b.price - a.price);
        break;
    }
    return result;
  }, [models, search, selectedCategory, sortBy, categories]);

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    if (slug === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: slug });
    }
  };

  return (
    <div className="min-h-screen bg-mesh pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="section-title">{t('marketplace.title')}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">{t('marketplace.subtitle')}</p>
        </motion.div>

        {/* Search + Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('marketplace.search')}
              className="input-3d ps-10"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="input-3d sm:w-48"
          >
            <option value="newest">{t('marketplace.newest')}</option>
            <option value="popular">{t('marketplace.popular')}</option>
            <option value="priceLow">{t('marketplace.priceLow')}</option>
            <option value="priceHigh">{t('marketplace.priceHigh')}</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-ghost-3d sm:w-auto"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t('marketplace.filters')}
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`badge-3d cursor-pointer transition-all ${
              selectedCategory === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Box className="w-3 h-3" />
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`badge-3d cursor-pointer transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat[`name_${lang}`] || cat.name_en}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-slate-500 mb-4">
          {t('marketplace.results', { count: filteredModels.length })}
        </p>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card-3d overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-800" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="text-center py-20">
            <Box className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
            <p className="text-slate-500">{t('marketplace.noResults')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredModels.map((model, i) => (
              <ProductCard key={model.id} model={model} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}