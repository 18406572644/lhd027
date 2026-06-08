<template>
  <div class="weather-card" :class="{ 'dark-mode': isDark, loading: appStore.loading }">
    <div class="weather-header">
      <div class="location">
        <el-icon><Location /></el-icon>
        <span>{{ appStore.selectedCity.name }}</span>
      </div>
      <div class="update-time" v-if="appStore.lastUpdate">
        <span v-if="appStore.useMockData" class="mock-indicator" title="API请求失败，当前使用模拟数据">
          <el-icon><Warning /></el-icon>
          模拟数据
        </span>
        <span v-else>更新于 {{ formatTime(appStore.lastUpdate) }}</span>
      </div>
    </div>

    <div class="weather-main" v-if="appStore.currentWeather">
      <div class="weather-icon">
        <span class="icon-text">{{ getWeatherIcon(appStore.currentWeather.weather) }}</span>
      </div>
      <div class="weather-info">
        <div class="temperature">
          {{ appStore.currentWeather.temperature }}<span class="unit">°C</span>
        </div>
        <div class="weather-desc">{{ appStore.currentWeather.weather }}</div>
      </div>
    </div>

    <div class="weather-details" v-if="appStore.currentWeather">
      <div class="detail-item">
        <span class="icon-emoji">💧</span>
        <span>湿度 {{ appStore.currentWeather.humidity }}%</span>
      </div>
      <div class="detail-item">
        <span class="icon-emoji">🌬️</span>
        <span>{{ appStore.currentWeather.winddirection }}风 {{ appStore.currentWeather.windpower }}级</span>
      </div>
    </div>

    <el-skeleton v-if="appStore.loading" :rows="4" animated />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'

import dayjs from 'dayjs'

const appStore = useAppStore()
const isDark = computed(() => appStore.isDark)

const formatTime = (timestamp: number) => {
  return dayjs(timestamp).format('HH:mm')
}

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
</script>

<style scoped lang="scss">
.weather-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  border-radius: 20px;
  padding: 24px;
  margin: 20px 0;
  transition: all 0.3s ease;
  
  &.loading {
    opacity: 0.7;
  }
  
  .weather-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .location {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 18px;
      font-weight: 500;
      color: #1e293b;
      
      .el-icon {
        color: #667eea;
      }
    }
    
    .update-time {
      font-size: 12px;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 4px;
      
      .mock-indicator {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #f59e0b;
        background: rgba(245, 158, 11, 0.1);
        padding: 4px 10px;
        border-radius: 12px;
        font-weight: 500;
        
        .el-icon {
          color: #f59e0b;
        }
      }
    }
  }
  
  .weather-main {
    display: flex;
    align-items: center;
    gap: 24px;
    
    .weather-icon {
      .icon-text {
        font-size: 64px;
        line-height: 1;
      }
    }
    
    .weather-info {
      .temperature {
        font-size: 56px;
        font-weight: 200;
        color: #1e293b;
        line-height: 1;
        font-variant-numeric: tabular-nums;
        
        .unit {
          font-size: 24px;
          font-weight: 300;
          margin-left: 4px;
        }
      }
      
      .weather-desc {
        font-size: 18px;
        color: #64748b;
        margin-top: 8px;
      }
    }
  }
  
  .weather-details {
    display: flex;
    gap: 24px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid rgba(100, 116, 139, 0.1);
    
    .detail-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: #64748b;
      
      .el-icon {
        color: #667eea;
      }
      
      .icon-emoji {
        font-size: 16px;
      }
    }
  }
  
  &.dark-mode {
    background: linear-gradient(135deg, rgba(165, 180, 252, 0.1) 0%, rgba(196, 181, 253, 0.1) 100%);
    
    .weather-header {
      .location {
        color: #f1f5f9;
        
        .el-icon {
          color: #a5b4fc;
        }
      }
      
      .update-time {
        color: #64748b;
        
        .mock-indicator {
          color: #fbbf24;
          background: rgba(251, 191, 36, 0.15);
          
          .el-icon {
            color: #fbbf24;
          }
        }
      }
    }
    
    .weather-main {
      .weather-info {
        .temperature {
          color: #f1f5f9;
        }
        
        .weather-desc {
          color: #94a3b8;
        }
      }
    }
    
    .weather-details {
      border-top-color: rgba(148, 163, 184, 0.1);
      
      .detail-item {
      color: #94a3b8;
      
      .el-icon {
        color: #a5b4fc;
      }
      
      .icon-emoji {
        font-size: 16px;
      }
    }
    }
  }
}
</style>
