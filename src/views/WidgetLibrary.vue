<template>
  <div class="widget-library" :class="{ 'dark-mode': isDark }">
    <header class="library-header" @mousedown="startDrag">
      <div class="header-left">
        <h1 class="app-title">
          <span class="logo-icon">🧩</span>
          小组件库
        </h1>
      </div>
      <div class="header-right">
        <el-button 
          link 
          size="small"
          @click.stop="goBack"
        >
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-button link size="small" @click.stop="minimizeWindow">
          <el-icon><Minus /></el-icon>
        </el-button>
        <el-button link size="small" @click.stop="closeWindow">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </header>

    <main class="library-main">
      <div class="library-stats">
        <div class="stat-item">
          <span class="stat-icon">📦</span>
          <span class="stat-label">可用小组件</span>
          <span class="stat-value">{{ WIDGET_LIBRARY.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">🪟</span>
          <span class="stat-label">已添加小组件</span>
          <span class="stat-value">{{ widgets.length }}</span>
        </div>
        <el-button 
          type="danger" 
          size="small" 
          text
          @click="clearAllWidgets"
          v-if="widgets.length > 0"
        >
          <el-icon><Delete /></el-icon>
          清空全部
        </el-button>
      </div>

      <div class="widget-grid">
        <div 
          v-for="item in WIDGET_LIBRARY" 
          :key="item.type"
          class="widget-card"
          :class="{ 'has-widget': hasWidgetOfType(item.type) }"
        >
          <div class="card-icon">{{ item.icon }}</div>
          <div class="card-info">
            <h3 class="card-title">{{ item.title }}</h3>
            <p class="card-desc">{{ item.description }}</p>
            <div class="card-size">
              尺寸: {{ item.defaultSize.width }} × {{ item.defaultSize.height }}
            </div>
          </div>
          <div class="card-actions">
            <el-button 
              type="primary" 
              size="small"
              @click="addWidget(item.type)"
            >
              <el-icon><Plus /></el-icon>
              添加
            </el-button>
            <div v-if="hasWidgetOfType(item.type)" class="added-count">
              已添加 {{ getWidgetCount(item.type) }} 个
            </div>
          </div>
        </div>
      </div>

      <div class="active-widgets-section" v-if="widgetStore.widgets.length > 0">
        <h2 class="section-title">
          <span class="section-icon">📋</span>
          已添加的小组件
        </h2>
        <div class="active-widgets-list">
          <div 
            v-for="widget in widgets" 
            :key="widget.id"
            class="active-widget-item"
          >
            <span class="widget-icon">{{ getWidgetIcon(widget.type) }}</span>
            <span class="widget-name">{{ widget.title }}</span>
            <span class="widget-size">
              {{ widget.size.width }} × {{ widget.size.height }}
            </span>
            <span class="widget-position">
              ({{ Math.round(widget.position.x) }}, {{ Math.round(widget.position.y) }})
            </span>
            <el-button 
              link 
              size="small" 
              type="danger"
              @click="removeWidget(widget.id)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </main>

    <footer class="library-footer">
      <span>点击"添加"将小组件放到桌面，可自由拖拽调整位置和大小</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useWidgetStore } from '@/stores/widget'
import { WIDGET_LIBRARY } from '@/constants'
import type { WidgetType } from '@/types'
import { ArrowLeft, Minus, Close, Plus, Delete } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { appWindow } from '@tauri-apps/api/window'

const router = useRouter()
const appStore = useAppStore()
const widgetStore = useWidgetStore()
const { widgets } = storeToRefs(widgetStore)

const isDark = computed(() => appStore.isDark)

const getWidgetIcon = (type: WidgetType): string => {
  const item = WIDGET_LIBRARY.find(i => i.type === type)
  return item?.icon || '📦'
}

const hasWidgetOfType = (type: WidgetType): boolean => {
  return widgets.value.some(w => w.type === type)
}

const getWidgetCount = (type: WidgetType): number => {
  return widgets.value.filter(w => w.type === type).length
}

const addWidget = (type: WidgetType) => {
  widgetStore.addWidget(type)
}

const removeWidget = (id: string) => {
  widgetStore.removeWidget(id)
}

const clearAllWidgets = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要移除所有已添加的小组件吗？此操作不可恢复。',
      '确认清空',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    widgetStore.clearAllWidgets()
  } catch {
  }
}

const goBack = () => {
  router.push('/')
}

const startDrag = async (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest('button, .el-select, input')) return
  try {
    await appWindow.startDragging()
  } catch (err) {
    console.log('Drag not available')
  }
}

const minimizeWindow = async () => {
  try {
    await appWindow.minimize()
  } catch (err) {
    console.log('Minimize not available')
  }
}

const closeWindow = async () => {
  try {
    await appWindow.hide()
  } catch (err) {
    window.close()
  }
}
</script>

<style scoped lang="scss">
.widget-library {
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  
  .library-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(100, 116, 139, 0.1);
    cursor: move;
    user-select: none;
    z-index: 100;
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .app-title {
        font-size: 18px;
        font-weight: 600;
        color: #1e293b;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        
        .logo-icon {
          font-size: 24px;
        }
      }
    }
    
    .header-right {
      display: flex;
      align-items: center;
      gap: 4px;
      
      .el-button {
        color: #64748b;
        
        &:hover {
          color: #667eea;
        }
      }
    }
  }
  
  .library-main {
    flex: 1;
    min-height: 0;
    padding: 24px;
    overflow-y: auto;
    overflow-x: hidden;
    
    .library-stats {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 24px;
      padding: 16px 20px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 12px;
      
      .stat-item {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .stat-icon {
          font-size: 20px;
        }
        
        .stat-label {
          font-size: 13px;
          color: #64748b;
        }
        
        .stat-value {
          font-size: 18px;
          font-weight: 600;
          color: #667eea;
        }
      }
    }
    
    .widget-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
      
      .widget-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 16px;
        border: 2px solid transparent;
        transition: all 0.3s ease;
        cursor: pointer;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
          border-color: rgba(102, 126, 234, 0.3);
        }
        
        &.has-widget {
          border-color: rgba(34, 197, 94, 0.3);
        }
        
        .card-icon {
          font-size: 48px;
          line-height: 1;
        }
        
        .card-info {
          flex: 1;
          
          .card-title {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            margin: 0 0 4px 0;
          }
          
          .card-desc {
            font-size: 13px;
            color: #64748b;
            margin: 0 0 6px 0;
          }
          
          .card-size {
            font-size: 11px;
            color: #94a3b8;
          }
        }
        
        .card-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          
          .added-count {
            font-size: 11px;
            color: #22c55e;
            font-weight: 500;
          }
        }
      }
    }
    
    .active-widgets-section {
      margin-top: 32px;
      
      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 600;
        color: #1e293b;
        margin: 0 0 16px 0;
        
        .section-icon {
          font-size: 20px;
        }
      }
      
      .active-widgets-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        
        .active-widget-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 10px;
          
          .widget-icon {
            font-size: 20px;
          }
          
          .widget-name {
            font-size: 14px;
            font-weight: 500;
            color: #1e293b;
            flex: 1;
          }
          
          .widget-size,
          .widget-position {
            font-size: 12px;
            color: #64748b;
            font-family: monospace;
          }
        }
      }
    }
  }
  
  .library-footer {
    padding: 12px 20px;
    text-align: center;
    font-size: 12px;
    color: #94a3b8;
    background: rgba(255, 255, 255, 0.5);
  }
  
  &.dark-mode {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    
    .library-header {
      background: rgba(15, 23, 42, 0.8);
      border-bottom-color: rgba(148, 163, 184, 0.1);
      
      .header-left {
        .app-title {
          color: #f1f5f9;
        }
      }
      
      .header-right {
        .el-button {
          color: #94a3b8;
          
          &:hover {
            color: #a5b4fc;
          }
        }
      }
    }
    
    .library-main {
      .library-stats {
        background: rgba(30, 41, 59, 0.6);
        
        .stat-item {
          .stat-label {
            color: #94a3b8;
          }
          
          .stat-value {
            color: #a5b4fc;
          }
        }
      }
      
      .widget-grid {
        .widget-card {
          background: rgba(30, 41, 59, 0.8);
          
          &:hover {
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
          }
          
          .card-info {
            .card-title {
              color: #f1f5f9;
            }
            
            .card-desc {
              color: #94a3b8;
            }
            
            .card-size {
              color: #64748b;
            }
          }
        }
      }
      
      .active-widgets-section {
        .section-title {
          color: #f1f5f9;
        }
        
        .active-widgets-list {
          .active-widget-item {
            background: rgba(30, 41, 59, 0.6);
            
            .widget-name {
              color: #f1f5f9;
            }
            
            .widget-size,
            .widget-position {
              color: #94a3b8;
            }
          }
        }
      }
    }
    
    .library-footer {
      color: #64748b;
      background: rgba(15, 23, 42, 0.5);
    }
  }
}
</style>
