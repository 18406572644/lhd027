<template>
  <div class="app-container" :class="{ 'dark-mode': isDark, 'widgets-mode': showWidgets }">
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
          @click.stop="toggleWidgetsMode"
          :class="{ 'active': showWidgets }"
        >
          <el-icon><Grid /></el-icon>
          小组件
          <span v-if="widgets.length > 0" class="widget-badge">
            {{ widgets.length }}
          </span>
        </el-button>
        <el-button 
          link 
          size="small"
          @click.stop="goToWidgetLibrary"
        >
          <el-icon><Collection /></el-icon>
          小组件库
        </el-button>
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
      <div v-if="!showWidgets" class="main-content">
        <ClockDisplay />
        <WeatherCard />
        <ForecastPanel />
        
        <el-tabs v-model="activeTab" class="main-tabs">
          <el-tab-pane label="闹钟" name="alarm">
            <AlarmPanel />
          </el-tab-pane>
          <el-tab-pane label="专注" name="focus">
            <FocusPanel />
          </el-tab-pane>
          <el-tab-pane label="设置" name="settings">
            <SettingsPanel />
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <div v-else class="widgets-area" @click="handleAreaClick">
        <div class="widgets-empty" v-if="widgets.length === 0">
          <div class="empty-icon">🧩</div>
          <div class="empty-title">暂无小组件</div>
          <div class="empty-desc">点击顶部"小组件库"按钮添加小组件</div>
          <el-button type="primary" @click="goToWidgetLibrary">
            <el-icon><Plus /></el-icon>
            添加小组件
          </el-button>
        </div>
        
        <WidgetContainer
          v-for="widget in widgets"
          :key="widget.id"
          :widget="widget"
          @open-settings="openWidgetSettings"
        />
      </div>
    </main>

    <footer class="app-footer">
      <span v-if="!showWidgets">Powered by Tauri + Vue3 + Element Plus</span>
      <span v-else>拖拽移动小组件 · 边缘拖动调整大小 · 点击设置修改样式</span>
    </footer>
    
    <WidgetSettingsDialog 
      v-model="settingsDialogVisible" 
      :widget="selectedWidget"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAlarmStore } from '@/stores/alarm'
import { useWidgetStore } from '@/stores/widget'
import { useTodoStore } from '@/stores/todo'
import { useFocusStore } from '@/stores/focus'
import { appWindow } from '@tauri-apps/api/window'
import { Grid, Collection, Refresh, Minus, Close, Plus } from '@element-plus/icons-vue'
import type { Widget } from '@/types'

import ClockDisplay from '@/components/ClockDisplay.vue'
import WeatherCard from '@/components/WeatherCard.vue'
import ForecastPanel from '@/components/ForecastPanel.vue'
import CitySelector from '@/components/CitySelector.vue'
import AlarmPanel from '@/components/AlarmPanel.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import WidgetContainer from '@/components/WidgetContainer.vue'
import WidgetSettingsDialog from '@/components/WidgetSettingsDialog.vue'
import FocusPanel from '@/components/FocusPanel.vue'

const router = useRouter()
const appStore = useAppStore()
const alarmStore = useAlarmStore()
const widgetStore = useWidgetStore()
const todoStore = useTodoStore()
const focusStore = useFocusStore()
const { widgets, activeWidgetId } = storeToRefs(widgetStore)
const isDark = computed(() => appStore.isDark)

const activeTab = ref('alarm')
const showWidgets = ref(false)
const settingsDialogVisible = ref(false)
const selectedWidget = ref<Widget | null>(null)

const toggleWidgetsMode = () => {
  showWidgets.value = !showWidgets.value
}

const goToWidgetLibrary = () => {
  router.push('/widgets')
}

const openWidgetSettings = (widget: Widget) => {
  selectedWidget.value = widget
  settingsDialogVisible.value = true
}

const handleAreaClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    activeWidgetId.value = null
  }
}

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
  widgetStore.loadWidgets()
  todoStore.loadTodos()
  focusStore.loadAll()
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
        position: relative;
        
        &:hover {
          color: #667eea;
        }
        
        &.active {
          color: #667eea;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 8px;
        }
        
        .widget-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #667eea;
          color: white;
          font-size: 10px;
          padding: 1px 5px;
          border-radius: 10px;
          font-weight: 600;
        }
      }
    }
  }
  
  .app-main {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    min-height: 0;
    
    .main-content {
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .widgets-area {
      height: 100%;
      position: relative;
      overflow: hidden;
      
      .widgets-empty {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        
        .empty-icon {
          font-size: 64px;
          opacity: 0.5;
        }
        
        .empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #64748b;
        }
        
        .empty-desc {
          font-size: 14px;
          color: #94a3b8;
          margin-bottom: 8px;
        }
      }
    }
    
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
          
          &.active {
            color: #a5b4fc;
            background: rgba(165, 180, 252, 0.15);
          }
        }
      }
    }
    
    .app-main {
      .widgets-area {
        .widgets-empty {
          .empty-title {
            color: #94a3b8;
          }
          
          .empty-desc {
            color: #64748b;
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
  
  &.widgets-mode {
    .app-main {
      padding: 0;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    }
    
    &.dark-mode .app-main {
      background: linear-gradient(135deg, rgba(165, 180, 252, 0.08) 0%, rgba(196, 181, 253, 0.08) 100%);
    }
  }
}
</style>
