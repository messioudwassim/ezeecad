import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useLang } from '@/context/LangContext';

type LegalLayoutProps = {
  title: string;
  lastUpdated: string;
  arabicNotice?: string;
  children: ReactNode;
};

export default function LegalLayout({ title, lastUpdated, arabicNotice, children }: LegalLayoutProps) {
  const { lang } = useLang();

  return (
    <div className="min-h-screen bg-mesh pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2 text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">{lastUpdated}</p>

          {lang === 'ar' && arabicNotice && (
            <div
              dir="rtl"
              className="mb-8 rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950/40 px-4 py-3 text-sm text-primary-800 dark:text-primary-200"
            >
              {arabicNotice}
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-6 sm:p-10 space-y-8">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-lg font-semibold mb-3 text-slate-900 dark:text-white">
        {title}
      </h2>
      <div className="text-sm sm:text-[15px] leading-relaxed text-slate-600 dark:text-slate-300 space-y-3">
        {children}
      </div>
    </section>
  );
}
