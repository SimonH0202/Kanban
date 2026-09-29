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
  <div class="flex flex-row">
    <KanbanBoardList />
    <div v-if="showLoading" class="p-6 w-full text-center text-lg">Loading...</div>
    <div v-else-if="error" class="text-red-500 text-lg p-6 w-full text-center" role="alert">
      {{ error }}
    </div>
    <template v-else-if="boardData.board">
      <KanbanBoard :data="boardData.board" />
      <KanbanCardEditor v-if="editorStore.isEditingCard" />
      <KanbanTagEditor v-if="editorStore.isEditingTags" />
    </template>
    <ActionConfirmation />
  </div>
</template>
