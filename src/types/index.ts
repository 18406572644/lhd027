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
  precipitation?: string
}

export interface HourlyTemperature {
  time: string
  temperature: number
}

export interface WeatherData {
  current: CurrentWeather | null
  forecast: ForecastDay[]
  hourlyTemperatures: HourlyTemperature[]
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

export type WidgetType = 'clock' | 'weather' | 'alarm' | 'todo' | 'calendar'

export type ClockMode = 'digital' | 'analog'
export type WeatherMode = 'current' | 'forecast'

export interface WidgetPosition {
  x: number
  y: number
}

export interface WidgetSize {
  width: number
  height: number
}

export interface WidgetStyle {
  backgroundColor: string
  textColor: string
  accentColor: string
  opacity: number
  borderRadius: number
  fontSize: 'small' | 'medium' | 'large'
}

export interface WidgetConfig {
  clockMode?: ClockMode
  weatherMode?: WeatherMode
  showSeconds?: boolean
  showDate?: boolean
  showForecastDays?: number
}

export interface Widget {
  id: string
  type: WidgetType
  title: string
  position: WidgetPosition
  size: WidgetSize
  style: WidgetStyle
  config: WidgetConfig
  zIndex: number
}

export interface WidgetLibraryItem {
  type: WidgetType
  title: string
  description: string
  icon: string
  defaultSize: WidgetSize
  defaultConfig: WidgetConfig
}

export interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: number
  dueDate?: string
  priority: 'low' | 'medium' | 'high'
}

export type FocusMode = 'pomodoro' | 'countdown' | 'countup'
export type FocusPhase = 'focus' | 'break'

export interface FocusSettings {
  pomodoroDuration: number
  breakDuration: number
  countdownDuration: number
  autoStartBreak: boolean
  autoStartNextRound: boolean
}

export interface FocusSession {
  id: string
  mode: FocusMode
  phase: FocusPhase
  startTime: number
  endTime: number
  duration: number
  completed: boolean
}

export interface FocusState {
  isRunning: boolean
  isPaused: boolean
  mode: FocusMode
  phase: FocusPhase
  remainingTime: number
  elapsedTime: number
  settings: FocusSettings
  sessions: FocusSession[]
  showFloatDuringFocus: boolean
}
