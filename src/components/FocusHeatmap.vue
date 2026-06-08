<template>
  <div class="focus-heatmap" :class="{ 'dark-mode': isDark }">
    <div class="heatmap-header">
      <div class="heatmap-title">
        <el-icon><Calendar /></el-icon>
        <span>专注热力图</span>
      </div>
      <div class="heatmap-legend">
        <span class="legend-label">少</span>
        <div class="legend-colors">
          <span 
            v-for="(color, index) in legendColors" 
            :key="index"
            class="legend-color"
            :style="{ backgroundColor: color }"
          ></span>
        </div>
        <span class="legend-label">多</span>
      </div>
    </div>

    <div class="heatmap-container">
      <div class="heatmap-months">
        <span 
          v-for="month in months" 
          :key="month.key"
          class="month-label"
          :style="{ left: month.offset + 'px' }"
        >
          {{ month.label }}
        </span>
      </div>
      
      <div class="heatmap-grid">
        <div class="heatmap-weekdays">
          <span class="weekday-label" v-for="day in weekdayLabels" :key="day">
            {{ day }}
          </span>
        </div>
        
        <div class="heatmap-cells">
          <div 
            v-for="week in weeks" 
            :key="week.weekNum"
            class="heatmap-week"
          >
            <div
              v-for="day in week.days"
              :key="day.date"
              class="heatmap-cell"
              :class="{ 
                'empty': !day.date,
                'today': day.isToday
              }"
              :style="{ backgroundColor: getCellColor(day.minutes) }"
              :title="getCellTooltip(day)"
            ></div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="heatmap-summary">
      <div class="summary-item">
        <span class="summary-label">本月专注</span>
        <span class="summary-value">{{ currentMonthMinutes }} 分钟</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">最长连续</span>
        <span class="summary-value">{{ maxStreak }} 天</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">日均专注</span>
        <span class="summary-value">{{ avgDailyMinutes }} 分钟</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useFocusStore } from '@/stores/focus'
import { useAppStore } from '@/stores/app'
import dayjs from 'dayjs'
import { Calendar } from '@element-plus/icons-vue'

const focusStore = useFocusStore()
const appStore = useAppStore()
const isDark = computed(() => appStore.isDark)

const heatmapData = ref<Record<string, number>>({})
const MONTHS = 3

const loadHeatmapData = () => {
  heatmapData.value = focusStore.getHeatmapData(MONTHS)
}

onMounted(() => {
  loadHeatmapData()
})

watch(() => focusStore.sessions, () => {
  loadHeatmapData()
}, { deep: true })

const startDate = computed(() => dayjs().subtract(MONTHS, 'month').startOf('day'))
const endDate = computed(() => dayjs().endOf('day'))

const weekdayLabels = ['日', '一', '二', '三', '四', '五', '六']

const legendColors = computed(() => {
  if (isDark.value) {
    return [
      'rgba(148, 163, 184, 0.15)',
      'rgba(165, 180, 252, 0.3)',
      'rgba(165, 180, 252, 0.5)',
      'rgba(165, 180, 252, 0.7)',
      'rgba(165, 180, 252, 0.95)'
    ]
  }
  return [
    'rgba(100, 116, 139, 0.15)',
    'rgba(102, 126, 234, 0.3)',
    'rgba(102, 126, 234, 0.5)',
    'rgba(102, 126, 234, 0.75)',
    'rgba(102, 126, 234, 1)'
  ]
})

const getCellColor = (minutes: number): string => {
  if (minutes <= 0) return isDark.value ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)'
  
  const colors = legendColors.value
  const thresholds = [0, 30, 60, 120, 240]
  
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (minutes >= thresholds[i]) {
      return colors[Math.min(i, colors.length - 1)]
    }
  }
  
  return colors[0]
}

interface HeatmapDay {
  date: string | null
  minutes: number
  isToday: boolean
}

interface HeatmapWeek {
  weekNum: number
  days: HeatmapDay[]
}

const weeks = computed<HeatmapWeek[]>(() => {
  const result: HeatmapWeek[] = []
  const start = startDate.value
  const end = endDate.value
  
  const firstDayOfWeek = start.day()
  const totalDays = end.diff(start, 'day') + 1
  const totalWeeks = Math.ceil((firstDayOfWeek + totalDays) / 7)
  
  let currentDate = start.clone()
  
  for (let week = 0; week < totalWeeks; week++) {
    const days: HeatmapDay[] = []
    
    for (let day = 0; day < 7; day++) {
      if (week === 0 && day < firstDayOfWeek) {
        days.push({ date: null, minutes: 0, isToday: false })
      } else if (currentDate.isAfter(end, 'day')) {
        days.push({ date: null, minutes: 0, isToday: false })
      } else {
        const dateStr = currentDate.format('YYYY-MM-DD')
        const seconds = heatmapData.value[dateStr] || 0
        days.push({
          date: dateStr,
          minutes: Math.floor(seconds / 60),
          isToday: currentDate.isSame(dayjs(), 'day')
        })
        currentDate = currentDate.add(1, 'day')
      }
    }
    
    result.push({ weekNum: week, days })
  }
  
  return result
})

const months = computed(() => {
  const result: { key: string; label: string; offset: number }[] = []
  const start = startDate.value
  const end = endDate.value
  
  let currentMonth = start.clone().startOf('month')
  const endMonth = end.clone().startOf('month')
  
  while (currentMonth.isBefore(endMonth) || currentMonth.isSame(endMonth, 'month')) {
    const monthStart = currentMonth.clone()
    const firstDayInRange = monthStart.isBefore(start) ? start : monthStart
    const weekIndex = Math.floor(firstDayInRange.diff(start, 'day') / 7)
    
    result.push({
      key: monthStart.format('YYYY-MM'),
      label: monthStart.format('M月'),
      offset: weekIndex * 14 + 30
    })
    
    currentMonth = currentMonth.add(1, 'month')
  }
  
  return result
})

const getCellTooltip = (day: HeatmapDay): string => {
  if (!day.date) return ''
  const dateStr = dayjs(day.date).format('YYYY年M月D日')
  if (day.minutes <= 0) {
    return `${dateStr}：无专注记录`
  }
  return `${dateStr}：专注 ${day.minutes} 分钟`
}

const currentMonthMinutes = computed(() => {
  const monthStart = dayjs().startOf('month')
  let total = 0
  
  for (const [date, seconds] of Object.entries(heatmapData.value)) {
    if (dayjs(date).isSame(monthStart, 'month')) {
      total += Math.floor(seconds / 60)
    }
  }
  
  return total
})

const maxStreak = computed(() => {
  const dates = Object.keys(heatmapData.value).sort()
  let maxStreak = 0
  let currentStreak = 0
  let lastDate: dayjs.Dayjs | null = null
  
  for (const dateStr of dates) {
    const minutes = Math.floor(heatmapData.value[dateStr] / 60)
    const currentDate = dayjs(dateStr)
    
    if (minutes > 0) {
      if (lastDate && currentDate.diff(lastDate, 'day') === 1) {
        currentStreak++
      } else {
        currentStreak = 1
      }
      maxStreak = Math.max(maxStreak, currentStreak)
      lastDate = currentDate
    } else if (lastDate) {
      lastDate = null
      currentStreak = 0
    }
  }
  
  return maxStreak
})

const avgDailyMinutes = computed(() => {
  const totalDays = endDate.value.diff(startDate.value, 'day') + 1
  let totalMinutes = 0
  
  for (const seconds of Object.values(heatmapData.value)) {
    totalMinutes += Math.floor(seconds / 60)
  }
  
  return totalDays > 0 ? Math.round(totalMinutes / totalDays) : 0
})
</script>

<style scoped lang="scss">
.focus-heatmap {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  padding: 20px;
  margin-top: 16px;
  overflow-x: auto;
  
  .heatmap-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 12px;
    
    .heatmap-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 500;
      color: #1e293b;
      
      .el-icon {
        color: #667eea;
        font-size: 18px;
      }
    }
    
    .heatmap-legend {
      display: flex;
      align-items: center;
      gap: 6px;
      
      .legend-label {
        font-size: 11px;
        color: #94a3b8;
      }
      
      .legend-colors {
        display: flex;
        gap: 3px;
        
        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 3px;
        }
      }
    }
  }
  
  .heatmap-container {
    min-width: 600px;
    
    .heatmap-months {
      position: relative;
      height: 20px;
      margin-left: 30px;
      margin-bottom: 4px;
      
      .month-label {
        position: absolute;
        font-size: 11px;
        color: #94a3b8;
        white-space: nowrap;
      }
    }
    
    .heatmap-grid {
      display: flex;
      
      .heatmap-weekdays {
        display: flex;
        flex-direction: column;
        gap: 3px;
        padding-right: 8px;
        
        .weekday-label {
          height: 12px;
          line-height: 12px;
          font-size: 10px;
          color: #94a3b8;
          text-align: right;
        }
      }
      
      .heatmap-cells {
        display: flex;
        gap: 3px;
        
        .heatmap-week {
          display: flex;
          flex-direction: column;
          gap: 3px;
          
          .heatmap-cell {
            width: 12px;
            height: 12px;
            border-radius: 3px;
            transition: all 0.2s ease;
            cursor: pointer;
            
            &:hover {
              transform: scale(1.3);
            }
            
            &.empty {
              background: transparent !important;
              cursor: default;
              
              &:hover {
                transform: none;
              }
            }
            
            &.today {
              outline: 2px solid #f97316;
              outline-offset: 1px;
            }
          }
        }
      }
    }
  }
  
  .heatmap-summary {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid rgba(100, 116, 139, 0.1);
    
    .summary-item {
      text-align: center;
      
      .summary-label {
        display: block;
        font-size: 12px;
        color: #94a3b8;
        margin-bottom: 4px;
      }
      
      .summary-value {
        display: block;
        font-size: 20px;
        font-weight: 700;
        color: #667eea;
      }
    }
  }
  
  &.dark-mode {
    background: rgba(30, 41, 59, 0.5);
    
    .heatmap-header {
      .heatmap-title {
        color: #f1f5f9;
        
        .el-icon {
          color: #a5b4fc;
        }
      }
    }
    
    .heatmap-summary {
      border-top-color: rgba(148, 163, 184, 0.1);
      
      .summary-item {
        .summary-value {
          color: #a5b4fc;
        }
      }
    }
  }
}
</style>
