<template>
  <div class="alarm-widget" :style="containerStyle">
    <div class="alarm-icon" :style="{ color: style.accentColor }">🔔</div>
    
    <template v-if="nextAlarm">
      <div class="alarm-name" :style="{ color: style.textColor }">
        {{ nextAlarm.name || '闹钟' }}
      </div>
      <div class="alarm-time" :style="{ color: style.accentColor }">
        {{ nextAlarm.time }}
      </div>
      <div class="countdown-label" :style="{ color: style.textColor, opacity: 0.7 }">
        距离响铃还有
      </div>
      <div class="countdown-time" :style="{ color: style.textColor }">
        <span class="countdown-value">{{ countdown.hours }}</span>
        <span class="countdown-unit">时</span>
        <span class="countdown-value">{{ countdown.minutes }}</span>
        <span class="countdown-unit">分</span>
        <span class="countdown-value">{{ countdown.seconds }}</span>
        <span class="countdown-unit">秒</span>
      </div>
      <div class="repeat-info" :style="{ color: style.textColor, opacity: 0.6 }">
        {{ getRepeatText(nextAlarm.repeat) }}
      </div>
    </template>
    
    <template v-else>
      <div class="no-alarm" :style="{ color: style.textColor, opacity: 0.6 }">
        暂无开启的闹钟
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAlarmStore } from '@/stores/alarm'
import type { WidgetStyle, WidgetConfig, Alarm } from '@/types'

defineProps<{
  style: WidgetStyle
  config: WidgetConfig
}>()

const alarmStore = useAlarmStore()

const now = ref(new Date())
let timer: number | null = null

const enabledAlarms = computed(() => 
  alarmStore.alarms.filter(a => a.enabled)
)

const nextAlarm = computed<Alarm | null>(() => {
  if (enabledAlarms.value.length === 0) return null
  
  const current = now.value
  let minDiff = Infinity
  let next: Alarm | null = null
  
  for (const alarm of enabledAlarms.value) {
    const diff = getTimeUntilAlarm(alarm, current)
    if (diff >= 0 && diff < minDiff) {
      minDiff = diff
      next = alarm
    }
  }
  
  return next
})

const countdown = computed(() => {
  if (!nextAlarm.value) {
    return { hours: '00', minutes: '00', seconds: '00' }
  }
  
  const diff = getTimeUntilAlarm(nextAlarm.value, now.value)
  if (diff < 0) {
    return { hours: '00', minutes: '00', seconds: '00' }
  }
  
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  
  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0')
  }
})

const containerStyle = computed(() => ({
  width: '100%',
  height: '100%',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px'
}))

const getTimeUntilAlarm = (alarm: Alarm, current: Date): number => {
  const [hours, minutes] = alarm.time.split(':').map(Number)
  const alarmDate = new Date(current)
  alarmDate.setHours(hours, minutes, 0, 0)
  
  let diff = alarmDate.getTime() - current.getTime()
  
  if (diff <= 0) {
    alarmDate.setDate(alarmDate.getDate() + 1)
    diff = alarmDate.getTime() - current.getTime()
  }
  
  const day = current.getDay()
  switch (alarm.repeat) {
    case 'weekday':
      if (day >= 1 && day <= 5 && diff > 0) {
        return diff
      }
      let daysToAdd = 1
      while (true) {
        const nextDay = (day + daysToAdd) % 7
        if (nextDay >= 1 && nextDay <= 5) {
          return diff + daysToAdd * 86400000
        }
        daysToAdd++
      }
    case 'weekend':
      if ((day === 0 || day === 6) && diff > 0) {
        return diff
      }
      let weekendDaysToAdd = 1
      while (true) {
        const nextDay = (day + weekendDaysToAdd) % 7
        if (nextDay === 0 || nextDay === 6) {
          return diff + weekendDaysToAdd * 86400000
        }
        weekendDaysToAdd++
      }
    case 'once':
      return diff > 0 ? diff : -1
    default:
      return diff
  }
}

const getRepeatText = (repeat: string): string => {
  const texts: Record<string, string> = {
    'once': '仅一次',
    'daily': '每天',
    'weekday': '工作日',
    'weekend': '周末'
  }
  return texts[repeat] || repeat
}

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped lang="scss">
.alarm-widget {
  .alarm-icon {
    font-size: 28px;
    margin-bottom: 4px;
  }
  
  .alarm-name {
    font-size: 14px;
    font-weight: 500;
  }
  
  .alarm-time {
    font-size: 24px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  
  .countdown-label {
    font-size: 12px;
    margin-top: 4px;
  }
  
  .countdown-time {
    display: flex;
    align-items: baseline;
    gap: 2px;
    font-variant-numeric: tabular-nums;
    
    .countdown-value {
      font-size: 18px;
      font-weight: 600;
    }
    
    .countdown-unit {
      font-size: 12px;
      opacity: 0.7;
      margin-right: 4px;
    }
  }
  
  .repeat-info {
    font-size: 11px;
    margin-top: 4px;
  }
  
  .no-alarm {
    font-size: 14px;
    text-align: center;
  }
}
</style>
