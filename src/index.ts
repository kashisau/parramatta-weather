import CheckAuth from "./auth";
import GetTemperature from "./temperature";
import GetWeather from "./weather";

const routesRegExp = /\/home\/api\/v[\d]+\/(weather|temperature)$/i

export interface EnvVars {
  WW_API_KEY: string,
  VALID_BEARER_TOKEN: string
}

export const responseConfig: ResponseInit = {
  headers: {
    'content-type': 'application/json;charset=UTF-8',
    'Access-Control-Allow-Origin': "*",
    'Access-Control-Allow-Headers': "*"
  }
}

export default {
  // Router
  async fetch(request: Request, env: EnvVars) {
    
    const authFailure = CheckAuth(request, env)
    if (authFailure) return authFailure

    const { url } = request

    const routeMatches = url.match(routesRegExp)
    
    if (!routeMatches)
      return RouteNotFound(url)

    const resource = routeMatches.pop()
    switch (resource) {
      case 'weather':
        return await GetWeather(env)
      case 'temperature':
        return await GetTemperature(env)
        break;
      default:
        return RouteNotFound(url)
    }
  }
}

function RouteNotFound(url: string): Response {
  return new Response(
    JSON.stringify({  "error" : [
    {
        "type": "rest",
        "messageId": `404`,
        "message": `404: ${url} is an unknown request path`,
        "explanation": "This is an unknown resource for this service.",
        "action": "Please check the path being submitted and try again."
    }
    ]}),
    {
    ...responseConfig,
    status: 404,
    statusText: 'Not found'
    }
)
}