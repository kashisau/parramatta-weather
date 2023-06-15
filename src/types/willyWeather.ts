/** Common types */
interface WillyWeatherErrorResponse {
  success: false
  error: {
    code: string
    description: string
  }
}

interface Location {
  id: number
  name: string
  region: string
  state: string
  postcode: string
  timeZone: string
  lat: number
  lng: number
  typeId: number
}

/** Weather */

interface WeatherForecastEntry {
  dateTime: string
  precisCode: string
  precis: string
  precisOverlayCode: string
  night: boolean
  min: number
  max: number
}

interface WeatherForecast {
  dateTime: string
  entries: WeatherForecastEntry[]
}

interface WeatherForecasts {
  weather: {
    days: WeatherForecast[]
    units: {
      temperature: string
    }
    issueDateTime: string
  }
}

export interface WeatherData {
  location: Location
  forecasts: WeatherForecasts
}

export type WillyWeatherResponse = WeatherData | WillyWeatherErrorResponse

/** Temperature Forecasts */

interface TemperatureForecastEntry {
  dateTime: string
  temperature: number
}

interface ForecastDay {
  dateTime: string
  entries: TemperatureForecastEntry[]
}

interface TemperatureForecast {
  days: ForecastDay[]
}

interface Forecast {
  temperature: TemperatureForecast
  units: {
    temperature: string
  }
  issueDateTime: string
  carousel: {
    size: number
    start: number
  }
}

export interface Temperature {
  location: Location
  forecasts: Forecast
}

export type WillyTemperatureResponse = Temperature | WillyWeatherErrorResponse
