<template>
  <div class="settings-panel" :class="{ 'dark-mode': isDark }">
    <div class="panel-title">
      <el-icon><Setting /></el-icon>
      <span>设置</span>
    </div>

    <div class="settings-list">
      <div class="setting-item">
        <div class="setting-info">
          <el-icon><Sunny /></el-icon>
          <div>
            <div class="setting-name">主题模式</div>
            <div class="setting-desc">切换浅色/深色主题</div>
          </div>
        </div>
        <el-radio-group v-model="localTheme" size="small" @change="handleThemeChange">
          <el-radio-button value="light">
            <el-icon><Sunny /></el-icon>
          </el-radio-button>
          <el-radio-button value="dark">
            <el-icon><Moon /></el-icon>
          </el-radio-button>
          <el-radio-button value="auto">
            <el-icon><Aim /></el-icon>
          </el-radio-button>
        </el-radio-group>
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <el-icon><PictureInPicture /></el-icon>
          <div>
            <div class="setting-name">桌面悬浮窗</div>
            <div class="setting-desc">显示迷你悬浮时钟</div>
          </div>
        </div>
        <el-switch 
          v-model="localFloat" 
          size="small"
          @change="handleFloatChange"
        />
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <el-icon><Refresh /></el-icon>
          <div>
            <div class="setting-name">刷新天气</div>
            <div class="setting-desc">手动更新天气数据</div>
          </div>
        </div>
        <el-button 
          type="primary" 
          size="small" 
          :loading="appStore.loading"
          @click="appStore.fetchWeather"
        >
          刷新
        </el-button>
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <el-icon><InfoFilled /></el-icon>
          <div>
            <div class="setting-name">关于</div>
            <div class="setting-desc">Weather Clock v1.0.0</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { invoke } from '@tauri-apps/api/tauri'
import { ElMessage } from 'element-plus'
import type { ThemeMode } from '@/types'

const appStore = useAppStore()
const isDark = computed(() => appStore.isDark)

const localTheme = ref<ThemeMode>(appStore.themeMode)
const localFloat = ref(appStore.floatWindowEnabled)

watch(() => appStore.themeMode, (val) => {
  localTheme.value = val
})

watch(() => appStore.floatWindowEnabled, (val) => {
  localFloat.value = val
})

const handleThemeChange = (val: ThemeMode) => {
  appStore.setThemeMode(val)
}

const handleFloatChange = async (val: boolean) => {
  try {
    if (val) {
      await invoke('show_float_window')
      ElMessage.success('悬浮窗已开启')
    } else {
      await invoke('hide_float_window')
      ElMessage.success('悬浮窗已关闭')
    }
    appStore.setFloatWindowEnabled(val)
  } catch (error) {
    console.error('切换悬浮窗失败:', error)
    localFloat.value = !val
    ElMessage.error('操作失败，请在Tauri环境中运行')
  }
}
</script>

<style scoped lang="scss">
.settings-panel {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  padding: 20px;
  margin-top: 20px;
  backdrop-filter: blur(10px);
  
  .panel-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 500;
    color: #1e293b;
    margin-bottom: 16px;
    
    .el-icon {
      color: #667eea;
    }
  }
  
  .settings-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-radius: 12px;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(102, 126, 234, 0.05);
    }
    
    .setting-info {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .el-icon {
        font-size: 20px;
        color: #667eea;
      }
      
      .setting-name {
        font-size: 14px;
        font-weight: 500;
        color: #1e293b;
      }
      
      .setting-desc {
        font-size: 12px;
        color: #94a3b8;
        margin-top: 2px;
      }
    }
  }
  
  &.dark-mode {
    background: rgba(30, 41, 59, 0.7);
    
    .panel-title {
      color: #f1f5f9;
      
      .el-icon {
        color: #a5b4fc;
      }
    }
    
    .setting-item {
      &:hover {
        background: rgba(165, 180, 252, 0.1);
      }
      
      .setting-info {
        .el-icon {
          color: #a5b4fc;
        }
        
        .setting-name {
          color: #f1f5f9;
        }
        
        .setting-desc {
          color: #64748b;
        }
      }
    }
  }
}
</style>
