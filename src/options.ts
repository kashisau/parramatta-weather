
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

export default async function Options(request: Request) {
    if (
        request.headers.get('Origin') !== null &&
        request.headers.get('Access-Control-Request-Method') !== null &&
        request.headers.get('Access-Control-Request-Headers') !== null
      ) {
        const accessControlRequestHeaders = request.headers.get('Access-Control-Request-Headers') || ''

        // Handle CORS preflight requests.
        return new Response(null, {
          headers: {
            ...corsHeaders,
            'Access-Control-Allow-Headers': accessControlRequestHeaders,
          },
        });
      } else {
        // Handle standard OPTIONS request.
        return new Response(null, {
          headers: {
            Allow: 'GET, OPTIONS',
          },
        });
      }
}