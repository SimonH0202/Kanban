<script setup lang="ts">
import { useEditorStore } from '@/stores/editor'
import type { Tag } from '@/types/Tag'
import { formatDate } from '@/util/util'
import KanbanTag from '../components/tags/KanbanTag.vue'

defineProps<{
  id: string
  columnId: string
  position: number
  title: string
  description?: string
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  dueDate?: Date | string | null
  tags: Tag[]
}>()

const editorStore = useEditorStore()
</script>

<template>
  <article
    class="bg-white dark:bg-gray-800 rounded-sm p-4 text-gray-900 dark:text-gray-300 flex flex-col gap-2 shadow-md cursor-pointer hover:scale-105 hover:shadow-lg transition-transform duration-200"
    @click="
      editorStore.startEditingCard({
        id,
        columnId,
        position,
        title,
        description,
        createdAt,
        updatedAt,
        dueDate,
        tags,
      })
    "
  >
    <div class="flex flex-wrap gap-2">
      <KanbanTag
        v-for="tag in tags"
        :key="tag.id"
        :id="tag.id"
        :name="tag.name"
        :color="tag.color"
        :flatten="true"
      />
    </div>
    <h3 class="font-bold text-sm text-gray-500 dark:text-gray-300">{{ title }}</h3>
    <p v-if="description" class="text-md text-gray-900 dark:text-gray-300">{{ description }}</p>
    <p v-if="dueDate" class="text-red-500 text-sm text-right">
      {{ formatDate(dueDate) }}
    </p>
  </article>
</template>
