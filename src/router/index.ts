import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'main',
    component: () => import('@/views/MainWindow.vue')
  },
  {
    path: '/float',
    name: 'float',
    component: () => import('@/views/FloatWindow.vue')
  },
  {
    path: '/widgets',
    name: 'widgets',
    component: () => import('@/views/WidgetLibrary.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
