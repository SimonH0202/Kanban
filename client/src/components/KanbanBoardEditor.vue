<script setup lang="ts">
import { useBoardStore } from '@/stores/board'
import { useBoardEditorStore } from '@/stores/boardEditor'
import { ref } from 'vue'
import * as api from '@/api/api'

const boardEditorStore = useBoardEditorStore()

const newTitle = ref(boardEditorStore.currentBoard?.title || '')

function closeEditor() {
  boardEditorStore.stopEditing()
}

async function saveBoard() {
  if (boardEditorStore.currentBoard) {
    await api.updateBoard(boardEditorStore.currentBoard.id, { title: newTitle.value })
    boardEditorStore.currentBoard.title = newTitle.value
  }
  closeEditor()
}
</script>

<template>
  <div class="board-editor-overlay">
    <div class="board-editor-backdrop"></div>
    <div class="board-editor-modal">
      <div class="board-editor-header">
        <h2>Edit Board</h2>
        <button class="board-editor-close" @click="closeEditor">✕</button>
      </div>
      <div class="board-editor-content">
        <label for="board-title" class="board-editor__label">Title</label>
        <input
          id="board-title"
          class="board-editor__input"
          type="text"
          :value="boardEditorStore.currentBoard?.title"
          @input="
            (e) => {
              if (boardEditorStore.currentBoard) {
                newTitle = (e.target as HTMLInputElement).value
              }
            }
          "
        />
      </div>
      <div class="board-editor-footer">
        <button class="board-editor-button board-editor-button--cancel" @click="closeEditor">
          Cancel
        </button>
        <button class="board-editor-button board-editor-button--save" @click="saveBoard">
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.board-editor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.board-editor-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
}
.board-editor__label {
  font-size: 1rem;
  font-weight: bold;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}
.board-editor__input {
  font-size: 1rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  width: 100%;
  height: 2rem;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: none;
  border-radius: var(--border-radius-button);
  border-bottom: 1px solid var(--color-border);
  outline: none;
  background-color: var(--color-background-soft);
  color: var(--color-text);
}
.board-editor__input__textarea {
  max-width: 100%;
  min-width: 100%;
  height: 10rem;
}
.board-editor__input:focus {
  background-color: var(--color-background);
}
.board-editor-modal {
  position: relative;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.board-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.board-editor-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
}
.board-editor-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-button);
  transition: all 0.2s ease;
}
.board-editor-close:hover {
  background-color: var(--color-background-soft);
  color: var(--color-text);
}
.board-editor-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) var(--color-background);
}
.board-editor-content::-webkit-scrollbar {
  width: 8px;
}
.board-editor-content::-webkit-scrollbar-track {
  background: var(--color-background);
}
.board-editor-content::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}
.board-editor-content::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-secondary);
}
.board-editor-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
  justify-content: flex-end;
}
.board-editor-button {
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.board-editor-button--cancel {
  background-color: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
.board-editor-button--cancel:hover {
  background-color: var(--color-background-mute);
}
.board-editor-button--save {
  background-color: #34d399;
  color: var(--vt-c-white);
}
.board-editor-button--save:hover {
  background-color: #10b981;
}
.board-editor-button--delete {
  background-color: rgb(230, 11, 11);
  color: var(--vt-c-white);
  border: 1px solid var(--color-border);
}
.board-editor-button--delete:hover {
  background-color: rgb(248, 66, 66);
}
.board-editor-button--save:active {
  transform: scale(0.98);
}

.board-editor-button--deletecontainer {
  flex: auto;
}
</style>
