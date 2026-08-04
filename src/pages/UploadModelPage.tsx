import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, File, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase, type Category } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function UploadModelPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [descFr, setDescFr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('0');
  const [images, setImages] = useState<File[]>([]);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => {
      if (data) setCategories(data as Category[]);
    });
  }, []);

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files).slice(0, 5));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const imageUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const ext = images[i].name.split('.').pop();
        const path = `models/${user.id}/${Date.now()}-${i}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('model-images')
          .upload(path, images[i]);
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('model-images').getPublicUrl(path);
          imageUrls.push(urlData.publicUrl);
        }
      }

      let fileUrl: string | null = null;
      if (file) {
        const ext = file.name.split('.').pop();
        const path = `model-files/${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('model-files')
          .upload(path, file);
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('model-files').getPublicUrl(path);
          fileUrl = urlData.publicUrl;
        }
      }

      const { error: insertErr } = await supabase.from('models').insert({
        title,
        description_fr: descFr,
        description_en: descEn,
        description_ar: descAr,
        category_id: categoryId || null,
        price: parseFloat(price) || 0,
        designer_id: user.id,
        status: 'pending',
        images: imageUrls,
        file_url: fileUrl,
      });

      if (insertErr) throw insertErr;

      setSuccess(true);
      setTimeout(() => navigate('/dashboard/my-models'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card-3d p-12 text-center max-w-md"
        >
          <CheckCircle className="w-16 h-16 mx-auto text-success-500 mb-4" />
          <h2 className="font-display text-xl font-bold mb-2">{t('upload.success')}</h2>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-3d p-6 md:p-8"
      >
        <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary-500" />
          {t('upload.title')}
        </h2>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-error-500/10 text-error-600 dark:text-error-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">{t('upload.modelName')}</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-3d"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('upload.descriptionFr')}</label>
              <textarea
                value={descFr}
                onChange={(e) => setDescFr(e.target.value)}
                className="input-3d min-h-[80px] resize-none"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('upload.descriptionEn')}</label>
              <textarea
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                className="input-3d min-h-[80px] resize-none"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('upload.descriptionAr')}</label>
              <textarea
                value={descAr}
                onChange={(e) => setDescAr(e.target.value)}
                className="input-3d min-h-[80px] resize-none"
                rows={3}
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('upload.category')}</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="input-3d"
              >
                <option value="">—</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name_en} / {cat.name_fr}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('upload.price')}</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input-3d"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t('upload.images')}</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
                className="hidden"
                id="images-input"
              />
              <label
                htmlFor="images-input"
                className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 cursor-pointer transition-all"
              >
                <ImageIcon className="w-8 h-8 text-slate-400" />
                <span className="text-sm text-slate-500">
                  {images.length > 0 ? `${images.length} image(s) selected` : 'Click to select images'}
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t('upload.file')}</label>
            <div className="relative">
              <input
                type="file"
                accept=".zip,.rar,.7z,.stl,.obj,.fbx,.gltf,.glb"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 cursor-pointer transition-all"
              >
                <File className="w-8 h-8 text-slate-400" />
                <span className="text-sm text-slate-500">
                  {file ? file.name : 'Click to select file'}
                </span>
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-3d w-full justify-center">
            {loading ? '...' : t('upload.submit')}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
