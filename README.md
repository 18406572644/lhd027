# 天气时钟 Weather Clock

一个基于 **Tauri + Vue3 + Element Plus** 开发的桌面天气时钟应用，比 Electron 更轻量高效。

## ✨ 功能特性

- 🕐 **实时时钟** - 精美的数字时钟显示，精确到秒
- 🌤️ **实时天气** - 基于高德地图 API，实时显示当前城市天气
- 📅 **天气预报** - 未来4天天气预报
- 🏙️ **多城市切换** - 内置20+热门城市，快速切换
- ⏰ **闹钟提醒** - 灵活的闹钟设置，支持多种重复模式
- 🪟 **桌面悬浮窗** - 迷你悬浮时钟，随时查看时间和天气
- 🎨 **主题切换** - 支持浅色/深色/跟随系统三种模式
- 🔔 **系统托盘** - 关闭到系统托盘，不占任务栏空间

## 🛠️ 技术栈

- **前端**: Vue 3 + TypeScript + Vite
- **UI框架**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **桌面端**: Tauri (Rust)
- **HTTP请求**: Axios
- **日期处理**: Day.js

## 📦 安装

```bash
# 安装前端依赖
npm install

# 安装 Rust 环境 (如果尚未安装)
# 访问 https://www.rust-lang.org/tools/install 安装 Rustup
```

## 🚀 开发

```bash
# 启动开发服务器
npm run dev

# 启动 Tauri 开发模式
npm run tauri:dev
```

## 🏗️ 构建

```bash
# 构建生产版本
npm run tauri:build
```

## 📁 项目结构

```
├── src/                      # 前端源码
│   ├── components/           # 组件
│   │   ├── ClockDisplay.vue    # 时钟显示
│   │   ├── WeatherCard.vue     # 天气卡片
│   │   ├── ForecastPanel.vue   # 天气预报
│   │   ├── CitySelector.vue    # 城市选择器
│   │   ├── AlarmPanel.vue      # 闹钟面板
│   │   └── SettingsPanel.vue   # 设置面板
│   ├── views/                # 页面
│   │   ├── MainWindow.vue      # 主窗口
│   │   └── FloatWindow.vue     # 悬浮窗
│   ├── stores/               # Pinia 状态管理
│   │   ├── app.ts              # 应用状态
│   │   └── alarm.ts            # 闹钟状态
│   ├── types/                # TypeScript 类型定义
│   ├── constants/            # 常量配置
│   ├── styles/               # 全局样式
│   ├── router/               # 路由配置
│   ├── App.vue
│   └── main.ts
├── src-tauri/                # Tauri 后端
│   ├── src/
│   │   └── main.rs             # Rust 主程序
│   ├── Cargo.toml
│   └── tauri.conf.json       # Tauri 配置
├── public/                   # 静态资源
└── package.json
```

## ⚙️ 天气 API

使用高德地图开放平台的天气 API：

- 实时天气：`https://restapi.amap.com/v3/weather/weatherInfo?extensions=base`
- 天气预报：`https://restapi.amap.com/v3/weather/weatherInfo?extensions=all`

> 🔑 当前使用的是公开测试 Key，如果需要更稳定的服务，请自行在 [高德开放平台](https://lbs.amap.com/) 申请 Key 并替换 `src/constants/index.ts` 中的 `WEATHER_KEY`。

## 🎯 快捷键

- 全局快捷键可通过 Tauri 配置添加
- 系统托盘菜单提供快速操作入口

## 📝 License

MIT
