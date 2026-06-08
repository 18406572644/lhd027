import type { City, WidgetLibraryItem } from '@/types'

export const CITIES: City[] = [
  { id: '1', name: '北京', province: '北京市', adcode: '110000' },
  { id: '2', name: '上海', province: '上海市', adcode: '310000' },
  { id: '3', name: '广州', province: '广东省', adcode: '440100' },
  { id: '4', name: '深圳', province: '广东省', adcode: '440300' },
  { id: '5', name: '杭州', province: '浙江省', adcode: '330100' },
  { id: '6', name: '南京', province: '江苏省', adcode: '320100' },
  { id: '7', name: '成都', province: '四川省', adcode: '510100' },
  { id: '8', name: '武汉', province: '湖北省', adcode: '420100' },
  { id: '9', name: '西安', province: '陕西省', adcode: '610100' },
  { id: '10', name: '重庆', province: '重庆市', adcode: '500000' },
  { id: '11', name: '天津', province: '天津市', adcode: '120000' },
  { id: '12', name: '苏州', province: '江苏省', adcode: '320500' },
  { id: '13', name: '长沙', province: '湖南省', adcode: '430100' },
  { id: '14', name: '郑州', province: '河南省', adcode: '410100' },
  { id: '15', name: '青岛', province: '山东省', adcode: '370200' },
  { id: '16', name: '厦门', province: '福建省', adcode: '350200' },
  { id: '17', name: '昆明', province: '云南省', adcode: '530100' },
  { id: '18', name: '大连', province: '辽宁省', adcode: '210200' },
  { id: '19', name: '哈尔滨', province: '黑龙江省', adcode: '230100' },
  { id: '20', name: '三亚', province: '海南省', adcode: '460200' },
]

export const WEATHER_KEY = '693fa4ac2e047d72a92c9617b406af48'
export const WEATHER_BASE_URL = 'https://restapi.amap.com/v3/weather'

export const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export const WIND_DIRECTIONS = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']

export const STORAGE_KEYS = {
  SELECTED_CITY: 'weather_clock_selected_city',
  THEME: 'weather_clock_theme',
  ALARMS: 'weather_clock_alarms',
  FLOAT_WINDOW: 'weather_clock_float_window',
  WIDGETS: 'weather_clock_widgets',
  TODOS: 'weather_clock_todos',
}

export const WIDGET_LIBRARY: WidgetLibraryItem[] = [
  {
    type: 'clock',
    title: '时钟',
    description: '数字时钟或模拟时钟显示',
    icon: '⏰',
    defaultSize: { width: 280, height: 180 },
    defaultConfig: {
      clockMode: 'digital',
      showSeconds: true,
      showDate: true
    }
  },
  {
    type: 'weather',
    title: '天气',
    description: '当前天气或未来预报',
    icon: '🌤️',
    defaultSize: { width: 280, height: 200 },
    defaultConfig: {
      weatherMode: 'current',
      showForecastDays: 3
    }
  },
  {
    type: 'alarm',
    title: '闹钟',
    description: '显示下次闹钟倒计时',
    icon: '🔔',
    defaultSize: { width: 280, height: 140 },
    defaultConfig: {}
  },
  {
    type: 'todo',
    title: '待办',
    description: '今日待办事项列表',
    icon: '📝',
    defaultSize: { width: 320, height: 280 },
    defaultConfig: {}
  },
  {
    type: 'calendar',
    title: '日历',
    description: '月历视图显示',
    icon: '📅',
    defaultSize: { width: 320, height: 280 },
    defaultConfig: {}
  }
]

export const DEFAULT_WIDGET_STYLE = {
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  textColor: '#1e293b',
  accentColor: '#667eea',
  opacity: 0.95,
  borderRadius: 16,
  fontSize: 'medium' as const
}

export const WIDGET_RESIZE_HANDLE_SIZE = 12
export const WIDGET_MIN_SIZE = { width: 150, height: 100 }

export const PRIORITY_COLORS = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#ef4444'
}

export const PRIORITY_LABELS = {
  low: '低',
  medium: '中',
  high: '高'
}
