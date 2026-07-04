import type { Card } from '@/types/Card'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCardEditorStore = defineStore('cardEditor', () => {
  const isEditing = ref(false)
  const currentCard = ref(null as Card | null)

  function startEditing(card: Card) {
    isEditing.value = true
    currentCard.value = card
  }
  function stopEditing() {
    isEditing.value = false
    currentCard.value = null
  }

  return { isEditing, currentCard, startEditing, stopEditing }
})
