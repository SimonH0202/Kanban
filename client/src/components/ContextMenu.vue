<script setup lang="ts">
import type { ContextMenuItem } from '@/types/Items'
import { ref } from 'vue'

const props = defineProps<{
  items: ContextMenuItem[]
}>()

const isActive = ref(false)
</script>

<template>
  <div v-if="isActive" class="context-menu__backdrop" @click="() => (isActive = !isActive)"></div>
  <div class="context-menu-wrapper">
    <button @click="isActive = !isActive" class="context-menu__button">...</button>

    <div v-if="isActive" class="context-menu">
      <button
        v-for="item in items"
        :key="item.label"
        class="context-menu__item"
        :class="{ 'context-menu__item--danger': item.danger }"
        @click="
          () => {
            item.action()
            isActive = !isActive
          }
        "
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.context-menu {
  position: fixed;
  display: flex;
  flex-direction: column;
  background: var(--color-background);
  border: none;
  border-radius: var(--border-radius-inner);
  z-index: 999;
  outline: none;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.12),
    0 1px 2px rgba(0, 0, 0, 0.24);
  cursor: pointer;
  min-width: 12rem;
}
.context-menu__item {
  border-radius: var(--border-radius-inner);
  background-color: var(--color-background);
  padding: 0.5rem 0.75rem;
  border: none;
  color: var(--color-text);
  text-align: left;
  cursor: pointer;
}
.context-menu__item:hover {
  background-color: var(--color-background-soft);
}
.context-menu__item--danger {
  color: #ef4444;
}
.context-menu__backdrop {
  z-index: 100;
  position: fixed;
  inset: 0;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.1);
  cursor: pointer;
}
.context-menu__button {
  border: none;
  border-radius: var(--border-radius-button);
  background-color: rgba(0, 0, 0, 0);
  font-size: 1.2rem;
  font-weight: bold;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--color-text);
  padding: 0.5rem;
  margin: 0.5rem;
}
.context-menu__button:hover {
  background-color: var(--vt-c-divider-dark-2);
  cursor: pointer;
}
</style>
