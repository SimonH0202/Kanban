<template>
  <article
    class="kanban-card"
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
    <h3 class="kanban-card__title">{{ title }}</h3>
    <p v-if="description" class="kanban-card__description">{{ description }}</p>
    <div class="kanban-card__meta">
      <span v-if="dueDate" class="kanban-card__due-date">{{ formatDate(dueDate) }}</span>
    </div>
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

<style scoped>
.kanban-card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.kanban-card__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
}

.kanban-card__description {
  margin: 0 0 0.75rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.kanban-card__meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
}

.kanban-card__assignee,
.kanban-card__due-date {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
</style>
