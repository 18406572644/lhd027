<template>
  <div class="theme-market">
    <div class="market-header">
      <div class="header-title">
        <el-icon><Shop /></el-icon>
        <span>主题市场</span>
      </div>
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索主题..."
          size="small"
          clearable
          :prefix-icon="Search"
        />
      </div>
      <div class="header-actions">
        <el-button size="small" type="primary" @click="handleUpload">
          <el-icon><Upload /></el-icon>
          上传主题
        </el-button>
      </div>
    </div>

    <div class="market-tabs">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="热门推荐" name="hot" />
        <el-tab-pane label="最新上架" name="new" />
        <el-tab-pane label="评分最高" name="top" />
        <el-tab-pane label="我的收藏" name="favorite" />
      </el-tabs>
    </div>

    <div class="category-filter">
      <el-tag
        v-for="category in categories"
        :key="category"
        :type="selectedCategory === category ? '' : 'info'"
        @click="selectedCategory = selectedCategory === category ? '' : category"
        class="category-tag"
      >
        {{ category }}
      </el-tag>
    </div>

    <div class="market-content">
      <div v-loading="loading" class="theme-grid">
        <div
          v-for="theme in filteredThemes"
          :key="theme.id"
          class="theme-card-item"
          @click="handleThemeClick(theme)"
        >
          <div
            class="theme-preview"
            :style="{
              background: theme.colors.background,
              borderColor: theme.colors.border
            }"
          >
            <div class="preview-gradient" :style="{ background: `linear-gradient(135deg, ${theme.colors.gradientStart}, ${theme.colors.gradientEnd})` }"></div>
            <div class="preview-elements">
              <div class="preview-dot" :style="{ background: theme.colors.primary }"></div>
              <div class="preview-dot" :style="{ background: theme.colors.secondary }"></div>
              <div class="preview-dot" :style="{ background: theme.colors.accent }"></div>
            </div>
            <div class="favorite-btn" @click.stop="handleToggleFavorite(theme.id)">
              <el-icon :class="{ active: theme.isFavorite }"><Star /></el-icon>
            </div>
          </div>
          <div class="theme-info">
            <div class="theme-name-row">
              <span class="theme-name">{{ theme.name }}</span>
              <el-tag v-if="theme.tags?.[0]" size="small" type="info">{{ theme.tags[0] }}</el-tag>
            </div>
            <div class="theme-author">{{ theme.authorName }}</div>
            <div class="theme-stats">
              <span class="stat-item">
                <el-icon><Download /></el-icon>
                {{ formatNumber(theme.downloadCount) }}
              </span>
              <span class="stat-item">
                <el-icon><Star /></el-icon>
                {{ theme.rating }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <el-empty v-if="filteredThemes.length === 0" description="暂无主题" />
    </div>

    <el-dialog
      v-model="detailVisible"
      :title="selectedTheme?.name"
      width="600px"
      class="theme-detail-dialog"
    >
      <div v-if="selectedTheme" class="theme-detail">
        <div class="detail-preview">
          <div
            class="large-preview"
            :style="{ background: selectedTheme.colors.background }"
          >
            <div class="preview-content">
              <div class="preview-title" :style="{ color: selectedTheme.colors.textPrimary }">
                {{ selectedTheme.name }}
              </div>
              <div class="preview-desc" :style="{ color: selectedTheme.colors.textSecondary }">
                {{ selectedTheme.description }}
              </div>
              <div class="preview-buttons">
                <el-button type="primary" size="small" :style="{ '--el-button-bg-color': selectedTheme.colors.primary, '--el-button-border-color': selectedTheme.colors.primary }">
                  主按钮
                </el-button>
                <el-button size="small">次按钮</el-button>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-info">
          <div class="info-row">
            <div class="info-label">作者</div>
            <div class="info-value">{{ selectedTheme.authorName }}</div>
          </div>
          <div class="info-row">
            <div class="info-label">分类</div>
            <div class="info-value">{{ selectedTheme.category }}</div>
          </div>
          <div class="info-row">
            <div class="info-label">下载量</div>
            <div class="info-value">{{ formatNumber(selectedTheme.downloadCount) }}</div>
          </div>
          <div class="info-row">
            <div class="info-label">评分</div>
            <div class="info-value">
              <el-rate v-model="currentRating" size="small" @change="handleRate" />
              <span class="rating-text">({{ selectedTheme.ratingCount }}人评价)</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-label">标签</div>
            <div class="info-value">
              <el-tag
                v-for="tag in selectedTheme.tags"
                :key="tag"
                size="small"
                style="margin-right: 4px"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>

        <div class="detail-actions">
          <el-button @click="handleApply(selectedTheme)">应用主题</el-button>
          <el-button type="primary" @click="handleDownload(selectedTheme.id)">
            <el-icon><Download /></el-icon>
            下载主题
          </el-button>
          <el-button @click="handleToggleFavorite(selectedTheme.id)">
            <el-icon :class="{ active: isFavorite(selectedTheme.id) }"><Star /></el-icon>
            {{ isFavorite(selectedTheme.id) ? '取消收藏' : '收藏' }}
          </el-button>
        </div>

        <div class="comments-section">
          <div class="section-title">用户评价</div>
          <div class="comment-input">
            <el-input
              v-model="newComment"
              type="textarea"
              :rows="2"
              placeholder="写下你的评价..."
              maxlength="200"
              show-word-limit
            />
            <div class="comment-actions">
              <el-rate v-model="newRating" size="small" />
              <el-button type="primary" size="small" @click="handleSubmitComment">
                发布
              </el-button>
            </div>
          </div>
          <div class="comments-list">
            <div
              v-for="comment in selectedTheme.comments"
              :key="comment.id"
              class="comment-item"
            >
              <div class="comment-header">
                <div class="comment-avatar">{{ comment.userName[0] }}</div>
                <div class="comment-info">
                  <div class="comment-name">{{ comment.userName }}</div>
                  <el-rate v-model="comment.rating" disabled size="small" />
                </div>
                <div class="comment-time">{{ formatTime(comment.createdAt) }}</div>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
              <div class="comment-footer">
                <el-button link size="small" @click="handleLikeComment(comment)">
                  <el-icon><ChatLineSquare /></el-icon>
                  {{ comment.likes }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="uploadVisible" title="上传主题到市场" width="500px">
      <el-form v-if="uploadForm" :model="uploadForm" label-width="80px">
        <el-form-item label="选择主题">
          <el-select v-model="uploadForm.themeId" placeholder="选择要上传的主题">
            <el-option
              v-for="theme in customThemes"
              :key="theme.id"
              :label="theme.name"
              :value="theme.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="uploadForm.category" placeholder="选择分类">
            <el-option
              v-for="category in categories"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="uploadForm.description"
            type="textarea"
            :rows="3"
            placeholder="介绍一下你的主题..."
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitUpload">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { ElMessage } from 'element-plus'
import type { ThemeMarketItem, ThemeConfig } from '@/types'
import { Shop, Search, Upload, Download, Star, ChatLineSquare } from '@element-plus/icons-vue'

const themeStore = useThemeStore()

const activeTab = ref('hot')
const searchKeyword = ref('')
const selectedCategory = ref('')
const loading = ref(false)
const detailVisible = ref(false)
const selectedTheme = ref<ThemeMarketItem | null>(null)
const uploadVisible = ref(false)
const currentRating = ref(0)
const newComment = ref('')
const newRating = ref(5)

const uploadForm = ref<{
  themeId: string
  category: string
  description: string
} | null>(null)

const categories = ['简约', '深色', '自然', '科技', '梦幻', '复古', '清新', '节日', '商务', '浪漫']

const customThemes = computed(() => themeStore.customThemes)

const displayThemes = computed(() => {
  switch (activeTab.value) {
    case 'hot':
      return themeStore.hotThemes
    case 'new':
      return themeStore.newThemes
    case 'top':
      return themeStore.topRatedThemes
    case 'favorite':
      return themeStore.marketThemes.filter(t => themeStore.favoriteThemes.includes(t.id))
    default:
      return themeStore.hotThemes
  }
})

const filteredThemes = computed(() => {
  let result = displayThemes.value

  if (selectedCategory.value) {
    result = result.filter(t => t.category === selectedCategory.value)
  }

  if (searchKeyword.value.trim()) {
    result = themeStore.searchMarketThemes(searchKeyword.value.trim())
  }

  return result
})

watch(
  () => detailVisible.value,
  (val) => {
    if (val && selectedTheme.value) {
      currentRating.value = themeStore.userRatings[selectedTheme.value.id] || 0
    }
  }
)

const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return String(num)
}

const formatTime = (timestamp: number): string => {
  const diff = Date.now() - timestamp
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days > 0) return `${days}天前`
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours > 0) return `${hours}小时前`
  const minutes = Math.floor(diff / (1000 * 60))
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

const handleTabChange = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
}

const handleThemeClick = (theme: ThemeMarketItem) => {
  selectedTheme.value = theme
  detailVisible.value = true
}

const handleToggleFavorite = (themeId: string) => {
  themeStore.toggleFavorite(themeId)
  ElMessage.success(
    themeStore.favoriteThemes.includes(themeId) ? '已收藏' : '已取消收藏'
  )
}

const isFavorite = (themeId: string) => {
  return themeStore.favoriteThemes.includes(themeId)
}

const handleApply = (theme: ThemeMarketItem) => {
  const customTheme = themeStore.downloadFromMarket(theme.id)
  if (customTheme) {
    themeStore.applyTheme(customTheme)
    ElMessage.success('主题已应用！')
    detailVisible.value = false
  }
}

const handleDownload = (themeId: string) => {
  const theme = themeStore.downloadFromMarket(themeId)
  if (theme) {
    ElMessage.success('主题已下载到我的主题！')
  }
}

const handleRate = (rating: number) => {
  if (selectedTheme.value) {
    themeStore.rateTheme(selectedTheme.value.id, rating)
    ElMessage.success('评分成功！')
  }
}

const handleSubmitComment = () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  if (selectedTheme.value) {
    themeStore.rateTheme(selectedTheme.value.id, newRating.value, newComment.value.trim())
    ElMessage.success('评论发布成功！')
    newComment.value = ''
    newRating.value = 5
  }
}

const handleLikeComment = (comment: { id: string; likes: number }) => {
  comment.likes++
  ElMessage.success('点赞成功！')
}

const handleUpload = () => {
  if (customThemes.value.length === 0) {
    ElMessage.warning('请先创建自定义主题')
    return
  }
  uploadForm.value = {
    themeId: customThemes.value[0].id,
    category: categories[0],
    description: ''
  }
  uploadVisible.value = true
}

const handleSubmitUpload = () => {
  if (!uploadForm.value) return

  const theme = customThemes.value.find(t => t.id === uploadForm.value!.themeId)
  if (!theme) {
    ElMessage.error('请选择要上传的主题')
    return
  }

  const result = themeStore.uploadThemeToMarket(theme, uploadForm.value.category)
  if (result) {
    ElMessage.success('主题上传成功！')
    uploadVisible.value = false
  }
}
</script>

<style scoped lang="scss">
.theme-market {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--theme-surface);
  border-radius: var(--theme-border-radius);
  backdrop-filter: blur(10px);
  border: 1px solid var(--theme-border);
}

.market-header {
  display: flex;
  align-items: center;
  gap: 16px;
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

  .search-box {
    flex: 1;
    max-width: 300px;
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }
}

.market-tabs {
  padding: 0 20px;
  border-bottom: 1px solid var(--theme-border);
}

.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--theme-border);

  .category-tag {
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.05);
    }
  }
}

.market-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.theme-card-item {
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);

    .theme-preview {
      box-shadow: var(--theme-shadow);
    }
  }

  .theme-preview {
    position: relative;
    height: 120px;
    border-radius: calc(var(--theme-border-radius) * 0.75);
    border: 1px solid var(--theme-border);
    overflow: hidden;
    transition: all 0.3s ease;

    .preview-gradient {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 60%;
    }

    .preview-elements {
      position: absolute;
      bottom: 12px;
      left: 12px;
      display: flex;
      gap: 6px;

      .preview-dot {
        width: 16px;
        height: 16px;
        border-radius: 50%;
      }
    }

    .favorite-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(0, 0, 0, 0.5);
      }

      .el-icon.active {
        color: #fbbf24;
        fill: #fbbf24;
      }
    }
  }

  .theme-info {
    padding: 12px 4px;

    .theme-name-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;

      .theme-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--theme-text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
      }
    }

    .theme-author {
      font-size: 12px;
      color: var(--theme-text-secondary);
      margin-bottom: 8px;
    }

    .theme-stats {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: var(--theme-text-secondary);

      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;

        .el-icon {
          font-size: 14px;
        }
      }
    }
  }
}

.theme-detail {
  .detail-preview {
    margin-bottom: 20px;

    .large-preview {
      height: 180px;
      border-radius: var(--theme-border-radius);
      padding: 24px;
      display: flex;
      align-items: flex-end;

      .preview-content {
        .preview-title {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .preview-desc {
          font-size: 14px;
          margin-bottom: 16px;
        }

        .preview-buttons {
          display: flex;
          gap: 8px;
        }
      }
    }
  }

  .detail-info {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 20px;

    .info-row {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .info-label {
        font-size: 12px;
        color: var(--theme-text-secondary);
      }

      .info-value {
        font-size: 14px;
        color: var(--theme-text-primary);

        .rating-text {
          font-size: 12px;
          color: var(--theme-text-secondary);
          margin-left: 8px;
        }
      }
    }
  }

  .detail-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--theme-border);

    .el-icon.active {
      color: #fbbf24;
      fill: #fbbf24;
    }
  }

  .comments-section {
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--theme-text-primary);
      margin-bottom: 16px;
    }

    .comment-input {
      margin-bottom: 20px;

      .comment-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 8px;
      }
    }

    .comments-list {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .comment-item {
        padding: 12px;
        background: var(--theme-surface);
        border-radius: calc(var(--theme-border-radius) * 0.75);
        border: 1px solid var(--theme-border);

        .comment-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;

          .comment-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: var(--theme-primary);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 500;
          }

          .comment-info {
            flex: 1;

            .comment-name {
              font-size: 14px;
              font-weight: 500;
              color: var(--theme-text-primary);
              margin-bottom: 2px;
            }
          }

          .comment-time {
            font-size: 12px;
            color: var(--theme-text-secondary);
          }
        }

        .comment-content {
          font-size: 14px;
          color: var(--theme-text-primary);
          line-height: 1.5;
          margin-bottom: 8px;
        }

        .comment-footer {
          .el-icon {
            margin-right: 4px;
          }
        }
      }
    }
  }
}

:deep(.el-dialog) {
  .el-dialog__body {
    max-height: 70vh;
    overflow-y: auto;
  }
}
</style>
