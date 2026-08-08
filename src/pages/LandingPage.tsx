import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Zap, Globe2, ArrowRight, Box, Cpu, Heart, Building2, Car, Sofa, Settings } from 'lucide-react';
import ExplodedAssembly from '@/components/ExplodedAssembly';
import FloatingShape from '@/components/FloatingShape';

export default function LandingPage() {
  const { t } = useTranslation();

  const features = [
    { icon: Sparkles, title: t('features.f1Title'), desc: t('features.f1Desc') },
    { icon: Zap, title: t('features.f2Title'), desc: t('features.f2Desc') },
    { icon: Shield, title: t('features.f3Title'), desc: t('features.f3Desc') },
    { icon: Globe2, title: t('features.f4Title'), desc: t('features.f4Desc') },
  ];

  const categories = [
    { icon: Settings, name: 'Mécanique', slug: 'mechanical' },
    { icon: Sofa, name: 'Mobilier', slug: 'furniture' },
    { icon: Cpu, name: 'Robotique', slug: 'robotics' },
    { icon: Building2, name: 'Architecture', slug: 'architecture' },
    { icon: Heart, name: 'Médical', slug: 'medical' },
    { icon: Car, name: 'Véhicules', slug: 'vehicles' },
  ];

  return (
    <div className="bg-mesh min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" />

        {/* Floating 3D shapes */}
        <FloatingShape className="top-20 left-10" delay={0} />
        <FloatingShape className="top-40 right-20" delay={2} />
        <FloatingShape className="bottom-20 left-1/4" delay={4} />
        <FloatingShape className="top-1/2 right-1/3" delay={6} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Box className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('hero.badge')}</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              {t('hero.title').split(' ').slice(0, -2).join(' ')}{' '}
              <span className="text-gradient">{t('hero.title').split(' ').slice(-2).join(' ')}</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/marketplace" className="btn-3d">
                {t('hero.cta')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/register" className="btn-ghost-3d">
                {t('hero.cta2')}
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center items-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent-500/20 blur-3xl rounded-full animate-pulse-slow" />
              <ExplodedAssembly size={280} className="relative z-10" />
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent" />
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-title">{t('features.title')}</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">{t('features.subtitle')}</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, rotateX: 5 }}
                className="card-3d p-6 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-primary-500" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-title">{t('categories.title')}</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">{t('categories.subtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -6, scale: 1.05 }}
              >
                <Link
                  to={`/marketplace?category=${cat.slug}`}
                  className="card-3d p-6 flex flex-col items-center text-center group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-3 group-hover:rotate-12 transition-transform duration-500">
                    <cat.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-sm font-medium">{cat.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 p-12 text-center"
          >
            <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10" />
            <div className="relative">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                {t('hero.cta2')}
              </h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8">
                {t('features.subtitle')}
              </p>
              <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-primary-600 font-semibold hover:bg-slate-100 transition-all hover:scale-105">
                {t('nav.register')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}