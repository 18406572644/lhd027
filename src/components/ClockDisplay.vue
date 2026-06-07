<template>
  <div class="clock-display" :class="{ 'dark-mode': isDark }">
    <div class="time-text">{{ currentTime }}</div>
    <div class="date-text">{{ currentDate }}</div>
    <div class="seconds-badge">{{ currentSeconds }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import dayjs from 'dayjs'

const appStore = useAppStore()
const isDark = computed(() => appStore.isDark)

const now = ref(dayjs())
let timer: number | null = null

const currentTime = computed(() => now.value.format('HH:mm'))
const currentSeconds = computed(() => now.value.format('ss'))
const currentDate = computed(() => {
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return `${now.value.format('YYYY年MM月DD日')} ${weekdays[now.value.day()]}`
})

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
.clock-display {
  position: relative;
  text-align: center;
  padding: 20px 0;
  
  .time-text {
    font-size: 72px;
    font-weight: 200;
    letter-spacing: 4px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }
  
  .date-text {
    font-size: 16px;
    color: #64748b;
    margin-top: 8px;
    font-weight: 300;
  }
  
  .seconds-badge {
    position: absolute;
    right: 40px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 20px;
    font-weight: 500;
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    padding: 4px 10px;
    border-radius: 8px;
    font-variant-numeric: tabular-nums;
  }
  
  &.dark-mode {
    .time-text {
      background: linear-gradient(135deg, #a5b4fc 0%, #c4b5fd 100%);
      -webkit-background-clip: text;
      background-clip: text;
    }
    
    .date-text {
      color: #94a3b8;
    }
    
    .seconds-badge {
      color: #a5b4fc;
      background: rgba(165, 180, 252, 0.15);
    }
  }
}
</style>
