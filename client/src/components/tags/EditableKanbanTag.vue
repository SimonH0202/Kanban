<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  id: string
  name: string
  color: string
}>()

defineEmits<{
  editTag: [tagId: string]
  deleteTag: [tagId: string]
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
  <div
    class="flex items-center gap-2 rounded-sm px-2"
    :style="{ backgroundColor: color, color: setTextColorBasedOnBackground(color) }"
  >
    <button
      class="py-1 h-sm w-fit text-center flex items-center justify-center gap-1 hover:cursor-pointer hover:scale-105 transition-transform duration-200"
      :style="{ color: setTextColorBasedOnBackground(color) }"
      @click="$emit('editTag', id)"
    >
      {{ name }}
    </button>
    <button
      class="hover:cursor-pointer py-0.5 text-xs font-bold text-gray-900 dark:text-gray-300 hover:scale-110 transition-colors duration-200 text-center"
      :style="{ color: setTextColorBasedOnBackground(color) }"
      @click="$emit('deleteTag', id)"
    >
      ✕
    </button>
  </div>
</template>
