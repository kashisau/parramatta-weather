import { type EnvVars, responseConfig } from '.'
import { DateTime } from 'luxon'
import { type WillyTemperatureResponse, type Temperature } from './types/willyWeather'

export interface TemperatureData {
  data: {
    history: HourlyTemperature[]
    forecast: HourlyTemperature[]
  }
}
export interface HourlyTemperature {
  x: string
  y: number
}

const HOURS_BEFORE = 8
const HOURS_AFTER = 9

/**
 * Transforms the temperature response into hourly temperature data based on the current time.
 *
 * @param {TemperatureResponse} tempResponse - The temperature response object.
 * @returns {TemperatureData} - The transformed hourly temperature data.
 */
export function transformToHourly (tempResponse: Temperature): TemperatureData {
  // Get the current time in Sydney.
  const currentTime = getSydneyTime()

  // Calculate the start time by subtracting the specified number of hours.
  const timeFrom = currentTime.minus({ hours: HOURS_BEFORE })

  // Calculate the end time by adding the specified number of hours.
  const timeTo = currentTime.plus({ hours: HOURS_AFTER })

  // Create an object to store the transformed temperature data.
  const temperatureData: TemperatureData = {
    data: {
      history: [],
      forecast: []
    }
  }

  // Iterate through each day in the temperature response.
  for (const { entries } of tempResponse.forecasts.temperature.days) {
    // Iterate through each entry in the day.
    for (const { dateTime: dateStamp, temperature } of entries) {
      // Convert the date stamp to a DateTime object in the Sydney timezone.
      const dateStampDate = DateTime.fromFormat(`${dateStamp} Australia/Sydney`, 'y-MM-dd TT z').setZone('Australia/Sydney')

      // Check if the date stamp is within the desired time range.
      if (dateStampDate >= timeFrom && dateStampDate <= timeTo) {
        // Format the date stamp to hourly format.
        const thisDateTimeHr = dateStampDate.toFormat('ha')

        // Create an hour object with the formatted date stamp and temperature value.
        const hour = {
          x: thisDateTimeHr,
          y: temperature
        }

        // Add the hour object to the appropriate array based on whether it's in the past or future.
        if (dateStampDate <= currentTime) {
          temperatureData.data.history.push(hour)
        } else {
          temperatureData.data.forecast.push(hour)
        }
      }
    }
  }

  return temperatureData
}

export function getSydneyTime (): DateTime {
  return DateTime.now().setZone('Australia/Sydney')
}

export function convertToYearMonthDay (date: DateTime): string {
  const dateIso8601 = date.toString()
  return dateIso8601.split('T')[0]
}

/**
 * Retrieves the temperature forecast for our location of interest.
 * @param {string} WW_API_KEY   An API key for Willy Weather API
 * @returns {Promise<Response>} The temperature forecast
 */
export default async function GetTemperature ({ WW_API_KEY }: EnvVars): Promise<Response> {
  const sydneyTime = getSydneyTime()
  const sydneyYesterday = sydneyTime.minus({ hours: HOURS_BEFORE })
  const currentDateString = convertToYearMonthDay(sydneyYesterday)

  const forecastUrl = `https://api.willyweather.com.au/v2/${WW_API_KEY}/locations/4659/weather.json?forecasts=temperature&days=2&startDate=${currentDateString}`
  const forecastResponse = await fetch(forecastUrl)

  const forecastData: WillyTemperatureResponse = await forecastResponse.json()
  if ('error' in forecastData) {
    return new Response(
      JSON.stringify({
        error: [
          {
            type: 'rest',
            messageId: 'UPSTREAM500',
            message: `UPSTREAM500: ${JSON.stringify(forecastData.error.description)}`,
            explanation: 'The Weather API origin for this resource threw an exception. Please see the message above.',
            action: "Try fixing up the API key that's used for the weather service, or check that the paths for access haven't changed."
          }
        ]
      }),
      {
        ...responseConfig,
        status: 500,
        statusText: 'Upstream access error'
      }
    )
  }

  const hourlyTemps = transformToHourly(forecastData)
  const forecastDataString = JSON.stringify(hourlyTemps, null, 2)

  return new Response(forecastDataString, responseConfig)
}
