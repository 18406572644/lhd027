<template>
  <div class="todo-widget" :style="containerStyle">
    <div class="widget-header">
      <div class="header-title" :style="{ color: style.textColor }">
        📝 今日待办
      </div>
      <div class="header-count" :style="{ color: style.accentColor }">
        {{ todoStore.todayTodos.length }} 项
      </div>
    </div>
    
    <div class="add-todo">
      <el-input
        v-model="newTodo"
        size="small"
        placeholder="添加待办事项..."
        @keyup.enter="addNewTodo"
        :style="{ color: style.textColor }"
      />
      <el-select 
        v-model="newPriority" 
        size="small" 
        class="priority-select"
        :style="{ color: style.textColor }"
      >
        <el-option label="低" value="low" />
        <el-option label="中" value="medium" />
        <el-option label="高" value="high" />
      </el-select>
      <el-button 
        size="small" 
        type="primary"
        @click="addNewTodo"
      >
        添加
      </el-button>
    </div>
    
    <div class="todo-list" :class="{ 'empty': todoStore.todayTodos.length === 0 }">
      <div 
        v-for="todo in todoStore.todayTodos" 
        :key="todo.id" 
        class="todo-item"
        :style="{ borderLeftColor: getPriorityColor(todo.priority) }"
      >
        <el-checkbox 
          :model-value="todo.completed" 
          @change="todoStore.toggleTodo(todo.id)"
        />
        <span 
          class="todo-text"
          :style="{ color: style.textColor, textDecoration: todo.completed ? 'line-through' : 'none' }"
        >
          {{ todo.title }}
        </span>
        <el-button 
          link 
          size="small"
          class="delete-btn"
          @click.stop="todoStore.deleteTodo(todo.id)"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
      
      <div v-if="todoStore.todayTodos.length === 0" class="empty-state" :style="{ color: style.textColor, opacity: 0.5 }">
        暂无待办事项
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { useTodoStore } from '@/stores/todo'
import type { WidgetStyle, WidgetConfig } from '@/types'
import { PRIORITY_COLORS } from '@/constants'

defineProps<{
  style: WidgetStyle
  config: WidgetConfig
}>()

const todoStore = useTodoStore()
const newTodo = ref('')
const newPriority = ref<'low' | 'medium' | 'high'>('medium')

const containerStyle = computed(() => ({
  width: '100%',
  height: '100%',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column' as const
}))

const getPriorityColor = (priority: string) => {
  return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium
}

const addNewTodo = () => {
  if (newTodo.value.trim()) {
    todoStore.addTodo(newTodo.value.trim(), newPriority.value)
    newTodo.value = ''
  }
}
</script>

<style scoped lang="scss">
.todo-widget {
  .widget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .header-title {
      font-size: 14px;
      font-weight: 600;
    }
    
    .header-count {
      font-size: 12px;
      font-weight: 500;
    }
  }
  
  .add-todo {
    display: flex;
    gap: 6px;
    margin-bottom: 12px;
    
    .priority-select {
      width: 60px;
    }
  }
  
  .todo-list {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    
    &.empty {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .todo-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      margin-bottom: 6px 0;
      background: rgba(0, 0, 0, 0.03);
      border-radius: 8px;
      border-left: 3px solid;
      
      .todo-text {
        flex: 1;
        font-size: 13px;
        word-break: break-word;
      }
      
      .delete-btn {
        opacity: 0;
        transition: opacity 0.2s;
      }
      
      &:hover .delete-btn {
        opacity: 1;
      }
    }
    
    .empty-state {
      font-size: 13px;
      text-align: center;
    }
  }
}
</style>
