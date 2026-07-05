<script setup lang="ts">
import { useBoardStore } from '@/stores/board'
import { useCardEditorStore } from '@/stores/cardEditor'
import { formatDateToInputValueString } from '@/util/util'

const cardEditorStore = useCardEditorStore()
const boardStore = useBoardStore()

function closeEditor() {
  cardEditorStore.stopEditing()
}

function saveCard() {
  if (cardEditorStore.currentCard) {
    boardStore.updateCard(cardEditorStore.currentCard.columnId, cardEditorStore.currentCard.id, {
      title: cardEditorStore.currentCard.title,
      description: cardEditorStore.currentCard.description,
      dueDate: cardEditorStore.currentCard.dueDate,
    })
  }
  closeEditor()
}

function deleteCard() {
  if (cardEditorStore.currentCard) {
    boardStore.deleteCard(cardEditorStore.currentCard.columnId, cardEditorStore.currentCard.id)
  }
  closeEditor()
}
</script>

<template>
  <div class="card-editor-overlay">
    <div class="card-editor-backdrop"></div>
    <div class="card-editor-modal">
      <div class="card-editor-header">
        <h2>Edit Card</h2>
        <button class="card-editor-close" @click="closeEditor">✕</button>
      </div>
      <div class="card-editor-content">
        <label for="card-title" class="card-editor__label">Title</label>
        <input
          id="card-title"
          class="card-editor__input"
          type="text"
          :value="cardEditorStore.currentCard?.title"
          @input="
            (e) => {
              if (cardEditorStore.currentCard) {
                cardEditorStore.currentCard.title = (e.target as HTMLInputElement).value
              }
            }
          "
        />
        <label for="card-description" class="card-editor__label">Description</label>
        <textarea
          id="card-description"
          class="card-editor__input card-editor__input__textarea"
          :value="cardEditorStore.currentCard?.description"
          @input="
            (e) => {
              if (cardEditorStore.currentCard) {
                cardEditorStore.currentCard.description = (e.target as HTMLTextAreaElement).value
              }
            }
          "
        ></textarea>
        <label for="card-due-date" class="card-editor__label">Due Date</label>
        <input
          id="card-due-date"
          type="date"
          class="card-editor__input"
          :value="formatDateToInputValueString(cardEditorStore.currentCard?.dueDate)"
          @input="
            (e) => {
              if (cardEditorStore.currentCard) {
                cardEditorStore.currentCard.dueDate = (e.target as HTMLInputElement).value
                  ? new Date((e.target as HTMLInputElement).value)
                  : undefined
              }
            }
          "
        />
      </div>
      <div class="card-editor-footer">
        <div class="card-editor-button--deletecontainer">
          <button class="card-editor-button card-editor-button--delete" @click="deleteCard">
            Delete
          </button>
        </div>
        <button class="card-editor-button card-editor-button--cancel" @click="closeEditor">
          Cancel
        </button>
        <button class="card-editor-button card-editor-button--save" @click="saveCard">Save</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-editor-overlay {
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
.card-editor-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
}
.card-editor__label {
  font-size: 1rem;
  font-weight: bold;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}
.card-editor__input {
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
.card-editor__input__textarea {
  max-width: 100%;
  min-width: 100%;
  height: 10rem;
}
.card-editor__input:focus {
  background-color: var(--color-background);
}
.card-editor-modal {
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
.card-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.card-editor-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
}
.card-editor-close {
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
.card-editor-close:hover {
  background-color: var(--color-background-soft);
  color: var(--color-text);
}
.card-editor-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) var(--color-background);
}
.card-editor-content::-webkit-scrollbar {
  width: 8px;
}
.card-editor-content::-webkit-scrollbar-track {
  background: var(--color-background);
}
.card-editor-content::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}
.card-editor-content::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-secondary);
}
.card-editor-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
  justify-content: flex-end;
}
.card-editor-button {
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.card-editor-button--cancel {
  background-color: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
.card-editor-button--cancel:hover {
  background-color: var(--color-background-mute);
}
.card-editor-button--save {
  background-color: #34d399;
  color: var(--vt-c-white);
}
.card-editor-button--save:hover {
  background-color: #10b981;
}
.card-editor-button--delete {
  background-color: rgb(230, 11, 11);
  color: var(--vt-c-white);
  border: 1px solid var(--color-border);
}
.card-editor-button--delete:hover {
  background-color: rgb(248, 66, 66);
}
.card-editor-button--save:active {
  transform: scale(0.98);
}

.card-editor-button--deletecontainer {
  flex: auto;
}
</style>
