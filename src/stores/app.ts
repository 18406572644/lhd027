import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { City, CurrentWeather, ForecastDay, ThemeMode, HourlyTemperature } from '@/types'
import { CITIES, WEATHER_KEY, WEATHER_BASE_URL, STORAGE_KEYS } from '@/constants'
import axios from 'axios'
import dayjs from 'dayjs'

export const useAppStore = defineStore('app', () => {
  const selectedCity = ref<City>(CITIES[0])
  const currentWeather = ref<CurrentWeather | null>(null)
  const forecast = ref<ForecastDay[]>([])
  const hourlyTemperatures = ref<HourlyTemperature[]>([])
  const loading = ref(false)
  const lastUpdate = ref<number>(0)
  const useMockData = ref(false)
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
    let hasError = false
    
    try {
      const fetchCurrent = async () => {
        try {
          const res = await axios.get(`${WEATHER_BASE_URL}/weatherInfo`, {
            params: {
              city: selectedCity.value.adcode,
              key: WEATHER_KEY,
              extensions: 'base'
            },
            timeout: 8000
          })
          if (res.data.status === '1' && res.data.lives?.length > 0) {
            return res.data.lives[0]
          }
          console.warn('实时天气API返回业务错误:', res.data.info)
          return null
        } catch (e) {
          console.error('实时天气请求失败:', e)
          return null
        }
      }

      const fetchForecast = async () => {
        try {
          const res = await axios.get(`${WEATHER_BASE_URL}/weatherInfo`, {
            params: {
              city: selectedCity.value.adcode,
              key: WEATHER_KEY,
              extensions: 'all'
            },
            timeout: 8000
          })
          if (res.data.status === '1' && res.data.forecasts?.length > 0) {
            return res.data.forecasts[0].casts || []
          }
          console.warn('天气预报API返回业务错误:', res.data.info)
          return null
        } catch (e) {
          console.error('天气预报请求失败:', e)
          return null
        }
      }

      const [currentData, forecastData] = await Promise.all([
        fetchCurrent(),
        fetchForecast()
      ])

      if (currentData) {
        currentWeather.value = currentData
      } else {
        hasError = true
        currentWeather.value = getMockCurrentWeather()
      }

      if (forecastData && forecastData.length > 0) {
        forecast.value = forecastData
      } else {
        hasError = true
        forecast.value = getMockForecast()
      }

      hourlyTemperatures.value = generateHourlyTemperatures()

      useMockData.value = hasError
      if (hasError) {
        console.log('已启用模拟天气数据（API请求失败或Key无效）')
      }

      lastUpdate.value = Date.now()
    } catch (error) {
      console.error('获取天气数据异常，启用模拟数据:', error)
      currentWeather.value = getMockCurrentWeather()
      forecast.value = getMockForecast()
      hourlyTemperatures.value = generateHourlyTemperatures()
      useMockData.value = true
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
    const days = ['今天', '明天', '后天', '周四', '周五', '周六', '周日']
    const weathers = ['晴', '多云', '阴', '小雨', '晴', '多云', '晴']
    const precipitations = ['5', '15', '45', '80', '10', '25', '5']
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
      nightpower: '2',
      precipitation: precipitations[i]
    }))
  }

  const generateHourlyTemperatures = (): HourlyTemperature[] => {
    const baseTemp = currentWeather.value ? parseInt(currentWeather.value.temperature) : 22
    const hourlyData: HourlyTemperature[] = []
    const now = dayjs()
    
    for (let i = 0; i < 24; i++) {
      const time = now.add(i, 'hour')
      const hour = time.hour()
      let tempVariation = 0
      
      if (hour >= 6 && hour < 12) {
        tempVariation = (hour - 6) * 1.5
      } else if (hour >= 12 && hour < 16) {
        tempVariation = 9 + (hour - 12) * 0.5
      } else if (hour >= 16 && hour < 22) {
        tempVariation = 11 - (hour - 16) * 1.8
      } else {
        tempVariation = -3 - Math.abs(hour - 2) * 0.8
      }
      
      const temp = Math.round(baseTemp + tempVariation + (Math.random() - 0.5) * 2)
      hourlyData.push({
        time: time.format('HH:mm'),
        temperature: temp
      })
    }
    
    return hourlyData
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
    hourlyTemperatures,
    loading,
    lastUpdate,
    useMockData,
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
