import CheckAuth from './auth'
import Options from './options'
import GetTemperature from './temperature'
import GetWeather from './weather'

const routesRegExp = /\/home\/api\/v[\d]+\/(weather|temperature)$/i

export interface EnvVars {
  WW_API_KEY: string
  VALID_BEARER_TOKEN: string
}

export const responseConfig: ResponseInit = {
  headers: {
    'content-type': 'application/json;charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*'
  }
}

export default {
  // Router
  async fetch (request: Request, env: EnvVars) {
    if (request.method === 'OPTIONS') { return await Options(request) }
    const { VALID_BEARER_TOKEN } = env

    if (VALID_BEARER_TOKEN === '') {
      return new Response(
        JSON.stringify({
          error: [
            {
              type: 'rest',
              messageId: 'SERVERAUTH500',
              message: 'SERVERAUTH500: No authentication token value has been set on the server.',
              explanation: 'The server expects an authentication token value to be set via environment variables. This has not been set.',
              action: 'Log into the server and set the VALID_BEARER_TOKEN environment variable.'
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

    const authFailure = CheckAuth(request, env)
    if (authFailure != null) return authFailure

    const { url } = request

    const routeMatches = url.match(routesRegExp)

    if (routeMatches == null) { return RouteNotFound(url) }

    const resource = routeMatches.pop()
    switch (resource) {
      case 'weather':
        return await GetWeather(env)
      case 'temperature':
        return await GetTemperature(env)
      default:
        return RouteNotFound(url)
    }
  }
}

/**
 * Handles requests for unknown routes and returns a 404 Not Found response.
 *
 * @param {string} url - The requested URL path.
 * @returns {Response} - A Response object indicating that the requested path is unknown.
 */
function RouteNotFound (url: string): Response {
  return new Response(
    JSON.stringify({
      error: [
        {
          type: 'rest',
          messageId: '404',
          message: `404: ${url} is an unknown request path`,
          explanation: 'This is an unknown resource for this service.',
          action: 'Please check the path being submitted and try again.'
        }
      ]
    }),
    {
      ...responseConfig,
      status: 404,
      statusText: 'Not found'
    }
  )
}
