<template>
  <div class="clock-widget" :style="containerStyle">
    <div v-if="config.clockMode === 'digital'" class="digital-clock">
      <div class="time-display" :style="{ color: style.textColor }">
        <span class="hours">{{ hours }}</span>
        <span class="separator">:</span>
        <span class="minutes">{{ minutes }}</span>
        <span v-if="config.showSeconds" class="seconds">{{ seconds }}</span>
      </div>
      <div v-if="config.showDate" class="date-display" :style="{ color: style.textColor, opacity: 0.7 }">
        {{ dateText }}
      </div>
    </div>
    
    <div v-else class="analog-clock" :style="{ borderColor: style.accentColor }">
      <div class="clock-face">
        <div v-for="i in 12" :key="i" class="hour-marker" :style="getHourMarkerStyle(i)"></div>
        <div class="hour-hand" :style="getHourHandStyle()"></div>
        <div class="minute-hand" :style="getMinuteHandStyle()"></div>
        <div v-if="config.showSeconds" class="second-hand" :style="getSecondHandStyle()"></div>
        <div class="center-dot" :style="{ backgroundColor: style.accentColor }"></div>
      </div>
      <div v-if="config.showDate" class="analog-date" :style="{ color: style.textColor }">
        {{ dateText }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'
import type { WidgetStyle, WidgetConfig } from '@/types'

const props = defineProps<{
  style: WidgetStyle
  config: WidgetConfig
}>()

const now = ref(dayjs())
let timer: number | null = null

const hours = computed(() => now.value.format('HH'))
const minutes = computed(() => now.value.format('mm'))
const seconds = computed(() => now.value.format('ss'))

const dateText = computed(() => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${now.value.format('MM月DD日')} ${weekdays[now.value.day()]}`
})

const containerStyle = computed(() => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
}))

const getHourMarkerStyle = (i: number) => {
  const angle = (i * 30 - 90) * (Math.PI / 180)
  const radius = 42
  const x = 50 + radius * Math.cos(angle)
  const y = 50 + radius * Math.sin(angle)
  return {
    left: `${x}%`,
    top: `${y}%`,
    backgroundColor: props.style.textColor,
    opacity: 0.6
  }
}

const getHourHandStyle = () => {
  const hours = now.value.hour() % 12
  const minutes = now.value.minute()
  const angle = (hours * 30 + minutes * 0.5 - 90)
  return {
    transform: `rotate(${angle}deg)`,
    backgroundColor: props.style.accentColor
  }
}

const getMinuteHandStyle = () => {
  const minutes = now.value.minute()
  const seconds = now.value.second()
  const angle = (minutes * 6 + seconds * 0.1 - 90)
  return {
    transform: `rotate(${angle}deg)`,
    backgroundColor: props.style.textColor
  }
}

const getSecondHandStyle = () => {
  const angle = (now.value.second() * 6 - 90)
  return {
    transform: `rotate(${angle}deg)`,
    backgroundColor: '#ef4444'
  }
}

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = dayjs()
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped lang="scss">
.clock-widget {
  .digital-clock {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    
    .time-display {
      display: flex;
      align-items: baseline;
      font-weight: 200;
      font-variant-numeric: tabular-nums;
      
      .hours, .minutes {
        font-size: 48px;
        line-height: 1;
      }
      
      .separator {
        font-size: 42px;
        margin: 0 2px;
        animation: blink 1s infinite;
      }
      
      .seconds {
        font-size: 24px;
        margin-left: 4px;
        opacity: 0.7;
      }
    }
    
    .date-display {
      font-size: 14px;
      font-weight: 300;
    }
  }
  
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0.3; }
  }
  
  .analog-clock {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    
    .clock-face {
      position: relative;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      border: 2px solid;
      
      .hour-marker {
        position: absolute;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        transform: translate(-50%, -50%);
      }
      
      .hour-hand {
        position: absolute;
        width: 6px;
        height: 32px;
        left: 50%;
        top: 50%;
        transform-origin: bottom center;
        border-radius: 3px;
        margin-left: -3px;
        margin-top: -32px;
      }
      
      .minute-hand {
        position: absolute;
        width: 4px;
        height: 44px;
        left: 50%;
        top: 50%;
        transform-origin: bottom center;
        border-radius: 2px;
        margin-left: -2px;
        margin-top: -44px;
      }
      
      .second-hand {
        position: absolute;
        width: 2px;
        height: 50px;
        left: 50%;
        top: 50%;
        transform-origin: bottom center;
        border-radius: 1px;
        margin-left: -1px;
        margin-top: -50px;
      }
      
      .center-dot {
        position: absolute;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }
    }
    
    .analog-date {
      font-size: 12px;
      font-weight: 300;
    }
  }
}
</style>
