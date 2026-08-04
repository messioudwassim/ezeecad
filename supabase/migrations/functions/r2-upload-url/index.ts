// Supabase Edge Function: r2-upload-url
//
// Generates a short-lived, presigned PUT URL for uploading a file directly
// to Cloudflare R2. This keeps the R2 secret access key on the server only —
// the browser never sees it, it only receives a temporary signed URL.
//
// Deploy with:
//   supabase functions deploy r2-upload-url
//
// Required secrets (set with `supabase secrets set NAME=value`):
//   R2_ACCOUNT_ID        - Cloudflare account ID
//   R2_ACCESS_KEY_ID     - R2 API token access key id
//   R2_SECRET_ACCESS_KEY - R2 API token secret
//   R2_BUCKET_NAME        - e.g. "ezeecad-models"
//   R2_PUBLIC_URL          - public base URL for the bucket,
//                            e.g. https://pub-xxxxxxxx.r2.dev  (no trailing slash)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { AwsClient } from 'https://esm.sh/aws4fetch@1.0.17';

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
    // 1) Require a valid logged-in Supabase user (any authenticated user;
    //    the `models` table RLS policy still enforces designer-only inserts).
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2) Read the requested file name / content type from the client.
    const { fileName, contentType } = await req.json();
    if (!fileName || typeof fileName !== 'string') {
      return new Response(JSON.stringify({ error: 'fileName is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Basic size-type guardrail: only allow expected 3D-model archive types.
    const allowedExt = ['zip', 'rar', '7z', 'stl', 'obj', 'fbx', 'gltf', 'glb'];
    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
    if (!allowedExt.includes(ext)) {
      return new Response(JSON.stringify({ error: `File type .${ext} not allowed` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accountId = Deno.env.get('R2_ACCOUNT_ID')!;
    const accessKeyId = Deno.env.get('R2_ACCESS_KEY_ID')!;
    const secretAccessKey = Deno.env.get('R2_SECRET_ACCESS_KEY')!;
    const bucket = Deno.env.get('R2_BUCKET_NAME')!;
    const publicBaseUrl = Deno.env.get('R2_PUBLIC_URL')!;

    const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const key = `models/${user.id}/${Date.now()}-${safeName}`;

    const client = new AwsClient({
      accessKeyId,
      secretAccessKey,
      service: 's3',
      region: 'auto',
    });

    const endpoint = `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`;

    // signQuery: true => presigned URL usable directly with a plain fetch PUT,
    // valid for 15 minutes by default (aws4fetch default expiry).
    const signedRequest = await client.sign(endpoint, {
      method: 'PUT',
      headers: contentType ? { 'Content-Type': contentType } : {},
      aws: { signQuery: true },
    });

    return new Response(
      JSON.stringify({
        uploadUrl: signedRequest.url,
        key,
        publicUrl: `${publicBaseUrl}/${key}`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});