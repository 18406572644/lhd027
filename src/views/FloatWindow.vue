<template>
  <div class="float-window" :class="{ 'dark-mode': isDark, 'focus-mode': hasActiveFocus }" @mousedown="startDrag">
    <div class="float-content">
      <template v-if="hasActiveFocus">
        <div class="float-focus-info">
          <span class="focus-phase" :class="focusStore.phase">
            {{ focusPhaseText }}
          </span>
          <span v-if="focusStore.isPaused" class="focus-paused">已暂停</span>
        </div>
        <div class="float-time focus-time" :class="{ 'paused': focusStore.isPaused }">
          {{ focusDisplayTime }}
        </div>
      </template>
      <template v-else>
        <div class="float-time">{{ currentTime }}</div>
        <div class="float-info">
          <span v-if="appStore.currentWeather" class="float-weather">
            {{ getWeatherIcon(appStore.currentWeather.weather) }}
            {{ appStore.currentWeather.temperature }}°
          </span>
          <span class="float-date">{{ currentDate }}</span>
        </div>
      </template>
    </div>
    <div class="float-actions">
      <el-button 
        link 
        size="small" 
        class="float-btn"
        @click.stop="closeFloat"
      >
        <el-icon><Close /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useFocusStore } from '@/stores/focus'
import { invoke } from '@tauri-apps/api/tauri'

import dayjs from 'dayjs'

const appStore = useAppStore()
const focusStore = useFocusStore()
const isDark = computed(() => appStore.isDark)

const now = ref(dayjs())
let timer: number | null = null

const currentTime = computed(() => now.value.format('HH:mm'))
const currentDate = computed(() => now.value.format('MM/DD'))

const hasActiveFocus = computed(() => {
  return focusStore.isRunning && focusStore.showFloatDuringFocus
})

const focusDisplayTime = computed(() => {
  if (focusStore.mode === 'countup') {
    return focusStore.formatTime(focusStore.elapsedTime)
  }
  return focusStore.formatTime(focusStore.remainingTime)
})

const focusPhaseText = computed(() => {
  if (focusStore.mode === 'pomodoro') {
    return focusStore.phase === 'focus' ? '专注中' : '休息中'
  } else if (focusStore.mode === 'countdown') {
    return '倒计时'
  } else {
    return '正计时'
  }
})

const getWeatherIcon = (weather: string): string => {
  const icons: Record<string, string> = {
    '晴': '☀️',
    '多云': '⛅',
    '阴': '☁️',
    '小雨': '🌧️',
    '中雨': '🌧️',
    '大雨': '🌧️',
    '雷阵雨': '⛈️',
    '小雪': '🌨️',
    '中雪': '🌨️',
    '大雪': '❄️',
    '雾': '🌫️',
    '霾': '🌫️',
  }
  return icons[weather] || '🌤️'
}

const startDrag = async (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest('.float-btn')) return
  try {
    await invoke('tauri://window/startDragging')
  } catch (err) {
    console.log('Not in Tauri environment')
  }
}

const closeFloat = async () => {
  try {
    await invoke('hide_float_window')
    appStore.setFloatWindowEnabled(false)
  } catch (err) {
    console.log('Not in Tauri environment')
  }
}

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = dayjs()
  }, 1000)
  
  focusStore.loadAll()
  appStore.fetchWeather()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped lang="scss">
.float-window {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: move;
  user-select: none;
  transition: all 0.3s ease;
  
  .float-content {
    display: flex;
    align-items: baseline;
    gap: 16px;
    
    .float-focus-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
      
      .focus-phase {
        font-size: 14px;
        font-weight: 600;
        padding: 4px 12px;
        border-radius: 12px;
        
        &.focus {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.15);
        }
        
        &.break {
          color: #22c55e;
          background: rgba(34, 197, 94, 0.15);
        }
      }
      
      .focus-paused {
        font-size: 12px;
        color: #f97316;
        font-weight: 500;
      }
    }
    
    .float-time {
      font-size: 48px;
      font-weight: 200;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
      font-variant-numeric: tabular-nums;
      transition: all 0.3s ease;
      
      &.focus-time {
        font-size: 56px;
        
        &.paused {
          opacity: 0.6;
        }
      }
    }
    
    .float-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      
      .float-weather {
        font-size: 18px;
        color: #1e293b;
        font-weight: 500;
      }
      
      .float-date {
        font-size: 13px;
        color: #64748b;
      }
    }
  }
  
  .float-actions {
    opacity: 0;
    transition: opacity 0.3s ease;
    
    &:hover {
      opacity: 1;
    }
  }
  
  &:hover .float-actions {
    opacity: 1;
  }
  
  &.focus-mode {
    .float-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 0;
    }
  }
  
  &.dark-mode {
    background: rgba(15, 23, 42, 0.85);
    
    .float-content {
      .float-focus-info {
        .focus-phase {
          &.focus {
            color: #f87171;
            background: rgba(248, 113, 113, 0.2);
          }
          
          &.break {
            color: #4ade80;
            background: rgba(74, 222, 128, 0.2);
          }
        }
        
        .focus-paused {
          color: #fb923c;
        }
      }
      
      .float-time {
        background: linear-gradient(135deg, #a5b4fc 0%, #c4b5fd 100%);
        -webkit-background-clip: text;
        background-clip: text;
      }
      
      .float-info {
        .float-weather {
          color: #f1f5f9;
        }
        
        .float-date {
          color: #94a3b8;
        }
      }
    }
  }
}
</style>
