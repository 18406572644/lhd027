<template>
  <el-select
    v-model="selectedId"
    class="city-selector"
    placeholder="选择城市"
    size="default"
    filterable
    @change="handleChange"
  >
    <el-option
      v-for="city in cities"
      :key="city.id"
      :label="`${city.name} - ${city.province}`"
      :value="city.id"
    />
  </el-select>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { CITIES } from '@/constants'

const appStore = useAppStore()
const cities = CITIES

const selectedId = ref(appStore.selectedCity.id)

watch(() => appStore.selectedCity.id, (newId) => {
  selectedId.value = newId
})

const handleChange = (id: string) => {
  const city = cities.find(c => c.id === id)
  if (city) {
    appStore.setSelectedCity(city)
  }
}
</script>

<style scoped lang="scss">
.city-selector {
  width: 200px;
}
</style>
