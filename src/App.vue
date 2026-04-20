<script setup lang="ts">
import { onMounted } from 'vue'
import { useSongsStore } from '@/stores/songs'
import { useProfileStore } from '@/stores/profile'
import CafeBackground from '@/components/CafeBackground.vue'
import SparkleLayer from '@/components/SparkleLayer.vue'

const songs = useSongsStore()
const profile = useProfileStore()
onMounted(() => {
  songs.loadFromPublic()
  profile.loadFromPublic()
})
</script>

<template>
  <CafeBackground />
  <SparkleLayer />
  <router-view v-slot="{ Component }">
    <transition name="view">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style>
.view-enter-active,
.view-leave-active {
  transition: opacity 0.25s ease;
}
.view-enter-from,
.view-leave-to {
  opacity: 0;
}
</style>
