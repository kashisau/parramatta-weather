import { type EnvVars, responseConfig } from '.'
import { type WillyWeatherResponse } from './types/willyWeather'

/**
 * Retrieves the weather forecast for our location of interest.
 * @param {string} WW_API_KEY   An API key for Willy Weather API
 * @returns {Promise<Response>} The weather forecast for the next few days.
 */
export default async function GetWeather ({ WW_API_KEY }: EnvVars): Promise<Response> {
  const currentDate = new Date()

  const [yearString, monthString, dateString] = [
    currentDate.getFullYear().toString(),
    (currentDate.getMonth() + 1).toString().padStart(2, '0'),
    (currentDate.getDate()).toString().padStart(2, '0')
  ]

  const currentDateString = `${yearString}-${monthString}-${dateString}`

  const forecastUrl = `https://api.willyweather.com.au/v2/${WW_API_KEY}/locations/4659/weather.json?forecasts=weather&days=7&startDate=${currentDateString}`

  const controller = new AbortController()
  const { signal } = controller

  const timeoutId = setTimeout(() => {
    controller.abort()
  }, 10000)

  try {
    const forecastRequest = await fetch(forecastUrl, { signal })
    clearTimeout(timeoutId)

    const forecastData: WillyWeatherResponse = await forecastRequest.json()

    if ('error' in forecastData) {
      return new Response(
        JSON.stringify({
          error: [
            {
              type: 'rest',
              messageId: 'UPSTREAM500',
              message: `UPSTREAM500: ${JSON.stringify(forecastData.error.description)}`,
              explanation: 'The Weather API origin for this resource threw an exception. Please see the message above.',
              action: "Try fixing up the API key that's used for the weather service, check that the paths for access haven't changed, or check the date being looked up."
            }
          ]
        }),
        {
          ...responseConfig,
          status: 500,
          statusText: 'Upstream error'
        }
      )
    }

    const forecastDataString = JSON.stringify(forecastData, null, 2)

    return new Response(forecastDataString, responseConfig)
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}
