<script setup lang="ts">
import KanbanBoard from '@/components/KanbanBoard.vue'
import KanbanCardEditor from '@/components/editors/KanbanCardEditor.vue'
import { useEditorStore } from '@/stores/editor'
import { useBoardStore } from '@/stores/board'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import KanbanBoardList from '@/components/KanbanBoardList.vue'
import ActionConfirmation from '@/components/overlays/ActionConfirmation.vue'
import KanbanTagEditor from '@/components/editors/KanbanTagEditor.vue'

const boardData = useBoardStore()
const editorStore = useEditorStore()
const route = useRoute()

const isLoading = ref(false)
const showLoading = ref(false)
const error = ref('')

watch(
  () => route.params.boardId,
  async (boardId) => {
    if (typeof boardId !== 'string') return

    let loadingTimer: ReturnType<typeof setTimeout> | undefined

    try {
      loadingTimer = setTimeout(() => {
        showLoading.value = true
      }, 300)

      isLoading.value = true
      error.value = ''

      await boardData.loadBoard(boardId)
    } catch (err) {
      error.value = 'Failed to load board'
    } finally {
      if (loadingTimer) {
        clearTimeout(loadingTimer)
      }

      showLoading.value = false
      isLoading.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="flex h-dvh min-h-0 flex-col overflow-hidden lg:flex-row">
    <KanbanBoardList />

    <div class="min-h-0 min-w-0 flex-1 overflow-hidden">
      <div v-if="showLoading" class="w-full p-6 text-center text-lg">Loading...</div>

      <div v-else-if="error" class="w-full p-6 text-center text-lg text-red-500" role="alert">
        {{ error }}
      </div>

      <KanbanBoard v-else :data="boardData.board" />
    </div>

    <KanbanCardEditor v-if="editorStore.isEditingCard" />
    <KanbanTagEditor v-if="editorStore.isEditingTags" />
    <ActionConfirmation />
  </div>
</template>
