<template>
  <div class="dynamic-theme-settings">
    <div class="settings-header">
      <div class="header-title">
        <el-icon><MagicStick /></el-icon>
        <span>动态主题设置</span>
      </div>
      <el-switch
        v-model="localConfig.enabled"
        @change="handleEnabledChange"
        active-text="开启"
        inactive-text="关闭"
      />
    </div>

    <div class="settings-content" :class="{ disabled: !localConfig.enabled }">
      <div class="setting-section">
        <div class="section-title">
          <el-icon><Sunrise /></el-icon>
          <span>日出日落自动切换</span>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-name">根据时间自动切换深浅主题</div>
            <div class="setting-desc">白天使用浅色主题，夜晚使用深色主题</div>
          </div>
          <el-switch
            v-model="localConfig.sunRiseSunSet"
            @change="handleConfigChange"
            :disabled="!localConfig.enabled"
          />
        </div>
        <div class="time-settings" v-if="localConfig.sunRiseSunSet && localConfig.enabled">
          <div class="time-item">
            <el-icon><Sunny /></el-icon>
            <span class="time-label">日出时间</span>
            <el-time-picker
              v-model="sunriseTime"
              format="HH:mm"
              value-format="HH:mm"
              size="small"
              @change="handleSunriseChange"
            />
          </div>
          <div class="time-item">
            <el-icon><Moon /></el-icon>
            <span class="time-label">日落时间</span>
            <el-time-picker
              v-model="sunsetTime"
              format="HH:mm"
              value-format="HH:mm"
              size="small"
              @change="handleSunsetChange"
            />
          </div>
        </div>
      </div>

      <div class="setting-section">
        <div class="section-title">
          <el-icon><Cloudy /></el-icon>
          <span>天气联动主题</span>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-name">根据天气自动调整主题色调</div>
            <div class="setting-desc">不同天气显示不同的色调氛围</div>
          </div>
          <el-switch
            v-model="localConfig.weatherBased"
            @change="handleConfigChange"
            :disabled="!localConfig.enabled"
          />
        </div>
        <div class="weather-preview" v-if="localConfig.weatherBased && localConfig.enabled">
          <div class="weather-item" v-for="weather in weatherTypes" :key="weather.key">
            <div class="weather-icon" :style="{ background: weather.color }">
              <el-icon>{{ weather.icon }}</el-icon>
            </div>
            <div class="weather-name">{{ weather.name }}</div>
            <div class="weather-desc">{{ weather.desc }}</div>
          </div>
        </div>
      </div>

      <div class="setting-section">
        <div class="section-title">
          <el-icon><Timer /></el-icon>
          <span>其他设置</span>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-name">检查间隔</div>
            <div class="setting-desc">系统检查时间和天气的间隔（秒）</div>
          </div>
          <el-input-number
            v-model="localConfig.autoSwitchInterval"
            :min="10"
            :max="3600"
            size="small"
            @change="handleConfigChange"
            :disabled="!localConfig.enabled"
          />
        </div>
      </div>

      <div class="setting-section">
        <div class="section-title">
          <el-icon><Present /></el-icon>
          <span>节日彩蛋</span>
        </div>
        <div class="holiday-list">
          <div
            v-for="holiday in holidayThemes"
            :key="holiday.id"
            class="holiday-item"
            :class="{ active: isHolidayActive(holiday) }"
          >
            <div class="holiday-preview" :style="{ background: holiday.theme.colors.gradientStart }">
              <div class="holiday-gradient" :style="{ background: `linear-gradient(135deg, ${holiday.theme.colors.gradientStart}, ${holiday.theme.colors.gradientEnd})` }"></div>
            </div>
            <div class="holiday-info">
              <div class="holiday-name">{{ holiday.name }}</div>
              <div class="holiday-date">{{ holiday.startDate }} ~ {{ holiday.endDate }}</div>
            </div>
            <el-tag v-if="isHolidayActive(holiday)" size="small" type="success">进行中</el-tag>
          </div>
        </div>
        <div class="holiday-desc">
          <el-icon><InfoFilled /></el-icon>
          <span>节日期间会自动推送限定主题，届时可选择使用</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, markRaw } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { ElMessage } from 'element-plus'
import { HOLIDAY_THEMES } from '@/constants/themes'
import type { DynamicThemeConfig, HolidayTheme } from '@/types'
import {
  MagicStick,
  Sunrise,
  Sunny,
  Moon,
  Cloudy,
  Timer,
  Present,
  InfoFilled
} from '@element-plus/icons-vue'

const themeStore = useThemeStore()

const localConfig = ref<DynamicThemeConfig>({
  ...themeStore.dynamicThemeConfig
})

const sunriseTime = ref(themeStore.sunriseSunsetTimes.sunrise)
const sunsetTime = ref(themeStore.sunriseSunsetTimes.sunset)

const holidayThemes = ref<HolidayTheme[]>(HOLIDAY_THEMES as HolidayTheme[])

const weatherTypes = [
  { key: 'sunny', name: '晴天', desc: '暖色调', color: '#f59e0b', icon: markRaw(Sunny) },
  { key: 'cloudy', name: '多云', desc: '灰色调', color: '#64748b', icon: markRaw(Cloudy) },
  { key: 'rainy', name: '雨天', desc: '冷蓝色调', color: '#3b82f6', icon: markRaw(Cloudy) },
  { key: 'snowy', name: '雪天', desc: '白色调', color: '#e2e8f0', icon: markRaw(Moon) },
  { key: 'windy', name: '大风', desc: '天蓝色调', color: '#0ea5e9', icon: markRaw(Sunrise) },
  { key: 'foggy', name: '雾天', desc: '灰色调', color: '#6b7280', icon: markRaw(Cloudy) },
  { key: 'thunderstorm', name: '雷暴', desc: '紫色调', color: '#7c3aed', icon: markRaw(MagicStick) }
]

watch(
  () => themeStore.dynamicThemeConfig,
  (val) => {
    localConfig.value = { ...val }
  },
  { deep: true }
)

watch(
  () => themeStore.sunriseSunsetTimes,
  (val) => {
    sunriseTime.value = val.sunrise
    sunsetTime.value = val.sunset
  }
)

const handleEnabledChange = () => {
  themeStore.updateDynamicThemeConfig({ enabled: localConfig.value.enabled })
  ElMessage.success(localConfig.value.enabled ? '动态主题已开启' : '动态主题已关闭')
}

const handleConfigChange = () => {
  themeStore.updateDynamicThemeConfig(localConfig.value)
}

const handleSunriseChange = (val: string) => {
  themeStore.updateSunriseSunsetTimes(val, sunsetTime.value)
  ElMessage.success('日出时间已更新')
}

const handleSunsetChange = (val: string) => {
  themeStore.updateSunriseSunsetTimes(sunriseTime.value, val)
  ElMessage.success('日落时间已更新')
}

const isHolidayActive = (holiday: HolidayTheme): boolean => {
  return themeStore.activeHolidayTheme?.id === holiday.id
}
</script>

<style scoped lang="scss">
.dynamic-theme-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--theme-surface);
  border-radius: var(--theme-border-radius);
  backdrop-filter: blur(10px);
  border: 1px solid var(--theme-border);
  padding: 20px;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--theme-border);

  .header-title {
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
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 20px;

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

.setting-section {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .section-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 500;
    color: var(--theme-text-primary);

    .el-icon {
      color: var(--theme-primary);
      font-size: 16px;
    }
  }

  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: rgba(var(--theme-primary-rgb, 102, 126, 234), 0.05);
    border-radius: calc(var(--theme-border-radius) * 0.75);

    .setting-info {
      .setting-name {
        font-size: 14px;
        color: var(--theme-text-primary);
        margin-bottom: 2px;
      }

      .setting-desc {
        font-size: 12px;
        color: var(--theme-text-secondary);
      }
    }
  }
}

.time-settings {
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  background: rgba(var(--theme-primary-rgb, 102, 126, 234), 0.05);
  border-radius: calc(var(--theme-border-radius) * 0.75);

  .time-item {
    display: flex;
    align-items: center;
    gap: 8px;

    .el-icon {
      color: var(--theme-primary);
      font-size: 16px;
    }

    .time-label {
      font-size: 14px;
      color: var(--theme-text-secondary);
      margin-right: 8px;
    }
  }
}

.weather-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;

  .weather-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 12px;
    background: rgba(var(--theme-primary-rgb, 102, 126, 234), 0.05);
    border-radius: calc(var(--theme-border-radius) * 0.75);
    text-align: center;

    .weather-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin-bottom: 4px;

      .el-icon {
        font-size: 20px;
      }
    }

    .weather-name {
      font-size: 13px;
      font-weight: 500;
      color: var(--theme-text-primary);
    }

    .weather-desc {
      font-size: 11px;
      color: var(--theme-text-secondary);
    }
  }
}

.holiday-list {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .holiday-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba(var(--theme-primary-rgb, 102, 126, 234), 0.05);
    border-radius: calc(var(--theme-border-radius) * 0.75);
    transition: all 0.3s ease;

    &.active {
      background: color-mix(in srgb, var(--theme-success) 15%, transparent);
      border: 1px solid color-mix(in srgb, var(--theme-success) 30%, transparent);
    }

    .holiday-preview {
      position: relative;
      width: 50px;
      height: 50px;
      border-radius: 8px;
      overflow: hidden;

      .holiday-gradient {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
    }

    .holiday-info {
      flex: 1;

      .holiday-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--theme-text-primary);
        margin-bottom: 2px;
      }

      .holiday-date {
        font-size: 12px;
        color: var(--theme-text-secondary);
      }
    }
  }
}

.holiday-desc {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px;
  font-size: 12px;
  color: var(--theme-text-secondary);
  background: rgba(var(--theme-info-rgb, 59, 130, 246), 0.1);
  border-radius: calc(var(--theme-border-radius) * 0.75);

  .el-icon {
    color: var(--theme-info);
    font-size: 14px;
  }
}
</style>
