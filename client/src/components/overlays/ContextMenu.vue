<script setup lang="ts">
import type { ContextMenuItem } from '@/types/Items'
import { nextTick, ref } from 'vue'
import dotsIcon from '@/assets/icons/dots.png'

defineProps<{
  items: ContextMenuItem[]
  imageSrc?: string
}>()

const isActive = ref(false)
const buttonRef = ref<HTMLButtonElement | null>(null)

const menuX = ref(0)
const menuY = ref(0)

async function openMenu() {
  isActive.value = true

  await nextTick()

  const rect = buttonRef.value?.getBoundingClientRect()

  if (!rect) return

  menuX.value = rect.right
  menuY.value = rect.bottom + 8
}

function closeMenu() {
  isActive.value = false
}

function selectItem(item: ContextMenuItem) {
  item.action()
  closeMenu()
}
</script>

<template>
  <!-- Stays inside the Kanban column -->
  <button ref="buttonRef" class="h-4 w-4 hover:scale-110 hover:cursor-pointer" @click="openMenu">
    <img :src="imageSrc || dotsIcon" alt="Context Menu" />
  </button>

  <!-- Gets moved to <body> -->
  <Teleport to="body">
    <div
      v-if="isActive"
      class="fixed inset-0 z-90 bg-black/5 backdrop-blur-sm"
      @click="closeMenu"
    />

    <div
      v-if="isActive"
      class="fixed z-100 w-48 rounded-sm bg-white shadow-lg"
      :style="{
        left: `${menuX}px`,
        top: `${menuY}px`,
        transform: 'translateX(-100%)',
      }"
    >
      <button
        v-for="item in items"
        :key="item.label"
        class="w-full p-2 text-left text-gray-900 hover:bg-gray-100 rounded-sm"
        :class="{
          'text-red-500 hover:bg-red-100 rounded-sm': item.danger,
        }"
        @click="selectItem(item)"
      >
        {{ item.label }}
      </button>
    </div>
  </Teleport>
</template>
