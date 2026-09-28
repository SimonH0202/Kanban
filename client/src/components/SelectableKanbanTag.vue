<script setup lang="ts">
defineProps<{
  id: string
  name: string
  color: string
  onSelectTag: (selectedTag: string) => void
}>()

function setTextColorBasedOnBackground(bgColor: string): string {
  const hex = bgColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Calculate the brightness of the color
  const brightness = (r * 299 + g * 587 + b * 114) / 1000

  // Return black for light backgrounds and white for dark backgrounds
  return brightness > 128 ? '#000000' : '#FFFFFF'
}
</script>

<template>
  <button
    class="inline-block rounded-sm px-2 py-1 text-white h-sm w-fit text-center hover:cursor-pointer hover:scale-105 transition-transform duration-200"
    :style="{ backgroundColor: color, color: setTextColorBasedOnBackground(color) }"
    @click="onSelectTag(id)"
  >
    {{ name }}
  </button>
</template>
