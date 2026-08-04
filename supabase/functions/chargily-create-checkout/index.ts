// Supabase Edge Function: chargily-create-checkout
//
// Creates a Chargily Pay (CIB/EDAHABIA) checkout session for a paid model,
// records a "pending" order, and returns the checkout_url to redirect the
// buyer to. Payment confirmation happens asynchronously via the
// chargily-webhook function, never trusted from the client.
//
// Deploy with:
//   supabase functions deploy chargily-create-checkout
//
// Required secrets:
//   CHARGILY_SECRET_KEY   - from https://pay.chargily.com/app (test or live)
//   CHARGILY_MODE         - "test" or "live" (defaults to "test")
//   SITE_URL               - e.g. https://ezeecad.vercel.app (no trailing slash)
//   SUPABASE_SERVICE_ROLE_KEY - to write the pending order bypassing RLS

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Client bound to the caller's JWT: used only to identify who is asking.
    const supabaseAuthClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );
    const {
      data: { user },
      error: authError,
    } = await supabaseAuthClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { modelId } = await req.json();
    if (!modelId) {
      return new Response(JSON.stringify({ error: 'modelId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Service-role client: bypasses RLS, used for the actual reads/writes
    // this function is trusted to perform on the user's behalf.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: model, error: modelError } = await supabaseAdmin
      .from('models')
      .select('id, title, price, status')
      .eq('id', modelId)
      .maybeSingle();

    if (modelError || !model) {
      return new Response(JSON.stringify({ error: 'Model not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (model.status !== 'approved') {
      return new Response(JSON.stringify({ error: 'Model not available' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (Number(model.price) <= 0) {
      return new Response(JSON.stringify({ error: 'This model is free, no payment needed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const mode = Deno.env.get('CHARGILY_MODE') === 'live' ? 'live' : 'test';
    const chargilyBase =
      mode === 'live' ? 'https://pay.chargily.net/api/v2' : 'https://pay.chargily.net/test/api/v2';
    const secretKey = Deno.env.get('CHARGILY_SECRET_KEY')!;
    const siteUrl = Deno.env.get('SITE_URL')!;

    // Create the "pending" order first so we have our own id to correlate
    // with the webhook, whatever Chargily returns.
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user.id,
        model_id: model.id,
        amount: model.price,
        currency: 'dzd',
        status: 'pending',
      })
      .select()
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'Failed to create order' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const chargilyRes = await fetch(`${chargilyBase}/checkouts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(Number(model.price)), // DZD, whole units
        currency: 'dzd',
        description: `EzeeCAD - ${model.title}`,
        locale: 'fr',
        success_url: `${siteUrl}/payment/return?order=${order.id}`,
        failure_url: `${siteUrl}/payment/return?order=${order.id}&failed=1`,
        webhook_endpoint: `${Deno.env.get('SUPABASE_URL')}/functions/v1/chargily-webhook`,
        metadata: { order_id: order.id, user_id: user.id, model_id: model.id },
      }),
    });

    if (!chargilyRes.ok) {
      const errBody = await chargilyRes.text();
      await supabaseAdmin.from('orders').update({ status: 'failed' }).eq('id', order.id);
      return new Response(
        JSON.stringify({ error: `Chargily error: ${errBody}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const checkout = await chargilyRes.json();

    await supabaseAdmin
      .from('orders')
      .update({
        chargily_checkout_id: checkout.id,
        checkout_url: checkout.checkout_url,
      })
      .eq('id', order.id);

    return new Response(
      JSON.stringify({ checkoutUrl: checkout.checkout_url, orderId: order.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});