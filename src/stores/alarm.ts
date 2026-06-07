import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Alarm } from '@/types'
import { STORAGE_KEYS } from '@/constants'
import { ElNotification } from 'element-plus'
import { Bell } from '@element-plus/icons-vue'

export const useAlarmStore = defineStore('alarm', () => {
  const alarms = ref<Alarm[]>([])
  const activeAlarms = ref<Set<string>>(new Set())
  let checkTimer: number | null = null

  const loadAlarms = () => {
    const saved = localStorage.getItem(STORAGE_KEYS.ALARMS)
    if (saved) {
      try {
        alarms.value = JSON.parse(saved)
      } catch (e) {
        alarms.value = []
      }
    }
  }

  const saveAlarms = () => {
    localStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(alarms.value))
  }

  const addAlarm = (alarm: Omit<Alarm, 'id'>) => {
    const newAlarm: Alarm = {
      ...alarm,
      id: Date.now().toString()
    }
    alarms.value.push(newAlarm)
    saveAlarms()
    return newAlarm
  }

  const updateAlarm = (id: string, updates: Partial<Alarm>) => {
    const index = alarms.value.findIndex(a => a.id === id)
    if (index !== -1) {
      alarms.value[index] = { ...alarms.value[index], ...updates }
      saveAlarms()
    }
  }

  const deleteAlarm = (id: string) => {
    alarms.value = alarms.value.filter(a => a.id !== id)
    activeAlarms.value.delete(id)
    saveAlarms()
  }

  const toggleAlarm = (id: string) => {
    const alarm = alarms.value.find(a => a.id === id)
    if (alarm) {
      alarm.enabled = !alarm.enabled
      saveAlarms()
    }
  }

  const shouldTrigger = (alarm: Alarm): boolean => {
    if (!alarm.enabled) return false
    if (activeAlarms.value.has(alarm.id)) return false

    const now = new Date()
    const [hours, minutes] = alarm.time.split(':').map(Number)
    
    if (now.getHours() !== hours || now.getMinutes() !== minutes) return false

    const day = now.getDay()
    switch (alarm.repeat) {
      case 'once':
        return true
      case 'daily':
        return true
      case 'weekday':
        return day >= 1 && day <= 5
      case 'weekend':
        return day === 0 || day === 6
      default:
        return true
    }
  }

  const triggerAlarm = (alarm: Alarm) => {
    activeAlarms.value.add(alarm.id)
    
    ElNotification({
      title: '闹钟提醒',
      message: `${alarm.name || '闹钟'} - ${alarm.time}`,
      duration: 10000,
      icon: Bell,
      customClass: 'alarm-notification',
      onClick: () => {
        dismissAlarm(alarm.id)
      }
    })

    if (alarm.sound) {
      playAlarmSound()
    }

    if (alarm.repeat === 'once') {
      setTimeout(() => {
        updateAlarm(alarm.id, { enabled: false })
        activeAlarms.value.delete(alarm.id)
      }, 60000)
    }

    setTimeout(() => {
      activeAlarms.value.delete(alarm.id)
    }, 60000)
  }

  const dismissAlarm = (id: string) => {
    activeAlarms.value.delete(id)
  }

  const playAlarmSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      
      oscillator.start()
      
      setTimeout(() => {
        oscillator.stop()
        audioContext.close()
      }, 2000)
    } catch (e) {
      console.log('无法播放提示音')
    }
  }

  const startChecking = () => {
    if (checkTimer) return
    checkTimer = window.setInterval(() => {
      const now = new Date()
      if (now.getSeconds() === 0) {
        alarms.value.forEach(alarm => {
          if (shouldTrigger(alarm)) {
            triggerAlarm(alarm)
          }
        })
      }
    }, 1000)
  }

  const stopChecking = () => {
    if (checkTimer) {
      clearInterval(checkTimer)
      checkTimer = null
    }
  }

  return {
    alarms,
    activeAlarms,
    loadAlarms,
    addAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    startChecking,
    stopChecking,
    dismissAlarm
  }
})
