<template>
  <div
    ref="widgetRef"
    class="widget-container"
    :class="{ 'is-active': isActive }"
    :style="widgetContainerStyle"
    @mousedown="handleMouseDown"
  >
    <div 
      class="widget-header" 
      @mousedown="startDrag"
    >
      <span class="widget-title">{{ widget.title }}</span>
      <div class="widget-actions">
        <el-button 
          link 
          size="small" 
          class="action-btn"
          @click.stop="openSettings"
          :title="'设置'"
        >
          <el-icon><Setting /></el-icon>
        </el-button>
        <el-button 
          link 
          size="small" 
          class="action-btn close-btn"
          @click.stop="removeWidget"
          :title="'关闭'"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </div>
    
    <div class="widget-content">
      <component 
        :is="widgetComponent" 
        :style="widget.style"
        :config="widget.config"
      />
    </div>
    
    <div
      v-for="handle in resizeHandles"
      :key="handle.name"
      class="resize-handle"
      :class="handle.name"
      :style="handle.style"
      @mousedown.stop="startResize($event, handle.name)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, markRaw } from 'vue'
import { Close, Setting } from '@element-plus/icons-vue'
import { useWidgetStore } from '@/stores/widget'
import type { Widget } from '@/types'
import { WIDGET_RESIZE_HANDLE_SIZE, WIDGET_MIN_SIZE } from '@/constants'

import ClockWidget from './widgets/ClockWidget.vue'
import WeatherWidget from './widgets/WeatherWidget.vue'
import AlarmWidget from './widgets/AlarmWidget.vue'
import TodoWidget from './widgets/TodoWidget.vue'
import CalendarWidget from './widgets/CalendarWidget.vue'

const props = defineProps<{
  widget: Widget
}>()

const emit = defineEmits<{
  openSettings: [widget: Widget]
}>()

const widgetStore = useWidgetStore()
const widgetRef = ref<HTMLElement | null>(null)

const isActive = computed(() => widgetStore.activeWidgetId === props.widget.id)

const widgetComponent = computed(() => {
  const components: Record<string, any> = {
    clock: markRaw(ClockWidget),
    weather: markRaw(WeatherWidget),
    alarm: markRaw(AlarmWidget),
    todo: markRaw(TodoWidget),
    calendar: markRaw(CalendarWidget)
  }
  return components[props.widget.type] || ClockWidget
})

const widgetContainerStyle = computed(() => ({
  left: `${props.widget.position.x}px`,
  top: `${props.widget.position.y}px`,
  width: `${props.widget.size.width}px`,
  height: `${props.widget.size.height}px`,
  zIndex: props.widget.zIndex,
  backgroundColor: props.widget.style.backgroundColor,
  borderRadius: `${props.widget.style.borderRadius}px`,
  opacity: props.widget.style.opacity
}))

const resizeHandles = computed(() => [
  { name: 'n', style: { top: 0, left: `${WIDGET_RESIZE_HANDLE_SIZE}px`, right: `${WIDGET_RESIZE_HANDLE_SIZE}px`, height: `${WIDGET_RESIZE_HANDLE_SIZE}px`, cursor: 'n-resize' } },
  { name: 's', style: { bottom: 0, left: `${WIDGET_RESIZE_HANDLE_SIZE}px`, right: `${WIDGET_RESIZE_HANDLE_SIZE}px`, height: `${WIDGET_RESIZE_HANDLE_SIZE}px`, cursor: 's-resize' } },
  { name: 'e', style: { top: `${WIDGET_RESIZE_HANDLE_SIZE}px`, right: 0, bottom: `${WIDGET_RESIZE_HANDLE_SIZE}px`, width: `${WIDGET_RESIZE_HANDLE_SIZE}px`, cursor: 'e-resize' } },
  { name: 'w', style: { top: `${WIDGET_RESIZE_HANDLE_SIZE}px`, left: 0, bottom: `${WIDGET_RESIZE_HANDLE_SIZE}px`, width: `${WIDGET_RESIZE_HANDLE_SIZE}px`, cursor: 'w-resize' } },
  { name: 'ne', style: { top: 0, right: 0, width: `${WIDGET_RESIZE_HANDLE_SIZE}px`, height: `${WIDGET_RESIZE_HANDLE_SIZE}px`, cursor: 'ne-resize' } },
  { name: 'nw', style: { top: 0, left: 0, width: `${WIDGET_RESIZE_HANDLE_SIZE}px`, height: `${WIDGET_RESIZE_HANDLE_SIZE}px`, cursor: 'nw-resize' } },
  { name: 'se', style: { bottom: 0, right: 0, width: `${WIDGET_RESIZE_HANDLE_SIZE}px`, height: `${WIDGET_RESIZE_HANDLE_SIZE}px`, cursor: 'se-resize' } },
  { name: 'sw', style: { bottom: 0, left: 0, width: `${WIDGET_RESIZE_HANDLE_SIZE}px`, height: `${WIDGET_RESIZE_HANDLE_SIZE}px`, cursor: 'sw-resize' } }
])

let isDragging = false
let isResizing = false
let resizeDirection = ''
let startX = 0
let startY = 0
let startLeft = 0
let startTop = 0
let startWidth = 0
let startHeight = 0

const handleMouseDown = () => {
  widgetStore.bringToFront(props.widget.id)
}

const startDrag = (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest('.action-btn')) return
  
  isDragging = true
  startX = e.clientX
  startY = e.clientY
  startLeft = props.widget.position.x
  startTop = props.widget.position.y
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
}

const handleDrag = (e: MouseEvent) => {
  if (!isDragging) return
  
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  
  widgetStore.updateWidgetPosition(props.widget.id, {
    x: Math.max(0, startLeft + dx),
    y: Math.max(0, startTop + dy)
  })
}

const stopDrag = () => {
  isDragging = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}

const startResize = (e: MouseEvent, direction: string) => {
  isResizing = true
  resizeDirection = direction
  startX = e.clientX
  startY = e.clientY
  startLeft = props.widget.position.x
  startTop = props.widget.position.y
  startWidth = props.widget.size.width
  startHeight = props.widget.size.height
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

const handleResize = (e: MouseEvent) => {
  if (!isResizing) return
  
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  
  let newWidth = startWidth
  let newHeight = startHeight
  let newLeft = startLeft
  let newTop = startTop
  
  if (resizeDirection.includes('e')) {
    newWidth = Math.max(WIDGET_MIN_SIZE.width, startWidth + dx)
  }
  if (resizeDirection.includes('w')) {
    newWidth = Math.max(WIDGET_MIN_SIZE.width, startWidth - dx)
    newLeft = startLeft + (startWidth - newWidth)
  }
  if (resizeDirection.includes('s')) {
    newHeight = Math.max(WIDGET_MIN_SIZE.height, startHeight + dy)
  }
  if (resizeDirection.includes('n')) {
    newHeight = Math.max(WIDGET_MIN_SIZE.height, startHeight - dy)
    newTop = startTop + (startHeight - newHeight)
  }
  
  widgetStore.updateWidgetSize(props.widget.id, {
    width: newWidth,
    height: newHeight
  })
  
  if (resizeDirection.includes('w') || resizeDirection.includes('n')) {
    widgetStore.updateWidgetPosition(props.widget.id, {
      x: Math.max(0, newLeft),
      y: Math.max(0, newTop)
    })
  }
}

const stopResize = () => {
  isResizing = false
  resizeDirection = ''
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

const removeWidget = () => {
  widgetStore.removeWidget(props.widget.id)
}

const openSettings = () => {
  emit('openSettings', props.widget)
}

onMounted(() => {
  widgetStore.bringToFront(props.widget.id)
})

onUnmounted(() => {
  stopDrag()
  stopResize()
})
</script>

<style scoped lang="scss">
.widget-container {
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(100, 116, 139, 0.1);
  transition: box-shadow 0.2s, border-color 0.2s;
  overflow: hidden;
  user-select: none;
  
  &:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
    
    .resize-handle {
      opacity: 1;
    }
  }
  
  &.is-active {
    border-color: rgba(102, 126, 234, 0.4);
    box-shadow: 0 12px 48px rgba(102, 126, 234, 0.25);
  }
  
  .widget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 10px;
    background: rgba(0, 0, 0, 0.03);
    cursor: move;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    
    .widget-title {
      font-size: 12px;
      font-weight: 500;
      color: #64748b;
      opacity: 0.8;
    }
    
    .widget-actions {
      display: flex;
      gap: 2px;
      opacity: 0;
      transition: opacity 0.2s;
      
      .action-btn {
        padding: 2px;
        
        &:hover {
          color: #667eea;
        }
        
        &.close-btn:hover {
          color: #ef4444;
        }
      }
    }
    
    &:hover .widget-actions {
      opacity: 1;
    }
  }
  
  .widget-content {
    width: 100%;
    height: calc(100% - 30px);
    overflow: hidden;
  }
  
  .resize-handle {
    position: absolute;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 10;
    
    &:hover {
      opacity: 1;
    }
  }
}
</style>
