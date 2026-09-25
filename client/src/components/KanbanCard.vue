<template>
  <article
    class="bg-white rounded-sm p-4 text-gray-900 flex flex-col gap-2 shadow-md cursor-pointer hover:scale-105 hover:shadow-lg transition-transform duration-200"
    @click="
      cardEditorStore.startEditing({
        id,
        columnId,
        position,
        title,
        description,
        createdAt,
        updatedAt,
        dueDate,
      })
    "
  >
    <h3 class="font-bold text-sm text-gray-500">{{ title }}</h3>
    <p v-if="description" class="text-md text-gray-900">{{ description }}</p>
    <p v-if="dueDate" class="text-red-500 text-sm text-right">{{ formatDate(dueDate) }}</p>
  </article>
</template>

<script setup lang="ts">
import { useCardEditorStore } from '@/stores/cardEditor'
import { formatDate } from '@/util/util'

defineProps<{
  id: string
  columnId: string
  position: number
  title: string
  description?: string
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  dueDate?: Date | string | null
}>()

const cardEditorStore = useCardEditorStore()
</script>
