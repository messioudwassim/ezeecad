import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { useLang } from '@/context/LangContext';

const CONTACT_EMAIL = 'contact@ezeecad.example'; // [Adresse e-mail de contact à compléter]

const COPY = {
  fr: {
    title: 'Contact',
    subtitle: "Une question, une suggestion, un problème avec une commande ? Écrivez-nous.",
    emailLabel: 'Par e-mail',
    addressLabel: 'Adresse',
    addressValue: "[Adresse de l'entreprise à compléter]",
    formTitle: 'Envoyer un message',
    name: 'Nom complet',
    email: 'Votre e-mail',
    subject: 'Sujet',
    message: 'Message',
    send: 'Envoyer le message',
    note: "En cliquant sur « Envoyer », votre application e-mail s'ouvrira avec le message pré-rempli à destination de notre équipe.",
    sentTitle: 'Merci !',
    sentBody: 'Votre client e-mail a été ouvert avec le message pré-rempli. Il ne reste plus qu\'à l\'envoyer.',
    subjectPlaceholder: 'Ex : Question sur ma commande',
    messagePlaceholder: 'Décrivez votre demande en quelques lignes...',
  },
  en: {
    title: 'Contact',
    subtitle: 'A question, a suggestion, an issue with an order? Get in touch.',
    emailLabel: 'By email',
    addressLabel: 'Address',
    addressValue: '[Company address to be completed]',
    formTitle: 'Send a message',
    name: 'Full name',
    email: 'Your email',
    subject: 'Subject',
    message: 'Message',
    send: 'Send message',
    note: 'Clicking "Send" will open your email app with the message pre-filled to our team.',
    sentTitle: 'Thank you!',
    sentBody: 'Your email client has opened with the pre-filled message. Just hit send there.',
    subjectPlaceholder: 'E.g. Question about my order',
    messagePlaceholder: 'Describe your request in a few lines...',
  },
  ar: {
    title: 'اتصل بنا',
    subtitle: 'سؤال، اقتراح، مشكلة في طلب؟ راسلنا.',
    emailLabel: 'عبر البريد الإلكتروني',
    addressLabel: 'العنوان',
    addressValue: '[عنوان الشركة - يُستكمل لاحقاً]',
    formTitle: 'إرسال رسالة',
    name: 'الاسم الكامل',
    email: 'بريدك الإلكتروني',
    subject: 'الموضوع',
    message: 'الرسالة',
    send: 'إرسال الرسالة',
    note: 'بالنقر على "إرسال"، سيتم فتح تطبيق البريد الإلكتروني الخاص بك مع الرسالة معبأة مسبقاً موجهة إلى فريقنا.',
    sentTitle: 'شكراً لك!',
    sentBody: 'تم فتح برنامج البريد الإلكتروني الخاص بك مع الرسالة المعبأة مسبقاً. لم يتبقَّ سوى الإرسال.',
    subjectPlaceholder: 'مثال: سؤال حول طلبي',
    messagePlaceholder: 'صف طلبك في بضعة أسطر...',
  },
};

export default function ContactPage() {
  const { lang } = useLang();
  const t = lang === 'en' ? COPY.en : lang === 'ar' ? COPY.ar : COPY.fr;

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = `${form.message}\n\n---\n${t.name}: ${form.name}\n${t.email}: ${form.email}`;
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      form.subject || 'EzeeCAD - Contact'
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-mesh pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2 text-slate-900 dark:text-white">
            {t.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">{t.subtitle}</p>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.emailLabel}</p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-sm font-medium text-slate-900 dark:text-white hover:text-primary-500 transition-colors"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.addressLabel}</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{t.addressValue}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-6 sm:p-8">
            <h2 className="font-display text-lg font-semibold mb-5 text-slate-900 dark:text-white">
              {t.formTitle}
            </h2>

            {sent ? (
              <div className="flex flex-col items-center text-center py-8">
                <CheckCircle2 className="w-10 h-10 text-success-500 mb-3" />
                <p className="font-semibold text-slate-900 dark:text-white">{t.sentTitle}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">{t.sentBody}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                      {t.name}
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                      {t.email}
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                    {t.subject}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t.subjectPlaceholder}
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                    {t.message}
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder={t.messagePlaceholder}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {t.send}
                </button>

                <p className="text-xs text-slate-400 dark:text-slate-500 text-center">{t.note}</p>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}