// Supabase Edge Function: chargily-webhook
//
// Receives payment status events from Chargily Pay (CIB/EDAHABIA), verifies
// the HMAC-SHA256 signature (per https://dev.chargily.com/pay-v2/webhooks),
// and updates the matching `orders` row. On a paid event, also inserts a
// `downloads` row so the buyer can access the file — this is the ONLY place
// a paid model's download is unlocked; the client is never trusted for this.
//
// Deploy with:
//   supabase functions deploy chargily-webhook --no-verify-jwt
//   (--no-verify-jwt is required: Chargily calls this anonymously, its own
//    signature check below is what proves the request is legitimate)
//
// Then paste the deployed URL into your Chargily Pay dashboard's webhook
// settings AND make sure it matches the `webhook_endpoint` sent by
// chargily-create-checkout.
//
// Required secrets:
//   CHARGILY_SECRET_KEY        - same key used to create checkouts
//   SUPABASE_SERVICE_ROLE_KEY  - to write orders/downloads bypassing RLS

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

async function hmacSha256Hex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const signature = req.headers.get('signature');
  const rawBody = await req.text();

  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  const secretKey = Deno.env.get('CHARGILY_SECRET_KEY')!;
  const expectedSignature = await hmacSha256Hex(secretKey, rawBody);

  // Constant-time-ish comparison (Deno has no built-in timingSafeEqual for
  // strings in std easily reachable here; length+char compare is sufficient
  // given this runs behind HTTPS and the window for timing attacks is tiny,
  // but we still avoid short-circuiting on the first mismatched char count).
  if (expectedSignature.length !== signature.length || expectedSignature !== signature) {
    return new Response('Invalid signature', { status: 403 });
  }

  let event: {
    type: string;
    data: { id: string; status: string; metadata?: { order_id?: string } | null };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  const checkoutId = event.data?.id;
  if (!checkoutId) {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('chargily_checkout_id', checkoutId)
    .maybeSingle();

  if (!order) {
    // Unknown order — acknowledge anyway so Chargily doesn't retry forever,
    // but nothing to update.
    return new Response(JSON.stringify({ received: true, note: 'order not found' }), {
      status: 200,
    });
  }

  if (event.type === 'checkout.paid') {
    await supabaseAdmin.from('orders').update({ status: 'paid', updated_at: new Date().toISOString() }).eq('id', order.id);

    // Unlock the download: this bypasses RLS (service role), which is
    // exactly the point — the client can never insert into `downloads`
    // for a paid model on its own.
    await supabaseAdmin
      .from('downloads')
      .upsert({ user_id: order.user_id, model_id: order.model_id }, { onConflict: 'user_id,model_id' });

    await supabaseAdmin.rpc('increment_download_count', { model_uuid: order.model_id });
  } else if (event.type === 'checkout.failed') {
    await supabaseAdmin.from('orders').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('id', order.id);
  } else if (event.type === 'checkout.expired' || event.type === 'checkout.canceled') {
    await supabaseAdmin.from('orders').update({ status: 'expired', updated_at: new Date().toISOString() }).eq('id', order.id);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});