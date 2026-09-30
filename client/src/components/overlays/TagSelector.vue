<script setup lang="ts">
import { useBoardStore } from '@/stores/board'
import { computed, nextTick, ref } from 'vue'
import SelectableKanbanTag from '../tags/SelectableKanbanTag.vue'
import type { Tag } from '@/types/Tag.ts'

const boardStore = useBoardStore()

const isActive = ref(false)
const buttonRef = ref<HTMLButtonElement | null>(null)

const selectorX = ref(0)
const selectorY = ref(0)

const newTagName = ref('')
const newTagColor = ref('#000000')

const props = defineProps<{
  currentTags: Tag[]
}>()

const emit = defineEmits<{
  removeTag: [tagId: string]
  selectTag: [tagId: string]
}>()

const nonSelectedTags = computed(() => {
  const selectedTagIds = props.currentTags.map((tag) => tag.id)
  return boardStore.board.tags.filter((tag) => !selectedTagIds.includes(tag.id))
})

async function openSelector() {
  isActive.value = true

  await nextTick()

  const rect = buttonRef.value?.getBoundingClientRect()

  if (!rect) return

  selectorX.value = rect.right
  selectorY.value = rect.bottom + 8
}

function closeSelector() {
  isActive.value = false
}

async function addNewTag() {
  if (newTagName.value.trim() === '') return

  await boardStore.addTag(newTagName.value, newTagColor.value)

  newTagName.value = ''
  newTagColor.value = '#000000'

  const newTag = boardStore.board.tags[boardStore.board.tags.length - 1]

  if (newTag) {
    emit('selectTag', newTag.id)
  }

  closeSelector()
}
</script>

<template>
  <!-- Stays inside the Kanban column -->
  <button
    ref="buttonRef"
    class="rounded-sm bg-gray-200 px-2 py-1 text-center font-bold text-gray-900 hover:cursor-pointer hover:bg-gray-300 dark:bg-indigo-900 dark:text-gray-300 dark:hover:bg-indigo-800"
    aria-label="Select tags"
    @click="openSelector"
  >
    +
  </button>

  <!-- Gets moved to <body> -->
  <Teleport to="body">
    <div
      v-if="isActive"
      class="fixed inset-0 z-90 bg-black/5 backdrop-blur-sm"
      @click="closeSelector"
    ></div>

    <div
      v-if="isActive"
      class="fixed left-1/2 top-1/2 z-100 flex max-h-[calc(100svh-2rem)] w-2xs max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-wrap gap-2 overflow-y-auto rounded-sm bg-white p-2 shadow-lg sm:left-(--selector-x) sm:top-(--selector-y) sm:-translate-x-full sm:translate-y-0 dark:bg-gray-800"
      :style="{
        '--selector-x': `${selectorX}px`,
        '--selector-y': `${selectorY}px`,
      }"
    >
      <SelectableKanbanTag
        v-for="tag in nonSelectedTags"
        :key="tag.id"
        :id="tag.id"
        :name="tag.name"
        :color="tag.color"
        @selectTag="emit('selectTag', tag.id)"
      />

      <form class="flex w-full flex-col gap-2" @submit.prevent="addNewTag">
        <div class="flex items-center gap-2">
          <input
            v-model="newTagName"
            type="text"
            maxlength="20"
            placeholder="New tag name"
            aria-label="New tag name"
            class="min-w-0 flex-1 rounded-sm border border-gray-200 bg-white p-2 text-left text-gray-900 outline-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          />

          <input
            v-model="newTagColor"
            type="color"
            aria-label="New tag color"
            class="h-10 w-10 shrink-0 rounded-sm border border-gray-200 bg-white px-0.5 outline-blue-500 hover:cursor-pointer dark:border-gray-700 dark:bg-gray-800"
          />
        </div>

        <button
          type="submit"
          class="w-full rounded-sm bg-blue-600 p-2 text-white hover:scale-101 hover:cursor-pointer disabled:opacity-50"
        >
          Add Tag
        </button>
      </form>
    </div>
  </Teleport>
</template>
