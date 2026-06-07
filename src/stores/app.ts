import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { City, CurrentWeather, ForecastDay, ThemeMode } from '@/types'
import { CITIES, WEATHER_KEY, WEATHER_BASE_URL, STORAGE_KEYS } from '@/constants'
import axios from 'axios'

export const useAppStore = defineStore('app', () => {
  const selectedCity = ref<City>(CITIES[0])
  const currentWeather = ref<CurrentWeather | null>(null)
  const forecast = ref<ForecastDay[]>([])
  const loading = ref(false)
  const lastUpdate = ref<number>(0)
  const themeMode = ref<ThemeMode>('light')
  const isDark = ref(false)
  const floatWindowEnabled = ref(false)

  const setSelectedCity = (city: City) => {
    selectedCity.value = city
    localStorage.setItem(STORAGE_KEYS.SELECTED_CITY, JSON.stringify(city))
    fetchWeather()
  }

  const setThemeMode = (mode: ThemeMode) => {
    themeMode.value = mode
    localStorage.setItem(STORAGE_KEYS.THEME, mode)
    applyTheme()
  }

  const applyTheme = () => {
    const html = document.documentElement
    if (themeMode.value === 'dark') {
      html.classList.add('dark')
      isDark.value = true
    } else if (themeMode.value === 'light') {
      html.classList.remove('dark')
      isDark.value = false
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        html.classList.add('dark')
        isDark.value = true
      } else {
        html.classList.remove('dark')
        isDark.value = false
      }
    }
  }

  const setFloatWindowEnabled = (enabled: boolean) => {
    floatWindowEnabled.value = enabled
    localStorage.setItem(STORAGE_KEYS.FLOAT_WINDOW, String(enabled))
  }

  const fetchWeather = async () => {
    loading.value = true
    try {
      const [currentRes, forecastRes] = await Promise.all([
        axios.get(`${WEATHER_BASE_URL}/weatherInfo`, {
          params: {
            city: selectedCity.value.adcode,
            key: WEATHER_KEY,
            extensions: 'base'
          }
        }),
        axios.get(`${WEATHER_BASE_URL}/weatherInfo`, {
          params: {
            city: selectedCity.value.adcode,
            key: WEATHER_KEY,
            extensions: 'all'
          }
        })
      ])

      if (currentRes.data.status === '1' && currentRes.data.lives?.length > 0) {
        currentWeather.value = currentRes.data.lives[0]
      }

      if (forecastRes.data.status === '1' && forecastRes.data.forecasts?.length > 0) {
        forecast.value = forecastRes.data.forecasts[0].casts || []
      }

      lastUpdate.value = Date.now()
    } catch (error) {
      console.error('获取天气数据失败:', error)
      currentWeather.value = getMockCurrentWeather()
      forecast.value = getMockForecast()
      lastUpdate.value = Date.now()
    } finally {
      loading.value = false
    }
  }

  const getMockCurrentWeather = (): CurrentWeather => ({
    province: selectedCity.value.province,
    city: selectedCity.value.name,
    adcode: selectedCity.value.adcode,
    weather: '晴',
    temperature: '22',
    winddirection: '东',
    windpower: '3',
    humidity: '45',
    reporttime: new Date().toISOString()
  })

  const getMockForecast = (): ForecastDay[] => {
    const days = ['今天', '明天', '后天', '周四', '周五']
    const weathers = ['晴', '多云', '阴', '小雨', '晴']
    return days.map((day, i) => ({
      date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
      week: day,
      dayweather: weathers[i],
      nightweather: weathers[i] === '晴' ? '晴' : '多云',
      daytemp: String(20 + Math.floor(Math.random() * 10)),
      nighttemp: String(12 + Math.floor(Math.random() * 8)),
      daywind: '东南风',
      nightwind: '东风',
      daypower: '3',
      nightpower: '2'
    }))
  }

  const loadFromStorage = () => {
    const savedCity = localStorage.getItem(STORAGE_KEYS.SELECTED_CITY)
    if (savedCity) {
      try {
        selectedCity.value = JSON.parse(savedCity)
      } catch (e) {
        selectedCity.value = CITIES[0]
      }
    }

    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode
    if (savedTheme) {
      themeMode.value = savedTheme
    }
    applyTheme()

    const savedFloat = localStorage.getItem(STORAGE_KEYS.FLOAT_WINDOW)
    if (savedFloat) {
      floatWindowEnabled.value = savedFloat === 'true'
    }
  }

  return {
    selectedCity,
    currentWeather,
    forecast,
    loading,
    lastUpdate,
    themeMode,
    isDark,
    floatWindowEnabled,
    setSelectedCity,
    setThemeMode,
    applyTheme,
    setFloatWindowEnabled,
    fetchWeather,
    loadFromStorage
  }
})
