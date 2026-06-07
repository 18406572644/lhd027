<template>
  <div class="alarm-panel" :class="{ 'dark-mode': isDark }">
    <div class="panel-header">
      <div class="panel-title">
        <el-icon><AlarmClock /></el-icon>
        <span>闹钟提醒</span>
      </div>
      <el-button type="primary" size="small" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加
      </el-button>
    </div>

    <div class="alarm-list" v-if="alarmStore.alarms.length > 0">
      <div 
        class="alarm-item" 
        v-for="alarm in alarmStore.alarms" 
        :key="alarm.id"
        :class="{ disabled: !alarm.enabled }"
      >
        <div class="alarm-info">
          <div class="alarm-time">{{ alarm.time }}</div>
          <div class="alarm-meta">
            <span class="alarm-name">{{ alarm.name || '闹钟' }}</span>
            <span class="alarm-repeat">{{ getRepeatText(alarm.repeat) }}</span>
          </div>
        </div>
        <div class="alarm-actions">
          <el-switch
            v-model="alarm.enabled"
            size="small"
            @change="alarmStore.toggleAlarm(alarm.id)"
          />
          <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, alarm.id)">
            <el-button link size="small">
              <el-icon><MoreFilled /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit">编辑</el-dropdown-item>
                <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <el-icon size="48"><AlarmClock /></el-icon>
      <p>暂无闹钟，点击上方添加</p>
    </div>

    <el-dialog
      v-model="showAddDialog"
      :title="editingAlarm ? '编辑闹钟' : '添加闹钟'"
      width="400px"
      @closed="resetForm"
    >
      <el-form :model="alarmForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="alarmForm.name" placeholder="闹钟名称" maxlength="20" />
        </el-form-item>
        <el-form-item label="时间">
          <el-time-picker
            v-model="alarmForm.time"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="选择时间"
          />
        </el-form-item>
        <el-form-item label="重复">
          <el-radio-group v-model="alarmForm.repeat">
            <el-radio value="once">仅一次</el-radio>
            <el-radio value="daily">每天</el-radio>
            <el-radio value="weekday">工作日</el-radio>
            <el-radio value="weekend">周末</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="提醒">
          <el-checkbox v-model="alarmForm.sound">声音提醒</el-checkbox>
          <el-checkbox v-model="alarmForm.vibrate">震动</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveAlarm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useAppStore } from '@/stores/app'
import { useAlarmStore } from '@/stores/alarm'
import { ElMessage, ElMessageBox } from 'element-plus'

import type { Alarm } from '@/types'

const appStore = useAppStore()
const alarmStore = useAlarmStore()
const isDark = computed(() => appStore.isDark)

const showAddDialog = ref(false)
const editingAlarm = ref<Alarm | null>(null)

const alarmForm = reactive({
  name: '',
  time: '08:00',
  repeat: 'daily' as const,
  sound: true,
  vibrate: false,
  enabled: true
})

const getRepeatText = (repeat: string) => {
  const map: Record<string, string> = {
    once: '仅一次',
    daily: '每天',
    weekday: '工作日',
    weekend: '周末'
  }
  return map[repeat] || repeat
}

const handleCommand = (command: string, id: string) => {
  const alarm = alarmStore.alarms.find(a => a.id === id)
  if (!alarm) return

  if (command === 'edit') {
    editingAlarm.value = alarm
    alarmForm.name = alarm.name
    alarmForm.time = alarm.time
    alarmForm.repeat = alarm.repeat
    alarmForm.sound = alarm.sound
    alarmForm.vibrate = alarm.vibrate
    showAddDialog.value = true
  } else if (command === 'delete') {
    ElMessageBox.confirm('确定要删除这个闹钟吗？', '提示', {
      type: 'warning'
    }).then(() => {
      alarmStore.deleteAlarm(id)
      ElMessage.success('删除成功')
    }).catch(() => {})
  }
}

const saveAlarm = () => {
  if (!alarmForm.time) {
    ElMessage.warning('请选择时间')
    return
  }

  if (editingAlarm.value) {
    alarmStore.updateAlarm(editingAlarm.value.id, {
      name: alarmForm.name,
      time: alarmForm.time,
      repeat: alarmForm.repeat,
      sound: alarmForm.sound,
      vibrate: alarmForm.vibrate,
    })
    ElMessage.success('更新成功')
  } else {
    alarmStore.addAlarm({
      name: alarmForm.name,
      time: alarmForm.time,
      repeat: alarmForm.repeat,
      sound: alarmForm.sound,
      vibrate: alarmForm.vibrate,
      enabled: true
    })
    ElMessage.success('添加成功')
  }

  showAddDialog.value = false
  resetForm()
}

const resetForm = () => {
  editingAlarm.value = null
  alarmForm.name = ''
  alarmForm.time = '08:00'
  alarmForm.repeat = 'daily'
  alarmForm.sound = true
  alarmForm.vibrate = false
}
</script>

<style scoped lang="scss">
.alarm-panel {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  padding: 20px;
  margin-top: 20px;
  backdrop-filter: blur(10px);
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .panel-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 500;
      color: #1e293b;
      
      .el-icon {
        color: #667eea;
      }
    }
  }
  
  .alarm-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .alarm-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 12px;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(102, 126, 234, 0.05);
    }
    
    &.disabled {
      opacity: 0.5;
    }
    
    .alarm-info {
      .alarm-time {
        font-size: 28px;
        font-weight: 200;
        color: #1e293b;
        font-variant-numeric: tabular-nums;
      }
      
      .alarm-meta {
        display: flex;
        gap: 12px;
        margin-top: 4px;
        
        .alarm-name {
          font-size: 14px;
          color: #64748b;
        }
        
        .alarm-repeat {
          font-size: 12px;
          color: #94a3b8;
          background: rgba(100, 116, 139, 0.1);
          padding: 2px 8px;
          border-radius: 4px;
        }
      }
    }
    
    .alarm-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
  
  .empty-state {
    text-align: center;
    padding: 40px 0;
    color: #94a3b8;
    
    .el-icon {
      margin-bottom: 12px;
      opacity: 0.5;
    }
    
    p {
      font-size: 14px;
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
    
    .alarm-item {
      background: rgba(30, 41, 59, 0.8);
      
      &:hover {
        background: rgba(165, 180, 252, 0.1);
      }
      
      .alarm-info {
        .alarm-time {
          color: #f1f5f9;
        }
        
        .alarm-meta {
          .alarm-name {
            color: #94a3b8;
          }
          
          .alarm-repeat {
            color: #64748b;
            background: rgba(148, 163, 184, 0.15);
          }
        }
      }
    }
    
    .empty-state {
      color: #64748b;
    }
  }
}
</style>
