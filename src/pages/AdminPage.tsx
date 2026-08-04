import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  CheckCircle, XCircle, Clock, Package, Users, Download, Trash2,
  Plus, CreditCard as Edit2, X, Save,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, type Model, type Profile, type Category } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

type Tab = 'models' | 'users' | 'categories';

export default function AdminPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'fr' | 'en' | 'ar';
  const { user: currentUser } = useAuth();

  const [tab, setTab] = useState<Tab>('models');

  const [models, setModels] = useState<Model[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('downloads').select('*', { count: 'exact', head: true }),
    ]);

    if (modelsRes.data) setModels(modelsRes.data as unknown as Model[]);
    if (profilesRes.data) {
      const profiles = profilesRes.data as Profile[];
      setUsers(profiles);
      setStats({
        models: modelsRes.data?.length || 0,
        designers: profiles.filter((p) => p.role === 'designer').length,
        clients: profiles.filter((p) => p.role === 'client').length,
        downloads: dlRes.count || 0,
      });
    }
    await fetchCategories();
    setLoading(false);
  }

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('name_fr');
    if (data) setCategories(data as Category[]);
  }

  // ---------- Models ----------
  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    await supabase.from('models').update({ status }).eq('id', id);
    setModels(models.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  const handleDeleteModel = async (id: string) => {
    if (!confirm('Delete this model?')) return;
    await supabase.from('models').delete().eq('id', id);
    setModels(models.filter((m) => m.id !== id));
  };

  // ---------- Users ----------
  const changeRole = async (userId: string, newRole: 'client' | 'designer' | 'admin') => {
    if (userId === currentUser?.id) {
      alert(t('dashboard.cannotChangeOwnRole'));
      return;
    }
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    if (!confirm(t('dashboard.changeRoleConfirm', { name: target.full_name || target.id, role: newRole }))) return;

    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (!error) {
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } else {
      alert(error.message);
    }
  };

  // ---------- Categories ----------
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [catForm, setCatForm] = useState({ name_fr: '', name_en: '', name_ar: '', slug: '' });

  const startEditCategory = (c: Category) => {
    setEditingCategory(c);
    setCatForm({ name_fr: c.name_fr, name_en: c.name_en, name_ar: c.name_ar, slug: c.slug });
    setShowNewCategory(false);
  };

  const startNewCategory = () => {
    setEditingCategory(null);
    setCatForm({ name_fr: '', name_en: '', name_ar: '', slug: '' });
    setShowNewCategory(true);
  };

  const cancelCategoryEdit = () => {
    setEditingCategory(null);
    setShowNewCategory(false);
  };

  const saveCategory = async () => {
    if (!catForm.name_fr || !catForm.name_en || !catForm.name_ar || !catForm.slug) return;

    if (editingCategory) {
      const { error } = await supabase.from('categories').update(catForm).eq('id', editingCategory.id);
      if (!error) {
        setCategories(categories.map((c) => (c.id === editingCategory.id ? { ...c, ...catForm } : c)));
        cancelCategoryEdit();
      } else {
        alert(error.message);
      }
    } else {
      const { data, error } = await supabase.from('categories').insert(catForm).select().maybeSingle();
      if (!error && data) {
        setCategories([...categories, data as Category].sort((a, b) => a.name_fr.localeCompare(b.name_fr)));
        cancelCategoryEdit();
      } else if (error) {
        alert(error.message);
      }
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm(t('dashboard.confirmDeleteCategory'))) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) setCategories(categories.filter((c) => c.id !== id));
    else alert(error.message);
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

  const mainTabs: { key: Tab; label: string; icon: typeof Package }[] = [
    { key: 'models', label: t('dashboard.tabModels'), icon: Package },
    { key: 'users', label: t('dashboard.tabUsers'), icon: Users },
    { key: 'categories', label: t('dashboard.tabCategories'), icon: Package },
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

      {/* Main section tabs: Models / Users / Categories */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        {mainTabs.map((mt) => (
          <button
            key={mt.key}
            onClick={() => setTab(mt.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
              tab === mt.key
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <mt.icon className="w-4 h-4" />
            {mt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card-3d p-12 text-center">
          <Package className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 animate-pulse" />
        </div>
      ) : tab === 'models' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {filterTabs.map((ft) => (
              <button
                key={ft.key}
                onClick={() => setFilter(ft.key)}
                className={`badge-3d cursor-pointer transition-all ${
                  filter === ft.key
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <ft.icon className="w-3 h-3" />
                {ft.label}
                <span className="ml-1 opacity-60">
                  {ft.key === 'all' ? models.length : models.filter((m) => m.status === ft.key).length}
                </span>
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
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
                      onClick={() => handleDeleteModel(model.id)}
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
      ) : tab === 'users' ? (
        <div className="space-y-3">
          {users.length === 0 ? (
            <div className="card-3d p-12 text-center">
              <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-slate-500">{t('dashboard.noUsers')}</p>
            </div>
          ) : (
            users.map((u) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-3d p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {u.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{u.full_name || '—'}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(u.created_at).toLocaleDateString()}
                    {u.id === currentUser?.id ? ' · (vous)' : ''}
                  </p>
                </div>
                <select
                  value={u.role}
                  disabled={u.id === currentUser?.id}
                  onChange={(e) => changeRole(u.id, e.target.value as 'client' | 'designer' | 'admin')}
                  className="input-3d py-2 px-3 text-sm w-36 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="client">Client</option>
                  <option value="designer">Designer</option>
                  <option value="admin">Admin</option>
                </select>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {!showNewCategory && !editingCategory && (
            <button onClick={startNewCategory} className="btn-3d inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t('dashboard.addCategory')}
            </button>
          )}

          {(showNewCategory || editingCategory) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-3d p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {editingCategory ? t('dashboard.editCategory') : t('dashboard.addCategory')}
                </h3>
                <button onClick={cancelCategoryEdit} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  className="input-3d"
                  placeholder={t('dashboard.categoryNameFr')}
                  value={catForm.name_fr}
                  onChange={(e) => setCatForm({ ...catForm, name_fr: e.target.value })}
                />
                <input
                  className="input-3d"
                  placeholder={t('dashboard.categoryNameEn')}
                  value={catForm.name_en}
                  onChange={(e) => setCatForm({ ...catForm, name_en: e.target.value })}
                />
                <input
                  className="input-3d"
                  placeholder={t('dashboard.categoryNameAr')}
                  dir="rtl"
                  value={catForm.name_ar}
                  onChange={(e) => setCatForm({ ...catForm, name_ar: e.target.value })}
                />
                <input
                  className="input-3d"
                  placeholder={t('dashboard.categorySlug')}
                  value={catForm.slug}
                  onChange={(e) => setCatForm({ ...catForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={saveCategory} className="btn-3d inline-flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {t('dashboard.save')}
                </button>
                <button
                  onClick={cancelCategoryEdit}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t('dashboard.cancel')}
                </button>
              </div>
            </motion.div>
          )}

          {categories.length === 0 ? (
            <div className="card-3d p-12 text-center">
              <p className="text-slate-500">{t('dashboard.noCategories')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-3d p-4 flex items-center gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {c.name_fr} <span className="text-slate-400 font-normal">/ {c.name_en} / {c.name_ar}</span>
                    </p>
                    <p className="text-xs text-slate-500">slug: {c.slug}</p>
                  </div>
                  <button
                    onClick={() => startEditCategory(c)}
                    className="p-2 rounded-lg text-primary-600 hover:bg-primary-500/10 transition-all"
                    title={t('dashboard.edit')}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCategory(c.id)}
                    className="p-2 rounded-lg text-error-600 hover:bg-error-500/10 transition-all"
                    title={t('dashboard.delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}