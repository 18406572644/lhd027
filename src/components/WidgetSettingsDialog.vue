<template>
  <el-dialog
    v-model="visible"
    title="小组件设置"
    width="480px"
    :close-on-click-modal="false"
  >
    <template v-if="widget">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="样式" name="style">
          <div class="settings-form">
            <div class="form-item">
              <label>背景颜色</label>
              <div class="color-picker-wrapper">
                <el-color-picker v-model="localStyle.backgroundColor" show-alpha />
                <span class="color-value">{{ localStyle.backgroundColor }}</span>
              </div>
            </div>
            
            <div class="form-item">
              <label>文字颜色</label>
              <div class="color-picker-wrapper">
                <el-color-picker v-model="localStyle.textColor" />
                <span class="color-value">{{ localStyle.textColor }}</span>
              </div>
            </div>
            
            <div class="form-item">
              <label>强调色</label>
              <div class="color-picker-wrapper">
                <el-color-picker v-model="localStyle.accentColor" />
                <span class="color-value">{{ localStyle.accentColor }}</span>
              </div>
            </div>
            
            <div class="form-item">
              <label>透明度</label>
              <el-slider 
                v-model="localStyle.opacity" 
                :min="0.5" 
                :max="1" 
                :step="0.05"
                show-input
              />
            </div>
            
            <div class="form-item">
              <label>圆角大小</label>
              <el-slider 
                v-model="localStyle.borderRadius" 
                :min="0" 
                :max="32" 
                :step="2"
                show-input
              />
            </div>
            
            <div class="form-item">
              <label>字体大小</label>
              <el-radio-group v-model="localStyle.fontSize">
                <el-radio-button value="small">小</el-radio-button>
                <el-radio-button value="medium">中</el-radio-button>
                <el-radio-button value="large">大</el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="配置" name="config" v-if="hasConfigOptions">
          <div class="settings-form">
            <template v-if="widget.type === 'clock'">
              <div class="form-item">
                <label>时钟模式</label>
                <el-radio-group v-model="localConfig.clockMode">
                  <el-radio-button value="digital">数字时钟</el-radio-button>
                  <el-radio-button value="analog">模拟时钟</el-radio-button>
                </el-radio-group>
              </div>
              
              <div class="form-item">
                <label>显示秒数</label>
                <el-switch v-model="localConfig.showSeconds" />
              </div>
              
              <div class="form-item">
                <label>显示日期</label>
                <el-switch v-model="localConfig.showDate" />
              </div>
            </template>
            
            <template v-if="widget.type === 'weather'">
              <div class="form-item">
                <label>天气模式</label>
                <el-radio-group v-model="localConfig.weatherMode">
                  <el-radio-button value="current">当前天气</el-radio-button>
                  <el-radio-button value="forecast">天气预报</el-radio-button>
                </el-radio-group>
              </div>
              
              <div class="form-item" v-if="localConfig.weatherMode === 'forecast'">
                <label>预报天数</label>
                <el-slider 
                  v-model="localConfig.showForecastDays" 
                  :min="1" 
                  :max="5" 
                  :step="1"
                  show-input
                />
              </div>
            </template>
          </div>
        </el-tab-pane>
      </el-tabs>
      
      <div class="preview-section">
        <label>预览</label>
        <div class="preview-box" :style="previewStyle">
          <component 
            :is="previewComponent" 
            :style="localStyle"
            :config="localConfig"
          />
        </div>
      </div>
    </template>
    
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="saveSettings">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, markRaw } from 'vue'
import type { Widget, WidgetStyle, WidgetConfig, WidgetType } from '@/types'
import { useWidgetStore } from '@/stores/widget'
import { DEFAULT_WIDGET_STYLE } from '@/constants'

import ClockWidget from './widgets/ClockWidget.vue'
import WeatherWidget from './widgets/WeatherWidget.vue'
import AlarmWidget from './widgets/AlarmWidget.vue'
import TodoWidget from './widgets/TodoWidget.vue'
import CalendarWidget from './widgets/CalendarWidget.vue'

const props = defineProps<{
  modelValue: boolean
  widget: Widget | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const widgetStore = useWidgetStore()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const activeTab = ref('style')
const localStyle = ref<WidgetStyle>({ ...DEFAULT_WIDGET_STYLE })
const localConfig = ref<WidgetConfig>({})

const hasConfigOptions = computed(() => {
  if (!props.widget) return false
  return ['clock', 'weather'].includes(props.widget.type)
})

const previewComponent = computed(() => {
  if (!props.widget) return null
  const components: Record<WidgetType, any> = {
    clock: markRaw(ClockWidget),
    weather: markRaw(WeatherWidget),
    alarm: markRaw(AlarmWidget),
    todo: markRaw(TodoWidget),
    calendar: markRaw(CalendarWidget)
  }
  return components[props.widget.type] || null
})

const previewStyle = computed(() => ({
  backgroundColor: localStyle.value.backgroundColor,
  borderRadius: `${localStyle.value.borderRadius}px`,
  opacity: localStyle.value.opacity,
  width: '280px',
  height: '200px',
  overflow: 'hidden'
}))

watch(() => props.widget, (newWidget) => {
  if (newWidget) {
    localStyle.value = { ...newWidget.style }
    localConfig.value = { ...newWidget.config }
    activeTab.value = 'style'
  }
}, { immediate: true })

const saveSettings = () => {
  if (props.widget) {
    widgetStore.updateWidgetStyle(props.widget.id, localStyle.value)
    widgetStore.updateWidgetConfig(props.widget.id, localConfig.value)
    visible.value = false
  }
}
</script>

<style scoped lang="scss">
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  .form-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    label {
      font-size: 13px;
      font-weight: 500;
      color: #475569;
    }
    
    .color-picker-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .color-value {
        font-size: 12px;
        font-family: monospace;
        color: #64748b;
      }
    }
  }
}

.preview-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(100, 116, 139, 0.15);
  
  label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: #475569;
    margin-bottom: 12px;
  }
  
  .preview-box {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(100, 116, 139, 0.2);
    margin: 0 auto;
  }
}
</style>
