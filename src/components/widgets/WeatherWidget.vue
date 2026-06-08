<template>
  <div class="weather-widget" :style="containerStyle">
    <div v-if="config.weatherMode === 'current'" class="current-weather">
      <div class="location" :style="{ color: style.textColor, opacity: 0.8 }">
        {{ appStore.selectedCity.name }}
      </div>
      <div class="weather-main" v-if="appStore.currentWeather">
        <span class="weather-icon">{{ getWeatherIcon(appStore.currentWeather.weather) }}</span>
        <div class="temp-info">
          <div class="temperature" :style="{ color: style.accentColor }">
            {{ appStore.currentWeather.temperature }}<span class="unit">°</span>
          </div>
          <div class="weather-desc" :style="{ color: style.textColor, opacity: 0.7 }">
            {{ appStore.currentWeather.weather }}
          </div>
        </div>
      </div>
      <div class="weather-details" v-if="appStore.currentWeather">
        <span :style="{ color: style.textColor, opacity: 0.6 }">
          💧 {{ appStore.currentWeather.humidity }}%
        </span>
        <span :style="{ color: style.textColor, opacity: 0.6 }">
          🌬️ {{ appStore.currentWeather.windpower }}级
        </span>
      </div>
      <el-skeleton v-else :rows="3" animated />
    </div>
    
    <div v-else class="forecast-weather">
      <div class="forecast-title" :style="{ color: style.textColor }">
        {{ appStore.selectedCity.name }} · 预报
      </div>
      <div class="forecast-list" v-if="appStore.forecast.length > 0">
        <div 
          v-for="(day, index) in displayForecast" 
          :key="index" 
          class="forecast-item"
        >
          <div class="day-name" :style="{ color: style.textColor, opacity: 0.8 }">
            {{ day.week }}
          </div>
          <div class="day-icon">{{ getWeatherIcon(day.dayweather) }}</div>
          <div class="day-temp" :style="{ color: style.textColor }">
            {{ day.daytemp }}°/{{ day.nighttemp }}°
          </div>
        </div>
      </div>
      <el-skeleton v-else :rows="3" animated />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import type { WidgetStyle, WidgetConfig } from '@/types'

const props = defineProps<{
  style: WidgetStyle
  config: WidgetConfig
}>()

const appStore = useAppStore()

const displayForecast = computed(() => {
  const days = props.config.showForecastDays || 3
  return appStore.forecast.slice(0, days)
})

const containerStyle = computed(() => ({
  width: '100%',
  height: '100%',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column' as const
}))

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
.weather-widget {
  .current-weather {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 8px;
    
    .location {
      font-size: 14px;
      font-weight: 500;
    }
    
    .weather-main {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .weather-icon {
        font-size: 48px;
        line-height: 1;
      }
      
      .temp-info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        
        .temperature {
          font-size: 42px;
          font-weight: 200;
          line-height: 1;
          font-variant-numeric: tabular-nums;
          
          .unit {
            font-size: 20px;
            font-weight: 300;
          }
        }
        
        .weather-desc {
          font-size: 14px;
          margin-top: 4px;
        }
      }
    }
    
    .weather-details {
      display: flex;
      gap: 16px;
      font-size: 12px;
    }
  }
  
  .forecast-weather {
    display: flex;
    flex-direction: column;
    height: 100%;
    
    .forecast-title {
      font-size: 13px;
      font-weight: 500;
      text-align: center;
      margin-bottom: 12px;
    }
    
    .forecast-list {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      
      .forecast-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 8px;
        
        .day-name {
          font-size: 12px;
          font-weight: 500;
          min-width: 40px;
        }
        
        .day-icon {
          font-size: 20px;
        }
        
        .day-temp {
          font-size: 12px;
          font-variant-numeric: tabular-nums;
        }
      }
    }
  }
}
</style>
