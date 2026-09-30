<script setup lang="ts">
import { useEditorStore } from '@/stores/editor'
import { useBoardStore } from '@/stores/board'
import { useConfirmationStore } from '@/stores/confirmation'
import { computed, onMounted, ref } from 'vue'
import MemberTag from '../tags/MemberTag.vue'
import SaveButton from '../buttons/SaveButton.vue'
import { useAuthStore } from '@/stores/auth.ts'

const editorStore = useEditorStore()
const boardStore = useBoardStore()
const confirmationStore = useConfirmationStore()
const authStore = useAuthStore()

const originalTitle = ref(editorStore.currentBoard?.title || '')

const newTitle = ref(editorStore.currentBoard?.title || '')
const newMemberEmail = ref('')

const loadMembersResult = ref<{ success: boolean; message?: string } | null>(null)
const result = ref<{ success: boolean; message?: string } | null>(null)

const members = ref<{ id: string; email: string }[]>([])

const unsavedChanges = computed(() => {
  return newTitle.value !== originalTitle.value
})

const isOwner = computed(() => {
  if (!editorStore.currentBoard) return false

  return authStore.checkIsOwner(editorStore.currentBoard?.ownerId)
})

async function loadMembers(): Promise<void> {
  if (!editorStore.currentBoard) {
    return
  }

  loadMembersResult.value = null

  try {
    const membersData = await boardStore.getAllMembers(editorStore.currentBoard.id)
    members.value = membersData.map((member) => ({
      id: member.userId,
      email: member.user.email,
    }))
  } catch (error) {
    loadMembersResult.value = {
      success: false,
      message: 'Failed to load members.',
    }
  }
}

onMounted(loadMembers)

function closeEditor() {
  if (unsavedChanges.value) {
    confirmationStore.requestConfirmation(
      'You have unsaved changes. Are you sure you want to discard them?',
      () => {
        editorStore.stopEditing()
      },
      () => {},
    )
    return
  }
  editorStore.stopEditing()
}

async function saveBoard() {
  if (!editorStore.currentBoard) return

  try {
    await boardStore.updateBoard(editorStore.currentBoard.id, newTitle.value)
    editorStore.currentBoard.title = newTitle.value
    originalTitle.value = newTitle.value
    closeEditor()
  } catch (error) {
    result.value = {
      success: false,
      message: 'Failed to save board. Please try again.',
    }
  }
}

async function addMemberToBoard() {
  if (!editorStore.currentBoard) return

  result.value = null

  if (newMemberEmail.value.trim() === '') {
    result.value = {
      success: false,
      message: 'Please enter a valid email and ensure a board is selected.',
    }
    return
  }

  try {
    await boardStore.addMemberToBoard(editorStore.currentBoard.id, newMemberEmail.value)
    result.value = {
      success: true,
      message: `Member with email ${newMemberEmail.value} added to the board.`,
    }
    newMemberEmail.value = ''
  } catch (error) {
    if (error instanceof Error) {
      result.value = { success: false, message: `Failed to add member: ${error.message}` }
    } else {
      result.value = {
        success: false,
        message: 'Failed to add member. Please check the email and try again.',
      }
    }
  }

  await loadMembers()
}

function removeMemberFromBoard(memberId: string) {
  if (!editorStore.currentBoard) return

  confirmationStore.requestConfirmation(
    'Are you sure you want to remove this member from the board?',
    async () => {
      await performRemoveMember(memberId)
    },
    () => {},
  )
}

async function performRemoveMember(memberId: string) {
  if (!editorStore.currentBoard) return

  try {
    await boardStore.removeMemberFromBoard(editorStore.currentBoard.id, memberId)
    result.value = {
      success: true,
      message: 'Member removed from the board.',
    }
  } catch (error) {
    if (error instanceof Error) {
      result.value = {
        success: false,
        message: `Failed to remove member: ${error.message}`,
      }
    } else {
      result.value = {
        success: false,
        message: 'Failed to remove member. Please try again.',
      }
    }
  }
  await loadMembers()
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-2">
    <button
      class="fixed inset-0 backdrop-blur-sm"
      aria-label="Close board editor"
      @click="closeEditor"
    ></button>

    <div
      class="relative z-50 flex max-h-[calc(100svh-1rem)] w-full max-w-200 flex-col overflow-hidden rounded-sm bg-white shadow-lg dark:bg-gray-800"
    >
      <!-- Header -->
      <div
        class="flex shrink-0 items-center justify-between border-b border-gray-300 p-4 text-gray-900 dark:border-gray-700 dark:text-gray-300"
      >
        <h1 v-if="isOwner" class="text-lg font-bold">Board Editor</h1>
        <h1 v-else class="text-lg font-bold">Board Members</h1>

        <button
          class="text-lg font-bold hover:scale-105 hover:cursor-pointer"
          aria-label="Close board editor"
          @click="closeEditor"
        >
          ✕
        </button>
      </div>

      <!-- Scrollable content -->
      <div class="min-h-0 overflow-y-auto p-4 text-gray-900 lg:p-8 dark:text-gray-300">
        <div class="flex flex-wrap gap-2">
          <MemberTag
            :id="editorStore.currentBoard?.ownerId || ''"
            :email="editorStore.currentBoard?.owner?.email || ''"
            :showDeleteButton="false"
          />

          <MemberTag
            v-for="member in members"
            :key="member.id"
            :id="member.id"
            :email="member.email"
            :showDeleteButton="isOwner"
            @remove-member="removeMemberFromBoard"
          />
          <p v-if="loadMembersResult?.message">{{ loadMembersResult.message }}</p>
        </div>

        <div v-if="isOwner" class="mt-6 flex flex-col gap-4">
          <input
            id="board-title"
            v-model="newTitle"
            class="w-full rounded-sm border border-gray-200 bg-white p-2 text-left text-gray-900 outline-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            type="text"
            aria-label="Board title"
          />

          <div class="flex flex-col gap-2 sm:flex-row">
            <input
              id="board-member-email"
              v-model="newMemberEmail"
              class="min-w-0 flex-1 rounded-sm border border-gray-200 bg-white p-2 text-left text-gray-900 outline-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              type="email"
              aria-label="Member email"
              placeholder="Enter member's email"
            />

            <button
              class="shrink-0 rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:scale-105 hover:cursor-pointer hover:bg-blue-600"
              @click="addMemberToBoard"
            >
              Add Member
            </button>
          </div>

          <p
            v-if="result?.message"
            class="wrap-break-word"
            :class="{
              'text-red-500': !result.success,
              'text-green-500': result.success,
            }"
            role="status"
          >
            {{ result.message }}
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div
        v-if="isOwner"
        class="flex shrink-0 justify-end gap-2 border-t border-gray-300 p-4 lg:p-8 dark:border-gray-700"
      >
        <button
          class="rounded-md bg-gray-200 px-4 py-2 font-medium text-gray-800 hover:scale-105 hover:cursor-pointer hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
          @click="closeEditor"
        >
          Cancel
        </button>

        <SaveButton :disableOn="!unsavedChanges" @save="saveBoard" />
      </div>
    </div>
  </div>
</template>
