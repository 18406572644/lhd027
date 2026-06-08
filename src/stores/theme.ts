import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  ThemeConfig,
  ThemeMarketItem,
  ThemeComment,
  DynamicThemeConfig,
  ThemeExportData,
  WeatherCondition,
  SunriseSunsetTimes,
  HolidayTheme
} from '@/types'
import {
  PRESET_THEMES,
  DEFAULT_THEME,
  WEATHER_THEME_ADJUSTMENTS,
  HOLIDAY_THEMES,
  generateThemeId
} from '@/constants/themes'
import { STORAGE_KEYS } from '@/constants'
import dayjs from 'dayjs'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<ThemeConfig>({ ...DEFAULT_THEME })
  const customThemes = ref<ThemeConfig[]>([])
  const favoriteThemes = ref<string[]>([])
  const marketThemes = ref<ThemeMarketItem[]>([])
  const userRatings = ref<Record<string, number>>({})
  const dynamicThemeConfig = ref<DynamicThemeConfig>({
    enabled: false,
    sunRiseSunSet: false,
    weatherBased: false,
    autoSwitchInterval: 60
  })
  const isEditingTheme = ref(false)
  const editingTheme = ref<ThemeConfig | null>(null)
  const sunriseSunsetTimes = ref<SunriseSunsetTimes>({
    sunrise: '06:00',
    sunset: '18:00'
  })
  const activeHolidayTheme = ref<HolidayTheme | null>(null)

  const allThemes = computed(() => [
    ...PRESET_THEMES.map(t => ({
      ...t,
      isFavorite: favoriteThemes.value.includes(t.id)
    })),
    ...customThemes.value.map(t => ({
      ...t,
      isFavorite: favoriteThemes.value.includes(t.id)
    }))
  ])

  const favoriteThemeList = computed(() =>
    allThemes.value.filter(t => t.isFavorite)
  )

  const isDarkMode = computed(() => currentTheme.value.mode === 'dark')

  const hotThemes = computed(() =>
    [...marketThemes.value]
      .filter(t => t.status === 'approved')
      .sort((a, b) => b.downloadCount - a.downloadCount)
      .slice(0, 10)
  )

  const topRatedThemes = computed(() =>
    [...marketThemes.value]
      .filter(t => t.status === 'approved')
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10)
  )

  const newThemes = computed(() =>
    [...marketThemes.value]
      .filter(t => t.status === 'approved')
      .sort((a, b) => b.uploadedAt - a.uploadedAt)
      .slice(0, 10)
  )

  const applyTheme = (theme: ThemeConfig) => {
    currentTheme.value = { ...theme }
    const html = document.documentElement
    const cssVars = generateCSSVariables(theme)
    Object.entries(cssVars).forEach(([key, value]) => {
      html.style.setProperty(key, value)
    })
    if (theme.mode === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    localStorage.setItem(STORAGE_KEYS.CURRENT_THEME, JSON.stringify(theme))
  }

  const generateCSSVariables = (theme: ThemeConfig): Record<string, string> => {
    const shadowSize = Math.floor(theme.shadowIntensity * 20)
    const shadowOpacity = (theme.shadowIntensity * 0.3).toFixed(2)
    return {
      '--theme-primary': theme.colors.primary,
      '--theme-secondary': theme.colors.secondary,
      '--theme-accent': theme.colors.accent,
      '--theme-gradient-start': theme.colors.gradientStart,
      '--theme-gradient-end': theme.colors.gradientEnd,
      '--theme-background': theme.colors.background,
      '--theme-surface': theme.colors.surface,
      '--theme-text-primary': theme.colors.textPrimary,
      '--theme-text-secondary': theme.colors.textSecondary,
      '--theme-border': theme.colors.border,
      '--theme-success': theme.colors.success,
      '--theme-warning': theme.colors.warning,
      '--theme-error': theme.colors.error,
      '--theme-info': theme.colors.info,
      '--theme-card-opacity': String(theme.cardOpacity),
      '--theme-border-radius': `${theme.borderRadius}px`,
      '--theme-font-family': theme.fontFamily,
      '--theme-shadow': `0 ${shadowSize}px ${shadowSize * 2}px rgba(0, 0, 0, ${shadowOpacity})`,
      '--theme-shadow-sm': `0 ${Math.floor(shadowSize / 2)}px ${shadowSize}px rgba(0, 0, 0, ${Number(shadowOpacity) * 0.5})`
    }
  }

  const setThemeById = (themeId: string) => {
    const theme = allThemes.value.find(t => t.id === themeId)
    if (theme) {
      applyTheme(theme)
    }
  }

  const saveCustomTheme = (theme: ThemeConfig) => {
    const existingIndex = customThemes.value.findIndex(t => t.id === theme.id)
    if (existingIndex >= 0) {
      customThemes.value[existingIndex] = { ...theme, updatedAt: Date.now() }
    } else {
      customThemes.value.push({ ...theme, createdAt: Date.now() })
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOM_THEMES, JSON.stringify(customThemes.value))
  }

  const deleteCustomTheme = (themeId: string) => {
    customThemes.value = customThemes.value.filter(t => t.id !== themeId)
    localStorage.setItem(STORAGE_KEYS.CUSTOM_THEMES, JSON.stringify(customThemes.value))
    if (currentTheme.value.id === themeId) {
      applyTheme(DEFAULT_THEME)
    }
  }

  const toggleFavorite = (themeId: string) => {
    const index = favoriteThemes.value.indexOf(themeId)
    if (index >= 0) {
      favoriteThemes.value.splice(index, 1)
    } else {
      favoriteThemes.value.push(themeId)
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITE_THEMES, JSON.stringify(favoriteThemes.value))
  }

  const exportTheme = (theme: ThemeConfig): string => {
    const exportData: ThemeExportData = {
      version: '1.0.0',
      exportedAt: Date.now(),
      theme: {
        ...theme,
        id: generateThemeId(),
        isPreset: false,
        createdAt: Date.now()
      }
    }
    return JSON.stringify(exportData, null, 2)
  }

  const downloadThemeFile = (theme: ThemeConfig) => {
    const dataStr = exportTheme(theme)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${theme.name.replace(/\s+/g, '_')}_theme.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const importTheme = (jsonString: string): ThemeConfig | null => {
    try {
      const data: ThemeExportData = JSON.parse(jsonString)
      if (data.theme && typeof data.theme === 'object') {
        const importedTheme: ThemeConfig = {
          ...data.theme,
          id: generateThemeId(),
          isPreset: false,
          isFavorite: false,
          createdAt: Date.now()
        }
        saveCustomTheme(importedTheme)
        return importedTheme
      }
      return null
    } catch (e) {
      console.error('主题导入失败:', e)
      return null
    }
  }

  const uploadThemeToMarket = (theme: ThemeConfig, category: string): ThemeMarketItem | null => {
    const marketItem: ThemeMarketItem = {
      ...theme,
      id: generateThemeId(),
      authorId: 'user_local',
      authorName: '本地用户',
      downloadCount: 0,
      rating: 0,
      ratingCount: 0,
      comments: [],
      uploadedAt: Date.now(),
      category,
      status: 'approved'
    }
    marketThemes.value.push(marketItem)
    localStorage.setItem(STORAGE_KEYS.THEME_MARKET, JSON.stringify(marketThemes.value))
    return marketItem
  }

  const downloadFromMarket = (themeId: string) => {
    const marketTheme = marketThemes.value.find(t => t.id === themeId)
    if (marketTheme) {
      marketTheme.downloadCount++
      const customTheme: ThemeConfig = {
        ...marketTheme,
        id: generateThemeId(),
        isPreset: false,
        isFavorite: false,
        createdAt: Date.now()
      }
      saveCustomTheme(customTheme)
      localStorage.setItem(STORAGE_KEYS.THEME_MARKET, JSON.stringify(marketThemes.value))
      return customTheme
    }
    return null
  }

  const rateTheme = (themeId: string, rating: number, comment?: string) => {
    const marketTheme = marketThemes.value.find(t => t.id === themeId)
    if (marketTheme) {
      userRatings.value[themeId] = rating
      localStorage.setItem(STORAGE_KEYS.USER_RATINGS, JSON.stringify(userRatings.value))
      const newRatingCount = marketTheme.ratingCount + 1
      const newRating =
        (marketTheme.rating * marketTheme.ratingCount + rating) / newRatingCount
      marketTheme.rating = Math.round(newRating * 10) / 10
      marketTheme.ratingCount = newRatingCount
      if (comment) {
        const newComment: ThemeComment = {
          id: generateThemeId(),
          userId: 'user_local',
          userName: '本地用户',
          content: comment,
          rating,
          createdAt: Date.now(),
          likes: 0
        }
        marketTheme.comments.unshift(newComment)
      }
      localStorage.setItem(STORAGE_KEYS.THEME_MARKET, JSON.stringify(marketThemes.value))
    }
  }

  const updateDynamicThemeConfig = (config: Partial<DynamicThemeConfig>) => {
    dynamicThemeConfig.value = { ...dynamicThemeConfig.value, ...config }
    localStorage.setItem(
      STORAGE_KEYS.DYNAMIC_THEME_CONFIG,
      JSON.stringify(dynamicThemeConfig.value)
    )
    if (dynamicThemeConfig.value.enabled) {
      startDynamicThemeMonitoring()
    }
  }

  let dynamicThemeTimer: number | null = null

  const startDynamicThemeMonitoring = () => {
    if (dynamicThemeTimer) {
      clearInterval(dynamicThemeTimer)
    }
    checkDynamicTheme()
    dynamicThemeTimer = window.setInterval(() => {
      checkDynamicTheme()
    }, dynamicThemeConfig.value.autoSwitchInterval * 1000)
  }

  const stopDynamicThemeMonitoring = () => {
    if (dynamicThemeTimer) {
      clearInterval(dynamicThemeTimer)
      dynamicThemeTimer = null
    }
  }

  const checkDynamicTheme = () => {
    if (!dynamicThemeConfig.value.enabled) return

    const holidayTheme = checkHolidayTheme()
    if (holidayTheme) {
      if (activeHolidayTheme.value?.id !== holidayTheme.id) {
        activeHolidayTheme.value = holidayTheme
        applyTheme(holidayTheme.theme)
        return
      }
    } else if (activeHolidayTheme.value) {
      activeHolidayTheme.value = null
    }

    if (dynamicThemeConfig.value.sunRiseSunSet) {
      const shouldSwitch = shouldSwitchBySunriseSunset()
      if (shouldSwitch !== null) {
        const targetTheme = shouldSwitch
          ? PRESET_THEMES.find(t => t.mode === 'dark')
          : PRESET_THEMES.find(t => t.mode === 'light')
        if (targetTheme && currentTheme.value.mode !== targetTheme.mode) {
          applyTheme(targetTheme)
          return
        }
      }
    }
  }

  const checkHolidayTheme = (): HolidayTheme | null => {
    const now = dayjs()
    const monthDay = now.format('MM-DD')

    for (const holiday of HOLIDAY_THEMES) {
      if (monthDay >= holiday.startDate && monthDay <= holiday.endDate) {
        return { ...holiday, isActive: true }
      }
    }
    return null
  }

  const shouldSwitchBySunriseSunset = (): boolean | null => {
    const now = dayjs()
    const currentTime = now.format('HH:mm')
    const { sunrise, sunset } = sunriseSunsetTimes.value

    if (currentTime >= sunrise && currentTime < sunset) {
      return false
    } else {
      return true
    }
  }

  const adjustThemeByWeather = (weatherCondition: WeatherCondition) => {
    if (!dynamicThemeConfig.value.enabled || !dynamicThemeConfig.value.weatherBased) return

    const adjustments = WEATHER_THEME_ADJUSTMENTS[weatherCondition]
    if (adjustments) {
      const adjustedTheme: ThemeConfig = {
        ...currentTheme.value,
        colors: {
          ...currentTheme.value.colors,
          ...adjustments
        }
      }
      applyTheme(adjustedTheme)
    }
  }

  const updateSunriseSunsetTimes = (sunrise: string, sunset: string) => {
    sunriseSunsetTimes.value = { sunrise, sunset }
  }

  const startEditingTheme = (baseTheme?: ThemeConfig) => {
    isEditingTheme.value = true
    editingTheme.value = baseTheme
      ? JSON.parse(JSON.stringify(baseTheme))
      : {
          id: generateThemeId(),
          name: '我的主题',
          description: '自定义主题',
          author: '本地用户',
          version: '1.0.0',
          createdAt: Date.now(),
          isPreset: false,
          isFavorite: false,
          colors: { ...currentTheme.value.colors },
          cardOpacity: currentTheme.value.cardOpacity,
          borderRadius: currentTheme.value.borderRadius,
          fontFamily: currentTheme.value.fontFamily,
          shadowIntensity: currentTheme.value.shadowIntensity,
          mode: currentTheme.value.mode,
          tags: []
        }
  }

  const updateEditingTheme = (updates: Partial<ThemeConfig>) => {
    if (editingTheme.value) {
      editingTheme.value = { ...editingTheme.value, ...updates }
      const cssVars = generateCSSVariables(editingTheme.value)
      const html = document.documentElement
      Object.entries(cssVars).forEach(([key, value]) => {
        html.style.setProperty(key, value)
      })
    }
  }

  const saveEditingTheme = () => {
    if (editingTheme.value) {
      saveCustomTheme(editingTheme.value)
      applyTheme(editingTheme.value)
      cancelEditingTheme()
    }
  }

  const cancelEditingTheme = () => {
    isEditingTheme.value = false
    editingTheme.value = null
    applyTheme(currentTheme.value)
  }

  const loadFromStorage = () => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.CURRENT_THEME)
    if (savedTheme) {
      try {
        currentTheme.value = JSON.parse(savedTheme)
      } catch (e) {
        currentTheme.value = { ...DEFAULT_THEME }
      }
    }

    const savedCustomThemes = localStorage.getItem(STORAGE_KEYS.CUSTOM_THEMES)
    if (savedCustomThemes) {
      try {
        customThemes.value = JSON.parse(savedCustomThemes)
      } catch (e) {
        customThemes.value = []
      }
    }

    const savedFavorites = localStorage.getItem(STORAGE_KEYS.FAVORITE_THEMES)
    if (savedFavorites) {
      try {
        favoriteThemes.value = JSON.parse(savedFavorites)
      } catch (e) {
        favoriteThemes.value = []
      }
    }

    const savedMarketThemes = localStorage.getItem(STORAGE_KEYS.THEME_MARKET)
    if (savedMarketThemes) {
      try {
        marketThemes.value = JSON.parse(savedMarketThemes)
      } catch (e) {
        marketThemes.value = []
      }
    }

    const savedDynamicConfig = localStorage.getItem(STORAGE_KEYS.DYNAMIC_THEME_CONFIG)
    if (savedDynamicConfig) {
      try {
        dynamicThemeConfig.value = JSON.parse(savedDynamicConfig)
      } catch (e) {
        dynamicThemeConfig.value = {
          enabled: false,
          sunRiseSunSet: false,
          weatherBased: false,
          autoSwitchInterval: 60
        }
      }
    }

    const savedRatings = localStorage.getItem(STORAGE_KEYS.USER_RATINGS)
    if (savedRatings) {
      try {
        userRatings.value = JSON.parse(savedRatings)
      } catch (e) {
        userRatings.value = {}
      }
    }

    if (marketThemes.value.length === 0) {
      initializeMarketThemes()
    }

    applyTheme(currentTheme.value)

    if (dynamicThemeConfig.value.enabled) {
      startDynamicThemeMonitoring()
    }

    const holidayTheme = checkHolidayTheme()
    if (holidayTheme) {
      activeHolidayTheme.value = holidayTheme
    }
  }

  const initializeMarketThemes = () => {
    const sampleMarketThemes: ThemeMarketItem[] = PRESET_THEMES.slice(0, 8).map((theme, index) => ({
      ...theme,
      id: `market_${theme.id}`,
      authorId: `author_${index}`,
      authorName: ['设计师小王', '主题达人', '创意工坊', '视觉艺术家', 'UI设计师', '配色专家', '光影魔术师', '色彩大师'][index],
      downloadCount: Math.floor(Math.random() * 5000) + 100,
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
      ratingCount: Math.floor(Math.random() * 500) + 10,
      comments: generateSampleComments(theme.name),
      uploadedAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      category: ['简约', '深色', '自然', '科技', '梦幻', '复古', '清新', '节日'][index % 8],
      status: 'approved' as const
    }))
    marketThemes.value = sampleMarketThemes
    localStorage.setItem(STORAGE_KEYS.THEME_MARKET, JSON.stringify(marketThemes.value))
  }

  const generateSampleComments = (themeName: string): ThemeComment[] => {
    const sampleComments = [
      { content: '这个主题太美了！每天看着心情都好', rating: 5 },
      { content: '配色很舒服，推荐大家使用', rating: 5 },
      { content: `很喜欢${themeName}的感觉，很有氛围感`, rating: 4 },
      { content: '透明度调整一下就更完美了', rating: 4 },
      { content: '用了很久了，一直没换过', rating: 5 }
    ]
    return sampleComments.slice(0, Math.floor(Math.random() * 3) + 2).map((c, i) => ({
      id: `comment_${Date.now()}_${i}`,
      userId: `user_${i}`,
      userName: ['用户A', '用户B', '用户C', '用户D', '用户E'][i],
      content: c.content,
      rating: c.rating,
      createdAt: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
      likes: Math.floor(Math.random() * 50)
    }))
  }

  const getThemesByCategory = (category: string) => {
    return marketThemes.value.filter(
      t => t.status === 'approved' && t.category === category
    )
  }

  const searchThemes = (keyword: string) => {
    const lowerKeyword = keyword.toLowerCase()
    return allThemes.value.filter(
      t =>
        t.name.toLowerCase().includes(lowerKeyword) ||
        t.description.toLowerCase().includes(lowerKeyword) ||
        t.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
    )
  }

  const searchMarketThemes = (keyword: string) => {
    const lowerKeyword = keyword.toLowerCase()
    return marketThemes.value.filter(
      t =>
        t.status === 'approved' &&
        (t.name.toLowerCase().includes(lowerKeyword) ||
          t.description.toLowerCase().includes(lowerKeyword) ||
          t.authorName.toLowerCase().includes(lowerKeyword) ||
          t.tags.some(tag => tag.toLowerCase().includes(lowerKeyword)))
    )
  }

  return {
    currentTheme,
    customThemes,
    favoriteThemes,
    marketThemes,
    userRatings,
    dynamicThemeConfig,
    isEditingTheme,
    editingTheme,
    sunriseSunsetTimes,
    activeHolidayTheme,
    allThemes,
    favoriteThemeList,
    isDarkMode,
    hotThemes,
    topRatedThemes,
    newThemes,
    applyTheme,
    setThemeById,
    saveCustomTheme,
    deleteCustomTheme,
    toggleFavorite,
    exportTheme,
    downloadThemeFile,
    importTheme,
    uploadThemeToMarket,
    downloadFromMarket,
    rateTheme,
    updateDynamicThemeConfig,
    startDynamicThemeMonitoring,
    stopDynamicThemeMonitoring,
    adjustThemeByWeather,
    updateSunriseSunsetTimes,
    startEditingTheme,
    updateEditingTheme,
    saveEditingTheme,
    cancelEditingTheme,
    loadFromStorage,
    getThemesByCategory,
    searchThemes,
    searchMarketThemes
  }
})
