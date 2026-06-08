<template>
  <div class="settings-panel">
    <div class="panel-header">
      <div class="panel-title">
        <el-icon><Setting /></el-icon>
        <span>设置</span>
      </div>
      <div class="current-theme-info" v-if="themeStore.activeHolidayTheme">
        <el-tag type="success" effect="light">
          🎉 {{ themeStore.activeHolidayTheme.name }}进行中
        </el-tag>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="settings-tabs">
      <el-tab-pane label="主题选择" name="theme">
        <template #label>
          <el-icon><Brush /></el-icon>
          主题
        </template>
        <ThemeSelector />
      </el-tab-pane>

      <el-tab-pane label="主题市场" name="market">
        <template #label>
          <el-icon><Shop /></el-icon>
          市场
        </template>
        <ThemeMarket />
      </el-tab-pane>

      <el-tab-pane label="动态主题" name="dynamic">
        <template #label>
          <el-icon><MagicStick /></el-icon>
          动态
        </template>
        <DynamicThemeSettings />
      </el-tab-pane>

      <el-tab-pane label="通用设置" name="general">
        <template #label>
          <el-icon><Tools /></el-icon>
          通用
        </template>
        <div class="general-settings">
          <div class="settings-list">
            <div class="setting-item">
              <div class="setting-info">
                <el-icon><Monitor /></el-icon>
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
                <el-icon><Timer /></el-icon>
                <div>
                  <div class="setting-name">专注悬浮窗</div>
                  <div class="setting-desc">专注时悬浮窗显示剩余时间</div>
                </div>
              </div>
              <el-switch
                v-model="localFocusFloat"
                size="small"
                @change="handleFocusFloatChange"
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

          <div class="current-theme-preview">
            <div class="preview-title">当前主题</div>
            <div class="preview-card">
              <div
                class="theme-preview"
                :style="{ background: themeStore.currentTheme.colors.background }"
              >
                <div
                  class="preview-gradient"
                  :style="{
                    background: `linear-gradient(135deg, ${themeStore.currentTheme.colors.gradientStart}, ${themeStore.currentTheme.colors.gradientEnd})`
                  }"
                ></div>
                <div class="preview-colors">
                  <div
                    class="color-dot"
                    :style="{ background: themeStore.currentTheme.colors.primary }"
                  ></div>
                  <div
                    class="color-dot"
                    :style="{ background: themeStore.currentTheme.colors.secondary }"
                  ></div>
                  <div
                    class="color-dot"
                    :style="{ background: themeStore.currentTheme.colors.accent }"
                  ></div>
                </div>
              </div>
              <div class="theme-details">
                <div class="theme-name">{{ themeStore.currentTheme.name }}</div>
                <div class="theme-author">by {{ themeStore.currentTheme.author }}</div>
                <div class="theme-stats">
                  <span class="stat">
                    <el-icon><Star /></el-icon>
                    {{ themeStore.currentTheme.rating || '-' }}
                  </span>
                  <span class="stat">
                    <el-icon><Download /></el-icon>
                    {{ themeStore.currentTheme.downloadCount || '-' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { useThemeStore } from '@/stores/theme'
import { useFocusStore } from '@/stores/focus'
import { invoke } from '@tauri-apps/api/tauri'
import { ElMessage } from 'element-plus'
import ThemeSelector from './ThemeSelector.vue'
import ThemeMarket from './ThemeMarket.vue'
import DynamicThemeSettings from './DynamicThemeSettings.vue'
import {
  Setting,
  Brush,
  Shop,
  MagicStick,
  Tools,
  Monitor,
  Timer,
  Refresh,
  InfoFilled,
  Star,
  Download
} from '@element-plus/icons-vue'

const appStore = useAppStore()
const themeStore = useThemeStore()
const focusStore = useFocusStore()

const activeTab = ref('theme')
const localFloat = ref(appStore.floatWindowEnabled)
const localFocusFloat = ref(focusStore.showFloatDuringFocus)

const isDark = computed(() => themeStore.isDarkMode)

watch(
  () => appStore.floatWindowEnabled,
  (val) => {
    localFloat.value = val
  }
)

watch(
  () => focusStore.showFloatDuringFocus,
  (val) => {
    localFocusFloat.value = val
  }
)

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

const handleFocusFloatChange = (val: boolean) => {
  focusStore.setShowFloatDuringFocus(val)
  ElMessage.success(val ? '专注时悬浮窗已开启' : '专注时悬浮窗已关闭')
}
</script>

<style scoped lang="scss">
.settings-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--theme-surface);
  border-radius: var(--theme-border-radius);
  backdrop-filter: blur(10px);
  border: 1px solid var(--theme-border);
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--theme-border);

  .panel-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: var(--theme-text-primary);

    .el-icon {
      color: var(--theme-primary);
      font-size: 20px;
    }
  }

  .current-theme-info {
    .el-tag {
      animation: pulse 2s infinite;
    }
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.settings-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  :deep(.el-tabs__header) {
    margin: 0;
    padding: 0 20px;
    border-bottom: 1px solid var(--theme-border);
  }

  :deep(.el-tabs__nav) {
    border-bottom: none;
  }

  :deep(.el-tabs__item) {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  :deep(.el-tabs__content) {
    flex: 1;
    overflow: hidden;
    padding: 0;
  }

  :deep(.el-tab-pane) {
    height: 100%;
    overflow: hidden;
  }
}

.general-settings {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  gap: 20px;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-radius: calc(var(--theme-border-radius) * 0.75);
    transition: all 0.3s ease;

    &:hover {
      background: color-mix(in srgb, var(--theme-primary) 5%, transparent);
    }

    .setting-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .el-icon {
        font-size: 20px;
        color: var(--theme-primary);
      }

      .setting-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--theme-text-primary);
      }

      .setting-desc {
        font-size: 12px;
        color: var(--theme-text-secondary);
        margin-top: 2px;
      }
    }
  }
}

.current-theme-preview {
  .preview-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--theme-text-primary);
    margin-bottom: 12px;
  }

  .preview-card {
    display: flex;
    gap: 16px;
    padding: 16px;
    background: color-mix(in srgb, var(--theme-primary) 5%, transparent);
    border-radius: var(--theme-border-radius);
    border: 1px solid var(--theme-border);

    .theme-preview {
      position: relative;
      width: 120px;
      height: 80px;
      border-radius: calc(var(--theme-border-radius) * 0.75);
      overflow: hidden;
      flex-shrink: 0;

      .preview-gradient {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 55%;
      }

      .preview-colors {
        position: absolute;
        bottom: 8px;
        left: 10px;
        display: flex;
        gap: 4px;

        .color-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.5);
        }
      }
    }

    .theme-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 4px;

      .theme-name {
        font-size: 16px;
        font-weight: 600;
        color: var(--theme-text-primary);
      }

      .theme-author {
        font-size: 12px;
        color: var(--theme-text-secondary);
      }

      .theme-stats {
        display: flex;
        gap: 16px;
        margin-top: 4px;

        .stat {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--theme-text-secondary);

          .el-icon {
            font-size: 14px;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .settings-tabs {
    :deep(.el-tabs__item) {
      font-size: 12px;
      padding: 0 12px;

      .el-icon {
        display: none;
      }
    }
  }

  .general-settings {
    padding: 16px;
  }

  .preview-card {
    flex-direction: column;

    .theme-preview {
      width: 100%;
      height: 100px;
    }
  }
}
</style>
