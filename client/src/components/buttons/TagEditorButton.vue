<script setup lang="ts">
import { useEditorStore } from '@/stores/editor'
const editorStore = useEditorStore()

function openTagEditor() {
  editorStore.startEditingTags()
}
</script>

<template>
  <button
    class="bg-blue-500 text-white my-4 py-1 px-2 rounded hover:bg-blue-600 hover:cursor-pointer transition-colors duration-200 text-sm font-semibold"
    @click="openTagEditor"
  >
    Edit Tags
  </button>
</template>
