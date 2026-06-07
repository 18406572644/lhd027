<template>
  <div class="float-window" :class="{ 'dark-mode': isDark }" @mousedown="startDrag">
    <div class="float-content">
      <div class="float-time">{{ currentTime }}</div>
      <div class="float-info">
        <span v-if="appStore.currentWeather" class="float-weather">
          {{ getWeatherIcon(appStore.currentWeather.weather) }}
          {{ appStore.currentWeather.temperature }}°
        </span>
        <span class="float-date">{{ currentDate }}</span>
      </div>
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
import { invoke } from '@tauri-apps/api/tauri'

import dayjs from 'dayjs'

const appStore = useAppStore()
const isDark = computed(() => appStore.isDark)

const now = ref(dayjs())
let timer: number | null = null

const currentTime = computed(() => now.value.format('HH:mm'))
const currentDate = computed(() => now.value.format('MM/DD'))

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
  
  .float-content {
    display: flex;
    align-items: baseline;
    gap: 16px;
    
    .float-time {
      font-size: 48px;
      font-weight: 200;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
      font-variant-numeric: tabular-nums;
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
  
  &.dark-mode {
    background: rgba(15, 23, 42, 0.85);
    
    .float-content {
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
