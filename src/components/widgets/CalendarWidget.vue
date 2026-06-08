<template>
  <div class="calendar-widget" :style="containerStyle">
    <div class="calendar-header">
      <el-button 
        link 
        size="small" 
        @click="prevMonth"
        :style="{ color: style.textColor }"
      >
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <div class="month-title" :style="{ color: style.textColor }">
        {{ currentYear }}年{{ currentMonth }}月
      </div>
      <el-button 
        link 
        size="small" 
        @click="nextMonth"
        :style="{ color: style.textColor }"
      >
        <el-icon><ArrowRight /></el-icon>
      </el-button>
    </div>
    
    <div class="weekdays">
      <div 
        v-for="day in weekdays" 
        :key="day" 
        class="weekday"
        :style="{ color: style.textColor, opacity: isWeekend(day) ? 0.6 : 0.8 }"
      >
        {{ day }}
      </div>
    </div>
    
    <div class="days-grid">
      <div 
        v-for="(day, index) in calendarDays" 
        :key="index" 
        class="day-cell"
        :class="{ 
          'other-month': !day.isCurrentMonth,
          'today': day.isToday,
          'selected': day.isSelected
        }"
        :style="{ 
          color: getDayColor(day),
          backgroundColor: day.isToday ? style.accentColor : (day.isSelected ? style.accentColor + '30' : 'transparent')
        }"
        @click="selectDay(day)"
      >
        {{ day.day }}
      </div>
    </div>
    
    <div v-if="selectedDate" class="selected-info" :style="{ color: style.textColor, opacity: 0.7 }">
      已选择: {{ formatSelectedDate() }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import type { WidgetStyle, WidgetConfig } from '@/types'

const props = defineProps<{
  style: WidgetStyle
  config: WidgetConfig
}>()

const today = ref(dayjs())
const viewDate = ref(dayjs())
const selectedDate = ref<dayjs.Dayjs | null>(null)

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const currentYear = computed(() => viewDate.value.year())
const currentMonth = computed(() => viewDate.value.month() + 1)

const calendarDays = computed(() => {
  const year = viewDate.value.year()
  const month = viewDate.value.month()
  
  const firstDay = dayjs(new Date(year, month, 1))
  const lastDay = dayjs(new Date(year, month + 1, 0))
  const startDayOfWeek = firstDay.day()
  const daysInMonth = lastDay.date()
  
  const days: Array<{
    day: number
    isCurrentMonth: boolean
    isToday: boolean
    isSelected: boolean
    date: dayjs.Dayjs
  }> = []
  
  const prevMonthLastDay = dayjs(new Date(year, month, 0)).date()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = dayjs(new Date(year, month - 1, prevMonthLastDay - i))
    days.push({
      day: prevMonthLastDay - i,
      isCurrentMonth: false,
      isToday: date.isSame(today.value, 'day'),
      isSelected: selectedDate.value ? date.isSame(selectedDate.value, 'day') : false,
      date
    })
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    const date = dayjs(new Date(year, month, i))
    days.push({
      day: i,
      isCurrentMonth: true,
      isToday: date.isSame(today.value, 'day'),
      isSelected: selectedDate.value ? date.isSame(selectedDate.value, 'day') : false,
      date
    })
  }
  
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = dayjs(new Date(year, month + 1, i))
    days.push({
      day: i,
      isCurrentMonth: false,
      isToday: date.isSame(today.value, 'day'),
      isSelected: selectedDate.value ? date.isSame(selectedDate.value, 'day') : false,
      date
    })
  }
  
  return days
})

const containerStyle = computed(() => ({
  width: '100%',
  height: '100%',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '8px'
}))

const isWeekend = (day: string) => day === '日' || day === '六'

const getDayColor = (day: typeof calendarDays.value[0]) => {
  if (day.isToday) return '#ffffff'
  if (!day.isCurrentMonth) return props.style.textColor + '40'
  if (day.isSelected) return props.style.accentColor
  return props.style.textColor
}

const prevMonth = () => {
  viewDate.value = viewDate.value.subtract(1, 'month')
}

const nextMonth = () => {
  viewDate.value = viewDate.value.add(1, 'month')
}

const selectDay = (day: typeof calendarDays.value[0]) => {
  selectedDate.value = day.date
}

const formatSelectedDate = () => {
  if (!selectedDate.value) return ''
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${selectedDate.value.format('MM月DD日')} ${weekdays[selectedDate.value.day()]}`
}

onMounted(() => {
  selectedDate.value = today.value
})
</script>

<style scoped lang="scss">
.calendar-widget {
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .month-title {
      font-size: 14px;
      font-weight: 600;
    }
  }
  
  .weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
    
    .weekday {
      text-align: center;
      font-size: 11px;
      font-weight: 500;
      padding: 4px 0;
    }
  }
  
  .days-grid {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
    
    .day-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      aspect-ratio: 1;
      
      &:hover {
        background: rgba(0, 0, 0, 0.05);
      }
      
      &.other-month {
        cursor: default;
        
        &:hover {
          background: transparent;
        }
      }
      
      &.today {
        font-weight: 600;
      }
      
      &.selected:not(.today) {
        font-weight: 600;
      }
    }
  }
  
  .selected-info {
    font-size: 11px;
    text-align: center;
    padding-top: 4px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
}
</style>
