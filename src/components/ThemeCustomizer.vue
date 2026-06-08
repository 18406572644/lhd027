<template>
  <div class="theme-customizer">
    <div class="customizer-header">
      <div class="header-title">
        <el-icon><Brush /></el-icon>
        <span>{{ isEditing ? '编辑主题' : '自定义主题' }}</span>
      </div>
      <div class="header-actions">
        <el-button size="small" @click="handleImport">
          <el-icon><Upload /></el-icon>
          导入
        </el-button>
        <el-button size="small" @click="handleExport" v-if="!isEditing">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          style="display: none"
          @change="handleFileImport"
        />
      </div>
    </div>

    <div class="customizer-body">
      <div class="preview-section">
        <div class="preview-title">实时预览</div>
        <div class="preview-card">
          <div class="preview-header">
            <div class="preview-avatar" :style="{ background: previewTheme.colors.primary }">A</div>
            <div class="preview-info">
              <div class="preview-name" :style="{ color: previewTheme.colors.textPrimary }">{{ previewTheme.name }}</div>
              <div class="preview-desc" :style="{ color: previewTheme.colors.textSecondary }">{{ previewTheme.description }}</div>
            </div>
            <el-rate v-model="previewRating" disabled size="small" />
          </div>
          <div class="preview-content">
            <div class="preview-item">
              <el-button size="small" type="primary">主按钮</el-button>
              <el-button size="small">次按钮</el-button>
            </div>
            <div class="preview-item">
              <el-tag :color="previewTheme.colors.success" style="color: white">成功</el-tag>
              <el-tag :color="previewTheme.colors.warning" style="color: white">警告</el-tag>
              <el-tag :color="previewTheme.colors.error" style="color: white">错误</el-tag>
              <el-tag :color="previewTheme.colors.info" style="color: white">信息</el-tag>
            </div>
            <div class="preview-item">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: '65%', background: previewTheme.colors.primary }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基础设置" name="basic">
            <div class="form-group">
              <el-form-item label="主题名称">
                <el-input v-model="previewTheme.name" placeholder="输入主题名称" />
              </el-form-item>
              <el-form-item label="主题描述">
                <el-input v-model="previewTheme.description" type="textarea" :rows="2" placeholder="输入主题描述" />
              </el-form-item>
              <el-form-item label="显示模式">
                <el-radio-group v-model="previewTheme.mode">
                  <el-radio-button value="light">浅色</el-radio-button>
                  <el-radio-button value="dark">深色</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="字体">
                <el-select v-model="previewTheme.fontFamily">
                  <el-option
                    v-for="font in fontFamilies"
                    :key="font.value"
                    :label="font.label"
                    :value="font.value"
                  />
                </el-select>
              </el-form-item>
            </div>
          </el-tab-pane>

          <el-tab-pane label="颜色设置" name="colors">
            <div class="color-grid">
              <div class="color-item" v-for="(color, key) in colorLabels" :key="key">
                <div class="color-label">{{ color.label }}</div>
                <el-color-picker
                  v-model="previewTheme.colors[key as keyof typeof previewTheme.colors]"
                  size="small"
                  show-alpha
                />
              </div>
            </div>
            <div class="form-group">
              <el-form-item label="渐变起始色">
                <el-color-picker v-model="previewTheme.colors.gradientStart" show-alpha />
              </el-form-item>
              <el-form-item label="渐变结束色">
                <el-color-picker v-model="previewTheme.colors.gradientEnd" show-alpha />
              </el-form-item>
              <el-form-item label="背景">
                <el-input v-model="previewTheme.colors.background" placeholder="支持纯色或渐变" />
              </el-form-item>
            </div>
          </el-tab-pane>

          <el-tab-pane label="样式调整" name="style">
            <div class="form-group">
              <el-form-item :label="`卡片透明度: ${Math.round(previewTheme.cardOpacity * 100)}%`">
                <el-slider
                  v-model="previewTheme.cardOpacity"
                  :min="0.5"
                  :max="1"
                  :step="0.05"
                  show-input
                  :input-size="small"
                />
              </el-form-item>
              <el-form-item :label="`圆角大小: ${previewTheme.borderRadius}px`">
                <el-slider
                  v-model="previewTheme.borderRadius"
                  :min="0"
                  :max="32"
                  :step="1"
                  show-input
                />
              </el-form-item>
              <el-form-item :label="`阴影强度: ${Math.round(previewTheme.shadowIntensity * 100)}%`">
                <el-slider
                  v-model="previewTheme.shadowIntensity"
                  :min="0"
                  :max="1"
                  :step="0.05"
                  show-input
                />
              </el-form-item>
            </div>
          </el-tab-pane>

          <el-tab-pane label="标签" name="tags">
            <div class="form-group">
              <el-form-item label="主题标签">
                <el-select
                  v-model="selectedTags"
                  multiple
                  filterable
                  allow-create
                  placeholder="选择或创建标签"
                  style="width: 100%"
                >
                  <el-option
                    v-for="tag in availableTags"
                    :key="tag"
                    :label="tag"
                    :value="tag"
                  />
                </el-select>
              </el-form-item>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <div class="customizer-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button @click="handleReset">重置</el-button>
      <el-button type="primary" @click="handleSave">保存主题</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FONT_FAMILIES } from '@/constants/themes'
import type { ThemeConfig } from '@/types'
import { Brush, Upload, Download } from '@element-plus/icons-vue'

const props = defineProps<{
  visible: boolean
  editTheme?: ThemeConfig | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'saved', theme: ThemeConfig): void
}>()

const themeStore = useThemeStore()
const fileInput = ref<HTMLInputElement | null>(null)
const activeTab = ref('basic')
const previewRating = ref(4.5)

const isEditing = computed(() => !!props.editTheme)

const fontFamilies = FONT_FAMILIES

const colorLabels = {
  primary: { label: '主色调', key: 'primary' },
  secondary: { label: '辅助色', key: 'secondary' },
  accent: { label: '强调色', key: 'accent' },
  surface: { label: '表面色', key: 'surface' },
  textPrimary: { label: '主文字', key: 'textPrimary' },
  textSecondary: { label: '次文字', key: 'textSecondary' },
  border: { label: '边框色', key: 'border' },
  success: { label: '成功色', key: 'success' },
  warning: { label: '警告色', key: 'warning' },
  error: { label: '错误色', key: 'error' },
  info: { label: '信息色', key: 'info' }
}

const availableTags = [
  '简约', '深色', '浅色', '自然', '科技', '梦幻',
  '复古', '清新', '节日', '护眼', '省电', '商务',
  '浪漫', '可爱', '酷炫', '渐变', '纯色'
]

const previewTheme = ref<ThemeConfig>({
  id: '',
  name: '我的主题',
  description: '自定义主题',
  author: '本地用户',
  version: '1.0.0',
  createdAt: Date.now(),
  isPreset: false,
  isFavorite: false,
  colors: { ...themeStore.currentTheme.colors },
  cardOpacity: themeStore.currentTheme.cardOpacity,
  borderRadius: themeStore.currentTheme.borderRadius,
  fontFamily: themeStore.currentTheme.fontFamily,
  shadowIntensity: themeStore.currentTheme.shadowIntensity,
  mode: themeStore.currentTheme.mode,
  tags: []
})

const selectedTags = computed({
  get: () => previewTheme.value.tags,
  set: (val) => {
    previewTheme.value.tags = val
  }
})

watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.editTheme) {
        previewTheme.value = JSON.parse(JSON.stringify(props.editTheme))
      } else {
        previewTheme.value = {
          id: '',
          name: '我的主题',
          description: '自定义主题',
          author: '本地用户',
          version: '1.0.0',
          createdAt: Date.now(),
          isPreset: false,
          isFavorite: false,
          colors: { ...themeStore.currentTheme.colors },
          cardOpacity: themeStore.currentTheme.cardOpacity,
          borderRadius: themeStore.currentTheme.borderRadius,
          fontFamily: themeStore.currentTheme.fontFamily,
          shadowIntensity: themeStore.currentTheme.shadowIntensity,
          mode: themeStore.currentTheme.mode,
          tags: []
        }
      }
      themeStore.updateEditingTheme(previewTheme.value)
    }
  },
  { immediate: true }
)

watch(
  previewTheme,
  (val) => {
    themeStore.updateEditingTheme(val)
  },
  { deep: true }
)

const handleImport = () => {
  fileInput.value?.click()
}

const handleFileImport = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      const importedTheme = themeStore.importTheme(content)
      if (importedTheme) {
        previewTheme.value = importedTheme
        ElMessage.success('主题导入成功！')
        emit('saved', importedTheme)
      } else {
        ElMessage.error('主题文件格式错误')
      }
    } catch (err) {
      ElMessage.error('文件读取失败')
    }
  }
  reader.readAsText(file)
  target.value = ''
}

const handleExport = () => {
  themeStore.downloadThemeFile(previewTheme.value)
  ElMessage.success('主题已导出！')
}

const handleSave = async () => {
  if (!previewTheme.value.name.trim()) {
    ElMessage.warning('请输入主题名称')
    return
  }

  if (previewTheme.value.isPreset) {
    const { value } = await ElMessageBox.confirm(
      '预设主题不可修改，是否另存为新主题？',
      '提示',
      {
        confirmButtonText: '另存为',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    if (value !== 'confirm') return
    previewTheme.value.id = ''
    previewTheme.value.isPreset = false
    previewTheme.value.createdAt = Date.now()
  }

  themeStore.saveEditingTheme()
  ElMessage.success('主题保存成功！')
  emit('saved', previewTheme.value)
  emit('update:visible', false)
}

const handleReset = () => {
  previewTheme.value = {
    id: '',
    name: '我的主题',
    description: '自定义主题',
    author: '本地用户',
    version: '1.0.0',
    createdAt: Date.now(),
    isPreset: false,
    isFavorite: false,
    colors: { ...themeStore.currentTheme.colors },
    cardOpacity: themeStore.currentTheme.cardOpacity,
    borderRadius: themeStore.currentTheme.borderRadius,
    fontFamily: themeStore.currentTheme.fontFamily,
    shadowIntensity: themeStore.currentTheme.shadowIntensity,
    mode: themeStore.currentTheme.mode,
    tags: []
  }
}

const handleCancel = () => {
  themeStore.cancelEditingTheme()
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
.theme-customizer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--theme-surface);
  border-radius: var(--theme-border-radius);
  backdrop-filter: blur(10px);
  border: 1px solid var(--theme-border);
}

.customizer-header {
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

  .header-actions {
    display: flex;
    gap: 8px;
  }
}

.customizer-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.preview-section {
  width: 320px;
  padding: 20px;
  border-right: 1px solid var(--theme-border);
  overflow-y: auto;

  .preview-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--theme-text-primary);
    margin-bottom: 12px;
  }

  .preview-card {
    background: var(--theme-surface);
    border-radius: var(--theme-border-radius);
    border: 1px solid var(--theme-border);
    padding: 16px;
    box-shadow: var(--theme-shadow);

    .preview-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;

      .preview-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
      }

      .preview-info {
        flex: 1;

        .preview-name {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 2px;
        }

        .preview-desc {
          font-size: 12px;
        }
      }
    }

    .preview-content {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .preview-item {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .progress-bar {
        width: 100%;
        height: 8px;
        background: var(--theme-border);
        border-radius: 4px;
        overflow: hidden;

        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }
      }
    }
  }
}

.settings-section {
  flex: 1;
  padding: 20px;
  overflow-y: auto;

  :deep(.el-tabs__content) {
    padding-top: 16px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .color-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 20px;

    .color-item {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .color-label {
        font-size: 12px;
        color: var(--theme-text-secondary);
      }
    }
  }
}

.customizer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--theme-border);
}

@media (max-width: 768px) {
  .customizer-body {
    flex-direction: column;
  }

  .preview-section {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--theme-border);
  }
}
</style>
