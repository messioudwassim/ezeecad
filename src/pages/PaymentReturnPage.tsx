import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Status = 'checking' | 'paid' | 'pending' | 'failed';

export default function PaymentReturnPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const failed = searchParams.get('failed') === '1';
  const [status, setStatus] = useState<Status>('checking');
  const [modelId, setModelId] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setStatus('failed');
      return;
    }
    if (failed) {
      setStatus('failed');
      return;
    }

    // Le webhook Chargily peut mettre quelques secondes à arriver.
    // On interroge la commande plusieurs fois avant d'abandonner.
    let attempts = 0;
    const maxAttempts = 10;

    const poll = async () => {
      const { data } = await supabase
        .from('orders')
        .select('status, model_id')
        .eq('id', orderId)
        .maybeSingle();

      if (data?.status === 'paid') {
        setStatus('paid');
        setModelId(data.model_id);
        return;
      }
      if (data?.status === 'failed' || data?.status === 'expired') {
        setStatus('failed');
        return;
      }

      attempts += 1;
      if (attempts < maxAttempts) {
        setTimeout(poll, 2000);
      } else {
        setStatus('pending');
        setModelId(data?.model_id ?? null);
      }
    };

    poll();
  }, [orderId, failed]);

  return (
    <div className="min-h-screen bg-mesh pt-16 flex items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card-3d p-10 text-center max-w-md"
      >
        {status === 'checking' && (
          <>
            <Loader2 className="w-14 h-14 mx-auto text-primary-500 mb-4 animate-spin" />
            <h2 className="font-display text-xl font-bold mb-2">{t('payment.checkingTitle')}</h2>
            <p className="text-slate-500 text-sm">{t('payment.checkingBody')}</p>
          </>
        )}

        {status === 'paid' && (
          <>
            <CheckCircle className="w-14 h-14 mx-auto text-success-500 mb-4" />
            <h2 className="font-display text-xl font-bold mb-2">{t('payment.paidTitle')}</h2>
            <p className="text-slate-500 text-sm mb-6">{t('payment.paidBody')}</p>
            {modelId && (
              <Link to={`/marketplace/${modelId}`} className="btn-3d inline-flex">
                {t('payment.goToModel')}
              </Link>
            )}
          </>
        )}

        {status === 'pending' && (
          <>
            <Loader2 className="w-14 h-14 mx-auto text-warning-500 mb-4" />
            <h2 className="font-display text-xl font-bold mb-2">{t('payment.pendingTitle')}</h2>
            <p className="text-slate-500 text-sm mb-6">{t('payment.pendingBody')}</p>
            {modelId && (
              <Link to={`/marketplace/${modelId}`} className="btn-ghost-3d inline-flex">
                {t('payment.backToModel')}
              </Link>
            )}
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="w-14 h-14 mx-auto text-error-500 mb-4" />
            <h2 className="font-display text-xl font-bold mb-2">{t('payment.failedTitle')}</h2>
            <p className="text-slate-500 text-sm mb-6">{t('payment.failedBody')}</p>
            <Link to="/marketplace" className="btn-3d inline-flex">
              {t('payment.backToMarketplace')}
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}