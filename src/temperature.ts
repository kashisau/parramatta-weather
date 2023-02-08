import { EnvVars, responseConfig } from ".";

/**
 * Retrieves the temperature forecast for our location of interest.
 * @param {string} WW_API_KEY   An API key for Willy Weather API
 * @returns {JSON}
 */
export default async function GetTemperature({ WW_API_KEY }: EnvVars) {
    const dateFormatOptions : Intl.DateTimeFormatOptions = {
        timeZone: 'Australia/Sydney',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      };
  
    const dateFormatter = new Intl.DateTimeFormat([], dateFormatOptions)
    const dateMMDDYyyy = dateFormatter.format(new Date())
    const dateParts = dateMMDDYyyy.split('/')
    const currentDateString = `${dateParts[2]}-${dateParts[0].padStart(2, "0")}-${dateParts[1].padStart(2, "0")}`

    const forecastUrl = `https://api.willyweather.com.au/v2/${WW_API_KEY}/locations/4659/weather.json?forecasts=temperature&days=1&startDate=${currentDateString}`
    const forecastResponse = await fetch(forecastUrl)

    const forecastData: any = await forecastResponse.json()
    if (forecastData.error)
        return new Response(
            JSON.stringify({  "error" : [
            {
                "type": "rest",
                "messageId": `UPSTREAM500`,
                "message": `UPSTREAM500: ${JSON.stringify(forecastData.error.description)}`,
                "explanation": "The Weather API origin for this resource threw an exception. Please see the message above.",
                "action": "Try fixing up the API key that's used for the weather service, or check that the paths for access haven't changed."
            }
            ]}),
            {
            ...responseConfig,
            status: 500,
            statusText: 'Upstream access error'
            }
        )

    const forecastDataString = JSON.stringify(forecastData, null, 2)

    return new Response(forecastDataString, responseConfig)
}