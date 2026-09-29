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
  <button
    ref="buttonRef"
    class="rounded-sm px-2 py-1 size-sm text-gray-900 font-bold bg-gray-200 dark:bg-indigo-900 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-indigo-800 text-center hover:cursor-pointer"
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
      class="fixed z-100 w-2xs rounded-sm bg-white dark:bg-gray-800 shadow-lg flex flex-wrap gap-2 p-2"
      :style="{
        left: `${selectorX}px`,
        top: `${selectorY}px`,
        transform: 'translateX(-100%)',
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
      <form class="w-full flex flex-col gap-2">
        <div class="flex gap-2">
          <input
            type="text"
            maxlength="20"
            placeholder="New tag name"
            class="w-full rounded-sm border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 p-2 text-left text-gray-900 dark:text-gray-300 outline-blue-500"
            v-model="newTagName"
          />
          <input
            type="color"
            class="h-full aspect-square px-0.5 rounded-sm border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 text-left text-gray-900 outline-blue-500 hover:cursor-pointer"
            v-model="newTagColor"
          />
        </div>

        <button
          type="button"
          class="w-full rounded-sm bg-blue-600 p-2 text-white disabled:opacity-50 hover:scale-101 hover:cursor-pointer"
          @click="addNewTag"
        >
          Add Tag
        </button>
      </form>
    </div>
  </Teleport>
</template>
