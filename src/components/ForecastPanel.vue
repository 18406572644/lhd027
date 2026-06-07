<template>
  <div class="forecast-panel" :class="{ 'dark-mode': isDark }">
    <div class="panel-title">
      <el-icon><Calendar /></el-icon>
      <span>未来天气</span>
    </div>
    <div class="forecast-list">
      <div 
        class="forecast-item" 
        v-for="(day, index) in appStore.forecast" 
        :key="index"
      >
        <div class="day-name">{{ day.week }}</div>
        <div class="day-icon">{{ getWeatherIcon(day.dayweather) }}</div>
        <div class="day-weather">{{ day.dayweather }}</div>
        <div class="day-temp">
          <span class="high">{{ day.daytemp }}°</span>
          <span class="divider">/</span>
          <span class="low">{{ day.nighttemp }}°</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'


const appStore = useAppStore()
const isDark = computed(() => appStore.isDark)

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
.forecast-panel {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  padding: 20px;
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
  
  .forecast-list {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }
  
  .forecast-item {
    flex: 1;
    text-align: center;
    padding: 12px 8px;
    border-radius: 12px;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(102, 126, 234, 0.08);
      transform: translateY(-2px);
    }
    
    .day-name {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 8px;
      font-weight: 500;
    }
    
    .day-icon {
      font-size: 28px;
      margin-bottom: 8px;
    }
    
    .day-weather {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 8px;
    }
    
    .day-temp {
      font-size: 13px;
      font-variant-numeric: tabular-nums;
      
      .high {
        color: #ef4444;
        font-weight: 500;
      }
      
      .divider {
        color: #cbd5e1;
        margin: 0 2px;
      }
      
      .low {
        color: #3b82f6;
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
    
    .forecast-item {
      &:hover {
        background: rgba(165, 180, 252, 0.1);
      }
      
      .day-name {
        color: #94a3b8;
      }
      
      .day-weather {
        color: #94a3b8;
      }
    }
  }
}
</style>
