import { EnvVars, responseConfig } from ".";

export default function CheckAuth(request: Request, env: EnvVars) {
    const { VALID_BEARER_TOKEN } = env
    const authHeader = request.headers.get('Authorization')
    const authTokenSupplied = authHeader?.split(' ')?.pop()

    if (authHeader === null || authTokenSupplied !== VALID_BEARER_TOKEN) {
      const errorCode = authHeader === null? 'AUTHMISSING01' : 'AUTHINVALID01'

      return new Response(
        JSON.stringify({  "error" : [
          {
            "type": "rest",
            "messageId": `${errorCode}`,
            "message": `${errorCode}: You must supply a valid Bearer token to access this resource.`,
            "explanation": "This resource is guarded by an authorisation token, which must be put into an `authorization` header, with `bearer <token>` as the value (with a valid token value, of course)",
            "action": "Resubmit the request with the `authorization` header and valid token"
          }
        ]}),
        {
          ...responseConfig,
          status: 401,
          statusText: 'Unauthorised'
        }
      )
    }
}