<template>
  <div class="theme-selector">
    <div class="selector-header">
      <div class="header-title">
        <el-icon><Brush /></el-icon>
        <span>主题选择</span>
      </div>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索主题..."
          size="small"
          clearable
          style="width: 180px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <div class="selector-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="预设主题" name="preset">
          <template #label>
            <el-icon><StarFilled /></el-icon>
            预设
          </template>
        </el-tab-pane>
        <el-tab-pane label="我的主题" name="custom">
          <template #label>
            <el-icon><User /></el-icon>
            我的
          </template>
        </el-tab-pane>
        <el-tab-pane label="收藏夹" name="favorite">
          <template #label>
            <el-icon><Star /></el-icon>
            收藏
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="selector-content">
      <div v-if="activeTab === 'custom'" class="custom-actions">
        <el-button type="primary" size="small" @click="handleCreateCustom">
          <el-icon><Plus /></el-icon>
          创建新主题
        </el-button>
      </div>

      <div class="theme-grid">
        <div
          v-for="theme in filteredThemes"
          :key="theme.id"
          class="theme-item"
          :class="{ active: theme.id === currentTheme.id }"
          @click="handleSelectTheme(theme)"
        >
          <div
            class="theme-preview"
            :style="{ background: theme.colors.background }"
          >
            <div
              class="preview-gradient"
              :style="{
                background: `linear-gradient(135deg, ${theme.colors.gradientStart}, ${theme.colors.gradientEnd})`
              }"
            ></div>
            <div class="preview-colors">
              <div
                class="color-dot"
                :style="{ background: theme.colors.primary }"
              ></div>
              <div
                class="color-dot"
                :style="{ background: theme.colors.secondary }"
              ></div>
              <div
                class="color-dot"
                :style="{ background: theme.colors.accent }"
              ></div>
            </div>
            <div class="theme-badge" v-if="theme.id === currentTheme.id">
              <el-icon><Check /></el-icon>
            </div>
            <div
              class="favorite-btn"
              @click.stop="handleToggleFavorite(theme.id)"
            >
              <el-icon :class="{ active: theme.isFavorite }"><Star /></el-icon>
            </div>
          </div>
          <div class="theme-info">
            <div class="theme-name">{{ theme.name }}</div>
            <div class="theme-desc">{{ theme.description }}</div>
            <div class="theme-tags">
              <el-tag
                v-for="tag in theme.tags.slice(0, 2)"
                :key="tag"
                size="small"
                type="info"
              >
                {{ tag }}
              </el-tag>
            </div>
            <div class="theme-actions" v-if="activeTab === 'custom'">
              <el-button
                size="small"
                text
                @click.stop="handleEditTheme(theme)"
              >
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button
                size="small"
                text
                type="danger"
                @click.stop="handleDeleteTheme(theme)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
              <el-button
                size="small"
                text
                @click.stop="handleExportTheme(theme)"
              >
                <el-icon><Download /></el-icon>
                导出
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <el-empty
        v-if="filteredThemes.length === 0"
        :description="emptyDescription"
      />
    </div>

    <el-dialog
      v-model="customizerVisible"
      title="自定义主题"
      width="900px"
      :close-on-click-modal="false"
      class="customizer-dialog"
    >
      <ThemeCustomizer
        :visible="customizerVisible"
        :edit-theme="editingTheme"
        @update:visible="customizerVisible = $event"
        @saved="handleCustomThemeSaved"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { ElMessage, ElMessageBox } from 'element-plus'
import ThemeCustomizer from './ThemeCustomizer.vue'
import type { ThemeConfig } from '@/types'
import {
  Brush,
  Search,
  Star,
  StarFilled,
  User,
  Plus,
  Check,
  Edit,
  Delete,
  Download
} from '@element-plus/icons-vue'

const themeStore = useThemeStore()

const activeTab = ref('preset')
const searchKeyword = ref('')
const customizerVisible = ref(false)
const editingTheme = ref<ThemeConfig | null>(null)

const currentTheme = computed(() => themeStore.currentTheme)

const displayThemes = computed(() => {
  switch (activeTab.value) {
    case 'preset':
      return themeStore.allThemes.filter(t => t.isPreset)
    case 'custom':
      return themeStore.customThemes
    case 'favorite':
      return themeStore.favoriteThemeList
    default:
      return themeStore.allThemes.filter(t => t.isPreset)
  }
})

const filteredThemes = computed(() => {
  if (!searchKeyword.value.trim()) {
    return displayThemes.value
  }
  return themeStore.searchThemes(searchKeyword.value.trim())
})

const emptyDescription = computed(() => {
  switch (activeTab.value) {
    case 'preset':
      return '暂无预设主题'
    case 'custom':
      return '暂无自定义主题，点击上方按钮创建'
    case 'favorite':
      return '暂无收藏的主题'
    default:
      return '暂无主题'
  }
})

const handleSelectTheme = (theme: ThemeConfig) => {
  themeStore.applyTheme(theme)
  ElMessage.success(`已切换到「${theme.name}」主题`)
}

const handleToggleFavorite = (themeId: string) => {
  themeStore.toggleFavorite(themeId)
  const isFav = themeStore.favoriteThemes.includes(themeId)
  ElMessage.success(isFav ? '已添加到收藏' : '已取消收藏')
}

const handleCreateCustom = () => {
  editingTheme.value = null
  customizerVisible.value = true
}

const handleEditTheme = (theme: ThemeConfig) => {
  editingTheme.value = theme
  customizerVisible.value = true
}

const handleDeleteTheme = async (theme: ThemeConfig) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除主题「${theme.name}」吗？`,
      '删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    themeStore.deleteCustomTheme(theme.id)
    ElMessage.success('主题已删除')
  } catch {
    // 用户取消
  }
}

const handleExportTheme = (theme: ThemeConfig) => {
  themeStore.downloadThemeFile(theme)
  ElMessage.success('主题已导出')
}

const handleCustomThemeSaved = (theme: ThemeConfig) => {
  editingTheme.value = null
  ElMessage.success('主题已保存')
}
</script>

<style scoped lang="scss">
.theme-selector {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--theme-surface);
  border-radius: var(--theme-border-radius);
  backdrop-filter: blur(10px);
  border: 1px solid var(--theme-border);
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--theme-border);

  .header-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: var(--theme-text-primary);

    .el-icon {
      color: var(--theme-primary);
      font-size: 20px;
    }
  }
}

.selector-tabs {
  padding: 0 20px;
  border-bottom: 1px solid var(--theme-border);

  :deep(.el-tabs__nav) {
    border-bottom: none;
  }

  :deep(.el-tabs__item) {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.selector-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.custom-actions {
  margin-bottom: 16px;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.theme-item {
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);

    .theme-preview {
      box-shadow: var(--theme-shadow);
    }
  }

  &.active {
    .theme-preview {
      border-color: var(--theme-primary);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--theme-primary) 30%, transparent);
    }
  }

  .theme-preview {
    position: relative;
    height: 100px;
    border-radius: calc(var(--theme-border-radius) * 0.75);
    border: 2px solid transparent;
    overflow: hidden;
    transition: all 0.3s ease;

    .preview-gradient {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 55%;
    }

    .preview-colors {
      position: absolute;
      bottom: 10px;
      left: 12px;
      display: flex;
      gap: 6px;

      .color-dot {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.5);
      }
    }

    .theme-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--theme-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;

      .el-icon {
        font-size: 14px;
      }
    }

    .favorite-btn {
      position: absolute;
      top: 8px;
      left: 8px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.3);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(0, 0, 0, 0.5);
      }

      .el-icon.active {
        color: #fbbf24;
        fill: #fbbf24;
      }

      .el-icon {
        font-size: 14px;
      }
    }
  }

  .theme-info {
    padding: 12px 4px;

    .theme-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--theme-text-primary);
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .theme-desc {
      font-size: 12px;
      color: var(--theme-text-secondary);
      margin-bottom: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .theme-tags {
      display: flex;
      gap: 4px;
      margin-bottom: 8px;
    }

    .theme-actions {
      display: flex;
      gap: 4px;

      .el-button {
        padding: 4px 8px;
        font-size: 12px;
      }
    }
  }
}

:deep(.customizer-dialog) {
  .el-dialog__body {
    padding: 0;
    height: 600px;
  }

  .el-dialog__header {
    display: none;
  }
}
</style>
