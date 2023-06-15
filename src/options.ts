
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
  'Access-Control-Max-Age': '86400'
}

/**
 * Handles OPTIONS requests, including CORS preflight requests, and returns the appropriate response.
 *
 * @param {Request} request - The incoming OPTIONS request object.
 * @returns {Response} - The response for the OPTIONS request.
 */
export default async function Options (request: Request): Promise<Response> {
  if (
    request.headers.get('Origin') !== null &&
    request.headers.get('Access-Control-Request-Method') !== null &&
    request.headers.get('Access-Control-Request-Headers') !== null
  ) {
    // Extract the Access-Control-Request-Headers value or assign an empty string if it is null.
    const accessControlRequestHeaders = request.headers.get('Access-Control-Request-Headers') ?? ''

    // Handle CORS preflight requests by returning a response with appropriate CORS headers.
    return new Response(null, {
      headers: {
        ...corsHeaders, // Assuming corsHeaders is defined somewhere in the code.
        'Access-Control-Allow-Headers': accessControlRequestHeaders
      }
    })
  } else {
    // Handle standard OPTIONS requests by returning a response with the Allow header.
    return new Response(null, {
      headers: {
        Allow: 'GET, OPTIONS'
      }
    })
  }
}
