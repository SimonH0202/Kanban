<script setup lang="ts">
import { useConfirmationStore } from '@/stores/confirmation'
const confirmationStore = useConfirmationStore()

function confirmAction() {
  confirmationStore.confirm()
  confirmationStore.isVisible = false
}

function cancelAction() {
  confirmationStore.cancel()
  confirmationStore.isVisible = false
}
</script>

<template>
  <div
    v-if="confirmationStore.isVisible"
    class="z-110 fixed inset-0 backdrop-blur-sm flex items-center justify-center"
  >
    <div class="bg-white p-6 rounded shadow-lg w-96">
      <p class="mb-6">{{ confirmationStore.message }}</p>
      <div class="flex justify-end gap-4">
        <button
          @click="cancelAction"
          class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          @click="confirmAction"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>
