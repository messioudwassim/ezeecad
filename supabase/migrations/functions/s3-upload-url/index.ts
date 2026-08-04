// Supabase Edge Function: s3-upload-url
//
// Generates a short-lived, presigned PUT URL for uploading a file directly
// to an S3-compatible storage provider (Backblaze B2, Cloudflare R2, Wasabi...).
// This keeps the secret access key on the server only — the browser never
// sees it, it only receives a temporary signed URL.
//
// Currently configured for Backblaze B2 (10GB free, no credit card required).
//
// Deploy with:
//   supabase functions deploy s3-upload-url
//
// Required secrets (set with `supabase secrets set NAME=value`):
//   S3_ENDPOINT          - e.g. https://s3.us-west-004.backblazeb2.com
//   S3_REGION             - e.g. us-west-004
//   S3_ACCESS_KEY_ID      - B2 Application Key ID
//   S3_SECRET_ACCESS_KEY  - B2 Application Key
//   S3_BUCKET_NAME         - e.g. "ezeecad-models"
//   S3_PUBLIC_URL           - public base URL for the bucket,
//                             e.g. https://s3.us-west-004.backblazeb2.com/ezeecad-models
//                             (bucket must be set to "Public" in B2)

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

    const endpoint = Deno.env.get('S3_ENDPOINT')!; // e.g. https://s3.us-west-004.backblazeb2.com
    const region = Deno.env.get('S3_REGION') ?? 'us-east-1';
    const accessKeyId = Deno.env.get('S3_ACCESS_KEY_ID')!;
    const secretAccessKey = Deno.env.get('S3_SECRET_ACCESS_KEY')!;
    const bucket = Deno.env.get('S3_BUCKET_NAME')!;
    const publicBaseUrl = Deno.env.get('S3_PUBLIC_URL')!;

    const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const key = `models/${user.id}/${Date.now()}-${safeName}`;

    const client = new AwsClient({
      accessKeyId,
      secretAccessKey,
      service: 's3',
      region,
    });

    const objectUrl = `${endpoint}/${bucket}/${key}`;

    // signQuery: true => presigned URL usable directly with a plain fetch PUT,
    // valid for 15 minutes by default (aws4fetch default expiry).
    const signedRequest = await client.sign(objectUrl, {
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