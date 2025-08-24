// Health check handler for Cloudflare Workers

export async function healthHandler(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }

  // Return health status
  return new Response(
    JSON.stringify({
      status: 'OK (Cloudflare Workers)',
      timestamp: new Date().toISOString(),
      message: 'Portfolio API is running on Cloudflare Workers',
      region: request.cf?.colo || 'unknown',
      country: request.cf?.country || 'unknown'
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    }
  );
}
