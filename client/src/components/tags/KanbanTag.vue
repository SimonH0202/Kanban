<script setup lang="ts">
defineProps<{
  id: string
  name: string
  color: string
  flatten?: boolean
}>()

defineEmits<{
  removeTag: [tagId: string]
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
  <div>
    <span
      v-if="!flatten"
      class="rounded-sm px-2 py-1 text-white h-sm w-fit text-center flex items-center justify-center gap-1"
      :style="{ backgroundColor: color, color: setTextColorBasedOnBackground(color) }"
    >
      {{ name }}
      <button
        class="hover:cursor-pointer px-1 py-0.5 text-xs font-bold"
        :style="{ color: setTextColorBasedOnBackground(color) }"
        @click="$emit('removeTag', id)"
      >
        ✕
      </button>
    </span>
    <span
      v-else
      class="rounded-sm px-2 py-1 text-white h-0.5 w-10 text-center flex items-center justify-center gap-1"
      :style="{ backgroundColor: color }"
    >
    </span>
  </div>
</template>
