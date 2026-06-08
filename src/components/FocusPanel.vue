<template>
  <div class="focus-panel" :class="{ 'dark-mode': isDark }">
    <div class="panel-header">
      <div class="panel-title">
        <el-icon><Timer /></el-icon>
        <span>专注</span>
      </div>
    </div>

    <div class="mode-selector">
      <el-radio-group 
        v-model="localMode" 
        size="large" 
        @change="handleModeChange"
        :disabled="focusStore.isRunning"
      >
        <el-radio-button value="pomodoro">
          <el-icon><Odometer /></el-icon>
          番茄钟
        </el-radio-button>
        <el-radio-button value="countdown">
          <el-icon><Clock /></el-icon>
          倒计时
        </el-radio-button>
        <el-radio-button value="countup">
          <el-icon><Watch /></el-icon>
          正计时
        </el-radio-button>
      </el-radio-group>
    </div>

    <div class="timer-display">
      <div class="phase-indicator" v-if="focusStore.mode === 'pomodoro'">
        <span 
          class="phase-badge" 
          :class="{ active: focusStore.phase === 'focus' }"
        >
          <el-icon><Cpu /></el-icon>
          专注
        </span>
        <span class="phase-divider">/</span>
        <span 
          class="phase-badge" 
          :class="{ active: focusStore.phase === 'break' }"
        >
          <el-icon><CoffeeCup /></el-icon>
          休息
        </span>
      </div>
      
      <div 
        class="time-display"
        :class="{ 
          'running': focusStore.isRunning && !focusStore.isPaused,
          'paused': focusStore.isPaused,
          'focus-phase': focusStore.phase === 'focus',
          'break-phase': focusStore.phase === 'break'
        }"
      >
        {{ currentDisplayTime }}
      </div>
      
      <div class="progress-container" v-if="showProgress">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: progressPercent + '%' }"
            :class="{
              'focus-progress': focusStore.phase === 'focus',
              'break-progress': focusStore.phase === 'break'
            }"
          ></div>
        </div>
        <div class="progress-text">
          {{ progressPercent.toFixed(0) }}%
        </div>
      </div>
    </div>

    <div class="duration-settings" v-if="!focusStore.isRunning">
      <div class="setting-row" v-if="focusStore.mode === 'pomodoro'">
        <div class="setting-item">
          <label>专注时长</label>
          <el-input-number 
            v-model="pomodoroMinutes" 
            :min="1" 
            :max="1440" 
            size="small"
            @change="handlePomodoroDurationChange"
          />
          <span class="unit">分钟</span>
        </div>
        <div class="setting-item">
          <label>休息时长</label>
          <el-input-number 
            v-model="breakMinutes" 
            :min="1" 
            :max="1440" 
            size="small"
            @change="handleBreakDurationChange"
          />
          <span class="unit">分钟</span>
        </div>
      </div>
      
      <div class="setting-row" v-if="focusStore.mode === 'countdown'">
        <div class="setting-item">
          <label>倒计时时长</label>
          <div class="time-inputs">
            <el-input-number 
              v-model="countdownHours" 
              :min="0" 
              :max="23" 
              size="small"
              @change="handleCountdownDurationChange"
            />
            <span class="time-sep">:</span>
            <el-input-number 
              v-model="countdownMinutes" 
              :min="0" 
              :max="59" 
              size="small"
              @change="handleCountdownDurationChange"
            />
            <span class="time-sep">:</span>
            <el-input-number 
              v-model="countdownSeconds" 
              :min="0" 
              :max="59" 
              size="small"
              @change="handleCountdownDurationChange"
            />
          </div>
        </div>
      </div>

      <div class="setting-row" v-if="focusStore.mode === 'pomodoro'">
        <div class="setting-item checkbox-item">
          <el-checkbox 
            v-model="autoStartBreak" 
            size="small"
            @change="handleSettingsChange"
          >
            自动开始休息
          </el-checkbox>
        </div>
        <div class="setting-item checkbox-item">
          <el-checkbox 
            v-model="autoStartNextRound" 
            size="small"
            @change="handleSettingsChange"
          >
            自动开始下一轮
          </el-checkbox>
        </div>
      </div>
    </div>

    <div class="control-buttons">
      <el-button 
        v-if="!focusStore.isRunning" 
        type="primary" 
        size="large" 
        @click="handleStart"
        class="control-btn start-btn"
      >
        <el-icon><VideoPlay /></el-icon>
        开始
      </el-button>
      
      <template v-else>
        <el-button 
          v-if="!focusStore.isPaused" 
          type="warning" 
          size="large" 
          @click="handlePause"
          class="control-btn pause-btn"
        >
          <el-icon><VideoPause /></el-icon>
          暂停
        </el-button>
        <el-button 
          v-else 
          type="success" 
          size="large" 
          @click="handleResume"
          class="control-btn resume-btn"
        >
          <el-icon><VideoPlay /></el-icon>
          继续
        </el-button>
        <el-button 
          type="danger" 
          size="large" 
          @click="handleStop"
          class="control-btn stop-btn"
        >
          <el-icon><SwitchButton /></el-icon>
          结束
        </el-button>
      </template>
    </div>

    <FocusStats />
    <FocusHeatmap />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFocusStore } from '@/stores/focus'
import { useAppStore } from '@/stores/app'
import type { FocusMode } from '@/types'
import { FOCUS_PHASE_LABELS } from '@/constants'
import { ElMessage } from 'element-plus'
import { 
  Timer, Odometer, Clock, Watch, 
  VideoPlay, VideoPause, SwitchButton,
  CoffeeCup, Cpu
} from '@element-plus/icons-vue'

import FocusStats from './FocusStats.vue'
import FocusHeatmap from './FocusHeatmap.vue'

const focusStore = useFocusStore()
const appStore = useAppStore()
const isDark = computed(() => appStore.isDark)

const localMode = ref<FocusMode>(focusStore.mode)

const pomodoroMinutes = ref(Math.floor(focusStore.settings.pomodoroDuration / 60))
const breakMinutes = ref(Math.floor(focusStore.settings.breakDuration / 60))

const countdownHours = ref(Math.floor(focusStore.settings.countdownDuration / 3600))
const countdownMinutes = ref(Math.floor((focusStore.settings.countdownDuration % 3600) / 60))
const countdownSeconds = ref(focusStore.settings.countdownDuration % 60)

const autoStartBreak = ref(focusStore.settings.autoStartBreak)
const autoStartNextRound = ref(focusStore.settings.autoStartNextRound)

watch(() => focusStore.mode, (val) => {
  localMode.value = val
})

watch(() => focusStore.settings, (val) => {
  pomodoroMinutes.value = Math.floor(val.pomodoroDuration / 60)
  breakMinutes.value = Math.floor(val.breakDuration / 60)
  countdownHours.value = Math.floor(val.countdownDuration / 3600)
  countdownMinutes.value = Math.floor((val.countdownDuration % 3600) / 60)
  countdownSeconds.value = val.countdownDuration % 60
  autoStartBreak.value = val.autoStartBreak
  autoStartNextRound.value = val.autoStartNextRound
}, { deep: true })

const currentDisplayTime = computed(() => {
  if (focusStore.mode === 'countup') {
    return focusStore.formatTime(focusStore.elapsedTime)
  }
  return focusStore.formatTime(focusStore.remainingTime)
})

const showProgress = computed(() => {
  return focusStore.mode !== 'countup'
})

const totalDuration = computed(() => {
  if (focusStore.mode === 'pomodoro') {
    return focusStore.phase === 'focus' 
      ? focusStore.settings.pomodoroDuration 
      : focusStore.settings.breakDuration
  }
  return focusStore.settings.countdownDuration
})

const elapsedDuration = computed(() => {
  return totalDuration.value - focusStore.remainingTime
})

const progressPercent = computed(() => {
  if (totalDuration.value === 0) return 0
  return (elapsedDuration.value / totalDuration.value) * 100
})

const handleModeChange = (val: FocusMode) => {
  focusStore.setMode(val)
}

const handlePomodoroDurationChange = () => {
  focusStore.setPomodoroDuration(pomodoroMinutes.value * 60)
}

const handleBreakDurationChange = () => {
  focusStore.setBreakDuration(breakMinutes.value * 60)
}

const handleCountdownDurationChange = () => {
  const total = countdownHours.value * 3600 + countdownMinutes.value * 60 + countdownSeconds.value
  if (total < 60) {
    ElMessage.warning('倒计时时长至少为1分钟')
    return
  }
  focusStore.setCountdownDuration(total)
}

const handleSettingsChange = () => {
  focusStore.setSettings({
    autoStartBreak: autoStartBreak.value,
    autoStartNextRound: autoStartNextRound.value
  })
}

const handleStart = () => {
  focusStore.start()
  const phaseText = focusStore.mode === 'pomodoro' 
    ? FOCUS_PHASE_LABELS[focusStore.phase]
    : ''
  ElMessage.success(`开始${phaseText}，加油！`)
}

const handlePause = () => {
  focusStore.pause()
  ElMessage.info('已暂停')
}

const handleResume = () => {
  focusStore.resume()
  ElMessage.success('继续加油！')
}

const handleStop = () => {
  focusStore.stop()
  ElMessage.info('已结束')
}
</script>

<style scoped lang="scss">
.focus-panel {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  padding: 20px;
  margin-top: 20px;
  backdrop-filter: blur(10px);
  width: 100%;
  box-sizing: border-box;
  
  .panel-header {
    margin-bottom: 20px;
    
    .panel-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 500;
      color: #1e293b;
      
      .el-icon {
        color: #667eea;
        font-size: 20px;
      }
    }
  }
  
  .mode-selector {
    display: flex;
    justify-content: center;
    margin-bottom: 32px;
    
    :deep(.el-radio-button__inner) {
      padding: 10px 20px;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }
  
  .timer-display {
    text-align: center;
    margin-bottom: 24px;
    
    .phase-indicator {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      
      .phase-badge {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 500;
        color: #94a3b8;
        background: rgba(148, 163, 184, 0.1);
        transition: all 0.3s ease;
        
        &.active {
          &.focus-phase {
            color: #ef4444;
            background: rgba(239, 68, 68, 0.15);
          }
          
          &.break-phase {
            color: #22c55e;
            background: rgba(34, 197, 94, 0.15);
          }
        }
      }
      
      .phase-divider {
        color: #cbd5e1;
        font-size: 18px;
      }
    }
    
    .time-display {
      font-size: 96px;
      font-weight: 200;
      font-variant-numeric: tabular-nums;
      letter-spacing: -2px;
      color: #1e293b;
      line-height: 1.1;
      transition: all 0.3s ease;
      
      &.running {
        animation: pulse 2s ease-in-out infinite;
      }
      
      &.paused {
        opacity: 0.6;
      }
      
      &.focus-phase {
        background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      &.break-phase {
        background: linear-gradient(135deg, #22c55e 0%, #10b981 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }
    
    .progress-container {
      max-width: 400px;
      margin: 20px auto 0;
      
      .progress-bar {
        height: 8px;
        background: rgba(100, 116, 139, 0.2);
        border-radius: 4px;
        overflow: hidden;
        
        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 1s linear;
          
          &.focus-progress {
            background: linear-gradient(90deg, #ef4444, #f97316);
          }
          
          &.break-progress {
            background: linear-gradient(90deg, #22c55e, #10b981);
          }
        }
      }
      
      .progress-text {
        margin-top: 8px;
        font-size: 12px;
        color: #94a3b8;
        font-weight: 500;
      }
    }
  }
  
  .duration-settings {
    margin-bottom: 24px;
    
    .setting-row {
      display: flex;
      justify-content: center;
      gap: 32px;
      flex-wrap: wrap;
      
      &:not(:last-child) {
        margin-bottom: 16px;
      }
    }
    
    .setting-item {
      display: flex;
      align-items: center;
      gap: 12px;
      
      label {
        font-size: 13px;
        color: #64748b;
        font-weight: 500;
        white-space: nowrap;
      }
      
      .unit {
        font-size: 13px;
        color: #94a3b8;
      }
      
      &.checkbox-item {
        :deep(.el-checkbox__label) {
          font-size: 13px;
          color: #64748b;
        }
      }
      
      .time-inputs {
        display: flex;
        align-items: center;
        gap: 4px;
        
        .time-sep {
          font-size: 18px;
          font-weight: 600;
          color: #64748b;
        }
      }
    }
  }
  
  .control-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-bottom: 24px;
    
    .control-btn {
      min-width: 120px;
      border-radius: 24px;
      padding: 12px 28px;
      font-size: 15px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      
      .el-icon {
        font-size: 18px;
      }
    }
  }
  
  &.dark-mode {
    background: rgba(30, 41, 59, 0.7);
    
    .panel-header {
      .panel-title {
        color: #f1f5f9;
        
        .el-icon {
          color: #a5b4fc;
        }
      }
    }
    
    .timer-display {
      .time-display {
        color: #f1f5f9;
      }
      
      .progress-container {
        .progress-bar {
          background: rgba(148, 163, 184, 0.2);
        }
        
        .progress-text {
          color: #64748b;
        }
      }
    }
    
    .duration-settings {
      .setting-item {
        label {
          color: #94a3b8;
        }
        
        .unit {
          color: #64748b;
        }
        
        &.checkbox-item {
          :deep(.el-checkbox__label) {
            color: #94a3b8;
          }
        }
        
        .time-inputs {
          .time-sep {
            color: #94a3b8;
          }
        }
      }
    }
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}
</style>
