<template>
  <div class="focus-stats" :class="{ 'dark-mode': isDark }">
    <div class="stats-header">
      <div class="stats-title">
        <el-icon><DataLine /></el-icon>
        <span>专注统计</span>
      </div>
      <el-button 
        link 
        size="small" 
        type="danger"
        @click="handleClearHistory"
        v-if="focusStore.sessions.length > 0"
      >
        <el-icon><Delete /></el-icon>
        清除历史
      </el-button>
    </div>

    <div class="stats-grid">
      <div class="stat-card today-card">
        <div class="stat-icon">
          <el-icon><Sunny /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">今日专注</div>
          <div class="stat-value">{{ focusStore.todayFocusCount }}</div>
          <div class="stat-unit">次</div>
        </div>
      </div>

      <div class="stat-card duration-card">
        <div class="stat-icon">
          <el-icon><Timer /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">今日时长</div>
          <div class="stat-value">{{ formatDuration(focusStore.todayFocusDuration) }}</div>
          <div class="stat-unit">分钟</div>
        </div>
      </div>

      <div class="stat-card total-card">
        <div class="stat-icon">
          <el-icon><Trophy /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">累计专注</div>
          <div class="stat-value">{{ focusStore.totalFocusCount }}</div>
          <div class="stat-unit">次</div>
        </div>
      </div>

      <div class="stat-card total-duration-card">
        <div class="stat-icon">
          <el-icon><Histogram /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">累计时长</div>
          <div class="stat-value">{{ formatTotalDuration(focusStore.totalFocusDuration) }}</div>
        </div>
      </div>
    </div>

    <div class="recent-sessions" v-if="focusStore.sessions.length > 0">
      <div class="sessions-title">
        <el-icon><List /></el-icon>
        最近记录
      </div>
      <div class="sessions-list">
        <div 
          v-for="session in recentSessions" 
          :key="session.id"
          class="session-item"
          :class="{ 'completed': session.completed }"
        >
          <div class="session-icon">
            <span v-if="session.phase === 'focus'">🎯</span>
            <span v-else>☕</span>
          </div>
          <div class="session-info">
            <div class="session-mode">
              {{ getModeLabel(session.mode) }}
              <span v-if="session.mode === 'pomodoro'" class="session-phase">
                · {{ session.phase === 'focus' ? '专注' : '休息' }}
              </span>
              <span v-if="!session.completed" class="incomplete-tag">未完成</span>
            </div>
            <div class="session-time">
              {{ formatSessionTime(session.startTime) }}
            </div>
          </div>
          <div class="session-duration">
            {{ formatDuration(session.duration) }} 分钟
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFocusStore } from '@/stores/focus'
import { useAppStore } from '@/stores/app'
import { FOCUS_MODE_LABELS } from '@/constants'
import type { FocusMode } from '@/types'
import dayjs from 'dayjs'
import { ElMessageBox } from 'element-plus'
import { 
  DataLine, Delete, Sunny, Timer, Trophy, 
  Histogram, List 
} from '@element-plus/icons-vue'

const focusStore = useFocusStore()
const appStore = useAppStore()
const isDark = computed(() => appStore.isDark)

const recentSessions = computed(() => {
  return [...focusStore.sessions]
    .sort((a, b) => b.startTime - a.startTime)
    .slice(0, 5)
})

const formatDuration = (seconds: number): string => {
  return (Math.floor(seconds / 60)).toString()
}

const formatTotalDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  return `${minutes}分钟`
}

const formatSessionTime = (timestamp: number): string => {
  return dayjs(timestamp).format('MM/DD HH:mm')
}

const getModeLabel = (mode: FocusMode): string => {
  return FOCUS_MODE_LABELS[mode] || mode
}

const handleClearHistory = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清除所有专注历史记录吗？此操作不可恢复。',
      '确认清除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    focusStore.clearHistory()
  } catch {
  }
}
</script>

<style scoped lang="scss">
.focus-stats {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  padding: 20px;
  margin-top: 16px;
  width: 100%;
  box-sizing: border-box;
  
  .stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .stats-title {
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
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 20px;
    
    .stat-card {
      background: rgba(255, 255, 255, 0.8);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      }
      
      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .el-icon {
          font-size: 24px;
          color: white;
        }
      }
      
      &.today-card .stat-icon {
        background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
      }
      
      &.duration-card .stat-icon {
        background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
      }
      
      &.total-card .stat-icon {
        background: linear-gradient(135deg, #eab308 0%, #facc15 100%);
      }
      
      &.total-duration-card .stat-icon {
        background: linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%);
      }
      
      .stat-info {
        display: flex;
        flex-direction: column;
        
        .stat-label {
          font-size: 12px;
          color: #94a3b8;
          margin-bottom: 2px;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.1;
        }
        
        .stat-unit {
          font-size: 11px;
          color: #94a3b8;
        }
      }
    }
  }
  
  .recent-sessions {
    .sessions-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 500;
      color: #64748b;
      margin-bottom: 12px;
      
      .el-icon {
        color: #667eea;
      }
    }
    
    .sessions-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      .session-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 10px;
        transition: all 0.3s ease;
        opacity: 0.7;
        
        &.completed {
          opacity: 1;
        }
        
        &:hover {
          background: rgba(255, 255, 255, 0.9);
        }
        
        .session-icon {
          font-size: 24px;
        }
        
        .session-info {
          flex: 1;
          
          .session-mode {
            font-size: 13px;
            font-weight: 500;
            color: #1e293b;
            display: flex;
            align-items: center;
            gap: 4px;
            
            .session-phase {
              font-size: 12px;
              color: #94a3b8;
              font-weight: normal;
            }
            
            .incomplete-tag {
              font-size: 11px;
              color: #f97316;
              background: rgba(249, 115, 22, 0.1);
              padding: 2px 6px;
              border-radius: 4px;
              font-weight: normal;
            }
          }
          
          .session-time {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 2px;
          }
        }
        
        .session-duration {
          font-size: 13px;
          font-weight: 600;
          color: #667eea;
        }
      }
    }
  }
  
  &.dark-mode {
    background: rgba(30, 41, 59, 0.5);
    
    .stats-header {
      .stats-title {
        color: #f1f5f9;
        
        .el-icon {
          color: #a5b4fc;
        }
      }
    }
    
    .stats-grid {
      .stat-card {
        background: rgba(30, 41, 59, 0.8);
        
        .stat-info {
          .stat-value {
            color: #f1f5f9;
          }
        }
      }
    }
    
    .recent-sessions {
      .sessions-title {
        color: #94a3b8;
        
        .el-icon {
          color: #a5b4fc;
        }
      }
      
      .sessions-list {
        .session-item {
          background: rgba(30, 41, 59, 0.6);
          
          &:hover {
            background: rgba(30, 41, 59, 0.9);
          }
          
          .session-info {
            .session-mode {
              color: #f1f5f9;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .focus-stats {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}
</style>
