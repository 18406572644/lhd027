export interface City {
  id: string
  name: string
  province: string
  adcode: string
}

export interface CurrentWeather {
  province: string
  city: string
  adcode: string
  weather: string
  temperature: string
  winddirection: string
  windpower: string
  humidity: string
  reporttime: string
}

export interface ForecastDay {
  date: string
  week: string
  dayweather: string
  nightweather: string
  daytemp: string
  nighttemp: string
  daywind: string
  nightwind: string
  daypower: string
  nightpower: string
}

export interface WeatherData {
  current: CurrentWeather | null
  forecast: ForecastDay[]
  lastUpdate: number
}

export interface Alarm {
  id: string
  name: string
  time: string
  enabled: boolean
  repeat: 'once' | 'daily' | 'weekday' | 'weekend'
  sound: boolean
  vibrate: boolean
}

export type ThemeMode = 'light' | 'dark' | 'auto'
