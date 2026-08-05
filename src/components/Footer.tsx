import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '@/components/Logo';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="mb-4">
              <Logo size={32} />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs">
              {t('hero.subtitle')}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">{t('footer.about')}</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/marketplace" className="hover:text-primary-500 transition-colors">{t('nav.marketplace')}</Link></li>
              <li><Link to="/contact" className="hover:text-primary-500 transition-colors">{t('footer.contact')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">{t('footer.terms')}</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/cgv" className="hover:text-primary-500 transition-colors">{t('footer.terms')}</Link></li>
              <li><Link to="/confidentialite" className="hover:text-primary-500 transition-colors">{t('footer.privacy')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} EzeeCAD. {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
}
