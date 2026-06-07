<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

onMounted(() => {
  if (window.location.hash.includes('#/float')) {
    document.body.classList.add('float-mode')
  }
  
  appStore.applyTheme()
})
</script>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body.float-mode {
  background: transparent !important;
}

body.float-mode #app {
  background: transparent !important;
}
</style>
