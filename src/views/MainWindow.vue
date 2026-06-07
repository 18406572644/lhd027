<template>
  <div class="app-container" :class="{ 'dark-mode': isDark }">
    <header class="app-header" @mousedown="startDrag">
      <div class="header-left">
        <h1 class="app-title">
          <span class="logo-icon">🌤️</span>
          天气时钟
        </h1>
        <CitySelector />
      </div>
      <div class="header-right">
        <el-button 
          link 
          size="small"
          @click.stop="refreshWeather"
          :loading="appStore.loading"
        >
          <el-icon><Refresh /></el-icon>
        </el-button>
        <el-button link size="small" @click.stop="minimizeWindow">
          <el-icon><Minus /></el-icon>
        </el-button>
        <el-button link size="small" @click.stop="closeWindow">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </header>

    <main class="app-main">
      <ClockDisplay />
      <WeatherCard />
      <ForecastPanel />
      
      <el-tabs v-model="activeTab" class="main-tabs">
        <el-tab-pane label="闹钟" name="alarm">
          <AlarmPanel />
        </el-tab-pane>
        <el-tab-pane label="设置" name="settings">
          <SettingsPanel />
        </el-tab-pane>
      </el-tabs>
    </main>

    <footer class="app-footer">
      <span>Powered by Tauri + Vue3 + Element Plus</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useAlarmStore } from '@/stores/alarm'
import { invoke } from '@tauri-apps/api/tauri'
import { appWindow } from '@tauri-apps/api/window'

import ClockDisplay from '@/components/ClockDisplay.vue'
import WeatherCard from '@/components/WeatherCard.vue'
import ForecastPanel from '@/components/ForecastPanel.vue'
import CitySelector from '@/components/CitySelector.vue'
import AlarmPanel from '@/components/AlarmPanel.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'

const appStore = useAppStore()
const alarmStore = useAlarmStore()
const isDark = computed(() => appStore.isDark)

const activeTab = ref('alarm')

const startDrag = async (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest('button, .el-select, input')) return
  try {
    await appWindow.startDragging()
  } catch (err) {
    console.log('Drag not available')
  }
}

const minimizeWindow = async () => {
  try {
    await appWindow.minimize()
  } catch (err) {
    console.log('Minimize not available')
  }
}

const closeWindow = async () => {
  try {
    await appWindow.hide()
  } catch (err) {
    window.close()
  }
}

const refreshWeather = () => {
  appStore.fetchWeather()
}

onMounted(() => {
  appStore.loadFromStorage()
  alarmStore.loadAlarms()
  alarmStore.startChecking()
  appStore.fetchWeather()
  
  setInterval(() => {
    appStore.fetchWeather()
  }, 30 * 60 * 1000)
  
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (appStore.themeMode === 'auto') {
      appStore.applyTheme()
    }
  })
})
</script>

<style scoped lang="scss">
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  
  .app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(100, 116, 139, 0.1);
    cursor: move;
    user-select: none;
    z-index: 100;
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .app-title {
        font-size: 18px;
        font-weight: 600;
        color: #1e293b;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        
        .logo-icon {
          font-size: 24px;
        }
      }
    }
    
    .header-right {
      display: flex;
      align-items: center;
      gap: 4px;
      
      .el-button {
        color: #64748b;
        
        &:hover {
          color: #667eea;
        }
      }
    }
  }
  
  .app-main {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    
    .main-tabs {
      margin-top: 20px;
      
      :deep(.el-tabs__header) {
        margin-bottom: 0;
      }
      
      :deep(.el-tabs__item) {
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
  
  .app-footer {
    padding: 12px 20px;
    text-align: center;
    font-size: 12px;
    color: #94a3b8;
    background: rgba(255, 255, 255, 0.5);
  }
  
  &.dark-mode {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    
    .app-header {
      background: rgba(15, 23, 42, 0.8);
      border-bottom-color: rgba(148, 163, 184, 0.1);
      
      .header-left {
        .app-title {
          color: #f1f5f9;
        }
      }
      
      .header-right {
        .el-button {
          color: #94a3b8;
          
          &:hover {
            color: #a5b4fc;
          }
        }
      }
    }
    
    .app-footer {
      color: #64748b;
      background: rgba(15, 23, 42, 0.5);
    }
    
    :deep(.el-tabs__item) {
      color: #94a3b8;
      
      &.is-active {
        color: #a5b4fc;
      }
      
      &:hover {
        color: #a5b4fc;
      }
    }
    
    :deep(.el-tabs__active-bar) {
      background-color: #a5b4fc;
    }
    
    :deep(.el-tabs__nav-wrap::after) {
      background-color: rgba(148, 163, 184, 0.1);
    }
  }
}
</style>
