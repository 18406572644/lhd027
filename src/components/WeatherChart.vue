<template>
  <div class="weather-chart" :class="{ 'dark-mode': isDark }">
    <div class="chart-toolbar">
      <el-radio-group v-model="chartDataType" size="small">
        <el-radio-button value="temperature">7天温度</el-radio-button>
        <el-radio-button value="precipitation">7天降水</el-radio-button>
        <el-radio-button value="hourly">24小时趋势</el-radio-button>
      </el-radio-group>
      <el-radio-group v-model="chartType" size="small" v-if="chartDataType !== 'precipitation'">
        <el-radio-button value="line">
          <el-icon><TrendCharts /></el-icon>
          <span class="btn-text">折线</span>
        </el-radio-button>
        <el-radio-button value="bar">
          <el-icon><Histogram /></el-icon>
          <span class="btn-text">柱状</span>
        </el-radio-button>
      </el-radio-group>
    </div>
    <div class="chart-container">
      <v-chart :option="chartOption" autoresize :theme="isDark ? 'dark' : undefined" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components'
import type { ComposeOption } from 'echarts/core'
import type { LineSeriesOption, BarSeriesOption } from 'echarts/charts'
import type {
  TitleComponentOption,
  TooltipComponentOption,
  GridComponentOption,
  LegendComponentOption
} from 'echarts/components'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])

type ECOption = ComposeOption<
  | LineSeriesOption
  | BarSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | LegendComponentOption
>

const appStore = useAppStore()
const isDark = computed(() => appStore.isDark)

const chartDataType = ref<'temperature' | 'precipitation' | 'hourly'>('temperature')
const chartType = ref<'line' | 'bar'>('line')

const textColor = computed(() => isDark.value ? '#94a3b8' : '#64748b')
const splitLineColor = computed(() => isDark.value ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)')

const chartOption = computed<ECOption>(() => {
  const baseOption: ECOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark.value ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDark.value ? 'rgba(148, 163, 184, 0.2)' : 'rgba(100, 116, 139, 0.2)',
      borderWidth: 1,
      textStyle: {
        color: textColor.value
      },
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: isDark.value ? '#a5b4fc' : '#667eea'
        }
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: chartDataType.value === 'precipitation' || chartType.value === 'bar',
      axisLine: {
        lineStyle: {
          color: splitLineColor.value
        }
      },
      axisLabel: {
        color: textColor.value,
        fontSize: 12
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisLabel: {
        color: textColor.value,
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: splitLineColor.value,
          type: 'dashed'
        }
      }
    }
  }

  if (chartDataType.value === 'temperature') {
    const weeks = appStore.forecast.map(d => d.week)
    const highTemps = appStore.forecast.map(d => parseInt(d.daytemp))
    const lowTemps = appStore.forecast.map(d => parseInt(d.nighttemp))

    return {
      ...baseOption,
      legend: {
        data: ['最高温度', '最低温度'],
        top: 0,
        textStyle: {
          color: textColor.value
        }
      },
      tooltip: {
        ...baseOption.tooltip,
        formatter: (params: any) => {
          let result = `<div style="font-weight: 500; margin-bottom: 4px;">${params[0].axisValue}</div>`
          params.forEach((param: any) => {
            const color = param.color
            result += `<div style="display: flex; align-items: center; gap: 8px; margin: 4px 0;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${color};"></span>
              <span>${param.seriesName}:</span>
              <span style="font-weight: 600;">${param.value}°C</span>
            </div>`
          })
          return result
        }
      },
      xAxis: {
        ...baseOption.xAxis,
        data: weeks
      },
      yAxis: {
        ...baseOption.yAxis,
        axisLabel: {
          ...baseOption.yAxis?.axisLabel,
          formatter: '{value}°'
        }
      },
      series: [
        {
          name: '最高温度',
          type: chartType.value,
          data: highTemps,
          smooth: chartType.value === 'line',
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#ef4444'
          },
          lineStyle: {
            width: 3
          },
          areaStyle: chartType.value === 'line' ? {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(239, 68, 68, 0.3)' },
                { offset: 1, color: 'rgba(239, 68, 68, 0.05)' }
              ]
            }
          } : undefined,
          barWidth: '30%'
        },
        {
          name: '最低温度',
          type: chartType.value,
          data: lowTemps,
          smooth: chartType.value === 'line',
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#3b82f6'
          },
          lineStyle: {
            width: 3
          },
          areaStyle: chartType.value === 'line' ? {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
              ]
            }
          } : undefined,
          barWidth: '30%'
        }
      ]
    }
  } else if (chartDataType.value === 'precipitation') {
    const weeks = appStore.forecast.map(d => d.week)
    const precipitations = appStore.forecast.map(d => parseInt(d.precipitation || '0'))

    return {
      ...baseOption,
      tooltip: {
        ...baseOption.tooltip,
        formatter: (params: any) => {
          const param = params[0]
          return `<div style="font-weight: 500; margin-bottom: 4px;">${param.axisValue}</div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${param.color};"></span>
              <span>降水概率:</span>
              <span style="font-weight: 600;">${param.value}%</span>
            </div>`
        }
      },
      xAxis: {
        ...baseOption.xAxis,
        data: weeks
      },
      yAxis: {
        ...baseOption.yAxis,
        max: 100,
        axisLabel: {
          ...baseOption.yAxis?.axisLabel,
          formatter: '{value}%'
        }
      },
      series: [
        {
          name: '降水概率',
          type: 'bar',
          data: precipitations,
          barWidth: '40%',
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#60a5fa' },
                { offset: 1, color: '#3b82f6' }
              ]
            },
            borderRadius: [6, 6, 0, 0]
          }
        }
      ]
    }
  } else {
    const times = appStore.hourlyTemperatures.map(d => d.time)
    const temps = appStore.hourlyTemperatures.map(d => d.temperature)

    return {
      ...baseOption,
      legend: {
        data: ['温度'],
        top: 0,
        textStyle: {
          color: textColor.value
        }
      },
      tooltip: {
        ...baseOption.tooltip,
        formatter: (params: any) => {
          const param = params[0]
          return `<div style="font-weight: 500; margin-bottom: 4px;">${param.axisValue}</div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${param.color};"></span>
              <span>温度:</span>
              <span style="font-weight: 600;">${param.value}°C</span>
            </div>`
        }
      },
      xAxis: {
        ...baseOption.xAxis,
        data: times,
        axisLabel: {
          ...baseOption.xAxis?.axisLabel,
          interval: 2,
          rotate: 0
        }
      },
      yAxis: {
        ...baseOption.yAxis,
        axisLabel: {
          ...baseOption.yAxis?.axisLabel,
          formatter: '{value}°'
        }
      },
      series: [
        {
          name: '温度',
          type: chartType.value,
          data: temps,
          smooth: chartType.value === 'line',
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: false,
          itemStyle: {
            color: '#667eea'
          },
          lineStyle: {
            width: 3
          },
          areaStyle: chartType.value === 'line' ? {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(102, 126, 234, 0.4)' },
                { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
              ]
            }
          } : undefined,
          barWidth: '60%'
        }
      ]
    }
  }
})
</script>

<style scoped lang="scss">
.weather-chart {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .chart-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    flex-wrap: wrap;
    gap: 12px;
    
    .btn-text {
      margin-left: 4px;
    }
  }
  
  .chart-container {
    flex: 1;
    min-height: 280px;
  }
  
  :deep(.el-radio-button__inner) {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  :deep(.el-radio-button--small .el-radio-button__inner) {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  &.dark-mode {
    :deep(.el-radio-button__inner) {
      background: rgba(30, 41, 59, 0.5);
      border-color: rgba(148, 163, 184, 0.2);
      color: #94a3b8;
      
      &:hover {
        color: #a5b4fc;
      }
    }
    
    :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
      background: #667eea;
      border-color: #667eea;
      color: #fff;
    }
  }
}
</style>
