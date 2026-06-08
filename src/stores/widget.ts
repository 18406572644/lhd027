import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Widget, WidgetType, WidgetStyle, WidgetConfig, WidgetPosition, WidgetSize } from '@/types'
import { STORAGE_KEYS, WIDGET_LIBRARY, DEFAULT_WIDGET_STYLE } from '@/constants'

export const useWidgetStore = defineStore('widget', () => {
  const widgets = ref<Widget[]>([])
  const maxZIndex = ref(1)
  const activeWidgetId = ref<string | null>(null)

  const activeWidgets = computed(() => widgets.value)

  const saveWidgets = () => {
    localStorage.setItem(STORAGE_KEYS.WIDGETS, JSON.stringify(widgets.value))
  }

  const loadWidgets = () => {
    const saved = localStorage.getItem(STORAGE_KEYS.WIDGETS)
    if (saved) {
      try {
        widgets.value = JSON.parse(saved)
        if (widgets.value.length > 0) {
          maxZIndex.value = Math.max(...widgets.value.map(w => w.zIndex)) + 1
        }
      } catch (e) {
        widgets.value = []
      }
    }
  }

  const generateWidgetId = (): string => {
    return `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const getNextZIndex = (): number => {
    return ++maxZIndex.value
  }

  const addWidget = (type: WidgetType, position?: WidgetPosition): Widget => {
    const libraryItem = WIDGET_LIBRARY.find(item => item.type === type)
    if (!libraryItem) {
      throw new Error(`Unknown widget type: ${type}`)
    }

    const newWidget: Widget = {
      id: generateWidgetId(),
      type,
      title: libraryItem.title,
      position: position || { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      size: { ...libraryItem.defaultSize },
      style: { ...DEFAULT_WIDGET_STYLE },
      config: { ...libraryItem.defaultConfig },
      zIndex: getNextZIndex()
    }

    widgets.value.push(newWidget)
    saveWidgets()
    return newWidget
  }

  const removeWidget = (id: string) => {
    widgets.value = widgets.value.filter(w => w.id !== id)
    if (activeWidgetId.value === id) {
      activeWidgetId.value = null
    }
    saveWidgets()
  }

  const updateWidgetPosition = (id: string, position: WidgetPosition) => {
    const widget = widgets.value.find(w => w.id === id)
    if (widget) {
      widget.position = position
      saveWidgets()
    }
  }

  const updateWidgetSize = (id: string, size: WidgetSize) => {
    const widget = widgets.value.find(w => w.id === id)
    if (widget) {
      widget.size = size
      saveWidgets()
    }
  }

  const updateWidgetStyle = (id: string, style: Partial<WidgetStyle>) => {
    const widget = widgets.value.find(w => w.id === id)
    if (widget) {
      widget.style = { ...widget.style, ...style }
      saveWidgets()
    }
  }

  const updateWidgetConfig = (id: string, config: Partial<WidgetConfig>) => {
    const widget = widgets.value.find(w => w.id === id)
    if (widget) {
      widget.config = { ...widget.config, ...config }
      saveWidgets()
    }
  }

  const bringToFront = (id: string) => {
    const widget = widgets.value.find(w => w.id === id)
    if (widget) {
      widget.zIndex = getNextZIndex()
      activeWidgetId.value = id
      saveWidgets()
    }
  }

  const getWidgetById = (id: string): Widget | undefined => {
    return widgets.value.find(w => w.id === id)
  }

  const clearAllWidgets = () => {
    widgets.value = []
    activeWidgetId.value = null
    maxZIndex.value = 1
    saveWidgets()
  }

  return {
    widgets,
    activeWidgets,
    activeWidgetId,
    addWidget,
    removeWidget,
    updateWidgetPosition,
    updateWidgetSize,
    updateWidgetStyle,
    updateWidgetConfig,
    bringToFront,
    getWidgetById,
    loadWidgets,
    clearAllWidgets
  }
})
