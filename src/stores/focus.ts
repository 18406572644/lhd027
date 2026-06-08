import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { FocusMode, FocusPhase, FocusSettings, FocusSession } from '@/types'
import { STORAGE_KEYS, DEFAULT_FOCUS_SETTINGS, MAX_DURATION, MIN_DURATION } from '@/constants'
import dayjs from 'dayjs'

export const useFocusStore = defineStore('focus', () => {
  const isRunning = ref(false)
  const isPaused = ref(false)
  const mode = ref<FocusMode>('pomodoro')
  const phase = ref<FocusPhase>('focus')
  const remainingTime = ref(DEFAULT_FOCUS_SETTINGS.pomodoroDuration)
  const elapsedTime = ref(0)
  const settings = ref<FocusSettings>({ ...DEFAULT_FOCUS_SETTINGS })
  const sessions = ref<FocusSession[]>([])
  const showFloatDuringFocus = ref(true)

  let timer: number | null = null
  let currentSessionStart: number | null = null

  const todaySessions = computed(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return sessions.value.filter(s => 
      dayjs(s.startTime).format('YYYY-MM-DD') === today && s.completed
    )
  })

  const todayFocusCount = computed(() => {
    return todaySessions.value.filter(s => s.phase === 'focus').length
  })

  const todayFocusDuration = computed(() => {
    return todaySessions.value
      .filter(s => s.phase === 'focus')
      .reduce((sum, s) => sum + s.duration, 0)
  })

  const totalFocusDuration = computed(() => {
    return sessions.value
      .filter(s => s.phase === 'focus' && s.completed)
      .reduce((sum, s) => sum + s.duration, 0)
  })

  const totalFocusCount = computed(() => {
    return sessions.value.filter(s => s.phase === 'focus' && s.completed).length
  })

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const saveSettings = () => {
    localStorage.setItem(STORAGE_KEYS.FOCUS, JSON.stringify({
      settings: settings.value,
      showFloatDuringFocus: showFloatDuringFocus.value
    }))
  }

  const loadSettings = () => {
    const saved = localStorage.getItem(STORAGE_KEYS.FOCUS)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.settings) {
          settings.value = { ...DEFAULT_FOCUS_SETTINGS, ...data.settings }
        }
        if (typeof data.showFloatDuringFocus === 'boolean') {
          showFloatDuringFocus.value = data.showFloatDuringFocus
        }
      } catch (e) {
        console.error('Failed to load focus settings:', e)
      }
    }
    resetTime()
  }

  const saveSessions = () => {
    localStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(sessions.value))
  }

  const loadSessions = () => {
    const saved = localStorage.getItem(STORAGE_KEYS.FOCUS_SESSIONS)
    if (saved) {
      try {
        sessions.value = JSON.parse(saved)
      } catch (e) {
        sessions.value = []
      }
    }
  }

  const addSession = (sessionData: Omit<FocusSession, 'id'>) => {
    const session: FocusSession = {
      id: Date.now().toString(),
      ...sessionData
    }
    sessions.value.push(session)
    saveSessions()
  }

  const resetTime = () => {
    stopTimer()
    elapsedTime.value = 0
    if (mode.value === 'pomodoro') {
      remainingTime.value = phase.value === 'focus' 
        ? settings.value.pomodoroDuration 
        : settings.value.breakDuration
    } else if (mode.value === 'countdown') {
      remainingTime.value = settings.value.countdownDuration
    } else {
      remainingTime.value = 0
    }
  }

  const setMode = (newMode: FocusMode) => {
    if (isRunning.value) return
    mode.value = newMode
    phase.value = 'focus'
    resetTime()
  }

  const setSettings = (newSettings: Partial<FocusSettings>) => {
    settings.value = { ...settings.value, ...newSettings }
    saveSettings()
    if (!isRunning.value) {
      resetTime()
    }
  }

  const setCountdownDuration = (seconds: number) => {
    const clamped = Math.max(MIN_DURATION, Math.min(MAX_DURATION, seconds))
    settings.value.countdownDuration = clamped
    saveSettings()
    if (!isRunning.value && mode.value === 'countdown') {
      remainingTime.value = clamped
    }
  }

  const setPomodoroDuration = (seconds: number) => {
    const clamped = Math.max(MIN_DURATION, Math.min(MAX_DURATION, seconds))
    settings.value.pomodoroDuration = clamped
    saveSettings()
    if (!isRunning.value && mode.value === 'pomodoro' && phase.value === 'focus') {
      remainingTime.value = clamped
    }
  }

  const setBreakDuration = (seconds: number) => {
    const clamped = Math.max(MIN_DURATION, Math.min(MAX_DURATION, seconds))
    settings.value.breakDuration = clamped
    saveSettings()
    if (!isRunning.value && mode.value === 'pomodoro' && phase.value === 'break') {
      remainingTime.value = clamped
    }
  }

  const setShowFloatDuringFocus = (value: boolean) => {
    showFloatDuringFocus.value = value
    saveSettings()
  }

  const startTimer = () => {
    if (timer) return
    
    currentSessionStart = Date.now()
    
    timer = window.setInterval(() => {
      if (mode.value === 'countup') {
        elapsedTime.value++
        if (elapsedTime.value >= MAX_DURATION) {
          completeSession()
        }
      } else {
        remainingTime.value--
        if (remainingTime.value <= 0) {
          completeSession()
        }
      }
    }, 1000)
  }

  const stopTimer = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  const start = () => {
    if (isRunning.value) return
    isRunning.value = true
    isPaused.value = false
    startTimer()
  }

  const pause = () => {
    if (!isRunning.value || isPaused.value) return
    isPaused.value = true
    stopTimer()
    saveCurrentPartialSession()
  }

  const resume = () => {
    if (!isRunning.value || !isPaused.value) return
    isPaused.value = false
    currentSessionStart = Date.now()
    startTimer()
  }

  const stop = () => {
    if (!isRunning.value) return
    saveCurrentPartialSession()
    isRunning.value = false
    isPaused.value = false
    stopTimer()
    resetTime()
  }

  const saveCurrentPartialSession = () => {
    if (!currentSessionStart) return
    
    const endTime = Date.now()
    const actualDuration = Math.floor((endTime - currentSessionStart) / 1000)
    
    if (actualDuration >= MIN_DURATION) {
      addSession({
        mode: mode.value,
        phase: phase.value,
        startTime: currentSessionStart,
        endTime,
        duration: actualDuration,
        completed: false
      })
    }
    
    currentSessionStart = null
  }

  const completeSession = () => {
    stopTimer()
    
    let duration: number
    if (mode.value === 'countup') {
      duration = elapsedTime.value
    } else if (mode.value === 'pomodoro') {
      duration = phase.value === 'focus' 
        ? settings.value.pomodoroDuration 
        : settings.value.breakDuration
    } else {
      duration = settings.value.countdownDuration
    }
    
    const endTime = Date.now()
    const startTime = currentSessionStart || (endTime - duration * 1000)
    
    addSession({
      mode: mode.value,
      phase: phase.value,
      startTime,
      endTime,
      duration,
      completed: true
    })
    
    if (mode.value === 'pomodoro') {
      if (phase.value === 'focus') {
        phase.value = 'break'
        remainingTime.value = settings.value.breakDuration
        if (settings.value.autoStartBreak) {
          currentSessionStart = Date.now()
          startTimer()
        } else {
          isRunning.value = false
          isPaused.value = false
        }
      } else {
        phase.value = 'focus'
        remainingTime.value = settings.value.pomodoroDuration
        if (settings.value.autoStartNextRound) {
          currentSessionStart = Date.now()
          startTimer()
        } else {
          isRunning.value = false
          isPaused.value = false
        }
      }
    } else {
      isRunning.value = false
      isPaused.value = false
      resetTime()
    }
    
    currentSessionStart = null
  }

  const getSessionsByDate = (date: string): FocusSession[] => {
    return sessions.value.filter(s => 
      dayjs(s.startTime).format('YYYY-MM-DD') === date && s.completed
    )
  }

  const getFocusDurationByDate = (date: string): number => {
    return getSessionsByDate(date)
      .filter(s => s.phase === 'focus')
      .reduce((sum, s) => sum + s.duration, 0)
  }

  const getHeatmapData = (months: number = 3) => {
    const data: Record<string, number> = {}
    const end = dayjs()
    const start = end.subtract(months, 'month')
    
    for (let d = start.clone(); d.isBefore(end) || d.isSame(end, 'day'); d = d.add(1, 'day')) {
      const dateStr = d.format('YYYY-MM-DD')
      data[dateStr] = getFocusDurationByDate(dateStr)
    }
    
    return data
  }

  const clearHistory = () => {
    sessions.value = []
    saveSessions()
  }

  const loadAll = () => {
    loadSettings()
    loadSessions()
  }

  return {
    isRunning,
    isPaused,
    mode,
    phase,
    remainingTime,
    elapsedTime,
    settings,
    sessions,
    showFloatDuringFocus,
    todaySessions,
    todayFocusCount,
    todayFocusDuration,
    totalFocusDuration,
    totalFocusCount,
    formatTime,
    setMode,
    setSettings,
    setCountdownDuration,
    setPomodoroDuration,
    setBreakDuration,
    setShowFloatDuringFocus,
    start,
    pause,
    resume,
    stop,
    getSessionsByDate,
    getFocusDurationByDate,
    getHeatmapData,
    clearHistory,
    loadAll
  }
})
