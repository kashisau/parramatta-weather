import { type EnvVars, responseConfig } from '.'

/**
 * CheckAuth is a function that validates the authorization header in a request against a supplied bearer token.
 * If the authorization header is missing or the supplied token is invalid, it returns a 401 Unauthorized response
 * with an error message indicating the issue and instructions for resubmitting the request with a valid token.
 *
 * @param {Request} request - The incoming request object.
 * @param {EnvVars} env - The environment variables containing the valid bearer token.
 * @returns {Response} - A Response object indicating the result of the authorization check.
 */
export default function CheckAuth (request: Request, env: EnvVars): Response | undefined {
  const { VALID_BEARER_TOKEN } = env
  const authHeader = request.headers.get('Authorization')
  const authTokenSupplied = authHeader?.split(' ')?.pop()

  if (authHeader === null || authTokenSupplied !== VALID_BEARER_TOKEN) {
    const errorCode = authHeader === null ? 'AUTHMISSING01' : 'AUTHINVALID01'

    return new Response(
      JSON.stringify({
        error: [
          {
            type: 'rest',
            messageId: `${errorCode}`,
            message: `${errorCode}: You must supply a valid Bearer token to access this resource.`,
            explanation: 'This resource is guarded by an authorisation token, which must be put into an `authorization` header, with `bearer <token>` as the value (with a valid token value, of course)',
            action: 'Resubmit the request with the `authorization` header and valid token'
          }
        ]
      }),
      {
        ...responseConfig,
        status: 401,
        statusText: 'Unauthorised'
      }
    )
  }
}
