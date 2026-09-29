<script setup lang="ts">
import { useEditorStore } from '@/stores/editor'
import { useBoardStore } from '@/stores/board'
import { onMounted, ref } from 'vue'
import MemberTag from '../tags/MemberTag.vue'

const editorStore = useEditorStore()
const boardStore = useBoardStore()

const newTitle = ref(editorStore.currentBoard?.title || '')
const newMemberEmail = ref('')

const result = ref<{ success: boolean; message?: string } | null>(null)

const members = ref<{ id: string; email: string }[]>([])

async function loadMembers(): Promise<void> {
  if (!editorStore.currentBoard) {
    members.value = []
    return
  }

  try {
    const membersData = await boardStore.getAllMembers(editorStore.currentBoard.id)
    members.value = membersData.map((member) => ({
      id: member.userId,
      email: member.user.email,
    }))
  } catch (error) {
    console.error('Failed to fetch members:', error)
    members.value = []
  }
}

onMounted(loadMembers)

function closeEditor() {
  editorStore.stopEditing()
}

async function saveBoard() {
  if (!editorStore.currentBoard) return

  await boardStore.updateBoard(editorStore.currentBoard.id, newTitle.value)

  editorStore.currentBoard.title = newTitle.value

  closeEditor()
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
    newMemberEmail.value = ''
    result.value = {
      success: true,
      message: `Member with email ${newMemberEmail.value} added to the board.`,
    }
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

async function removeMemberFromBoard(memberId: string) {
  if (!editorStore.currentBoard) return

  try {
    await boardStore.removeMemberFromBoard(editorStore.currentBoard.id, memberId)
  } catch (error) {
    if (error instanceof Error) {
      result.value = { success: false, message: `Failed to remove member: ${error.message}` }
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
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <button
      class="fixed inset-0 backdrop-blur-sm"
      aria-label="Close editor"
      @click="closeEditor"
    ></button>

    <div class="z-50 w-200 rounded-sm bg-white dark:bg-gray-800 shadow-lg">
      <div
        class="flex items-center justify-end border-b border-gray-300 dark:border-gray-700 p-4 text-gray-900 dark:text-gray-300"
      >
        <button class="text-lg font-bold hover:scale-105 hover:cursor-pointer" @click="closeEditor">
          ✕
        </button>
      </div>
      <div class="flex flex-wrap gap-2 p-8">
        <MemberTag
          v-for="member in members"
          :key="member.id"
          :id="member.id"
          :email="member.email"
          @remove-member="removeMemberFromBoard"
        />
      </div>
      <div class="flex flex-col gap-4 p-8 text-gray-900 dark:text-gray-300">
        <input
          id="board-title"
          v-model="newTitle"
          class="w-full rounded-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-left text-gray-900 dark:text-gray-300 outline-blue-500"
          type="text"
          @keyup.enter="saveBoard"
        />
        <div class="flex">
          <input
            id="board-member-email"
            v-model="newMemberEmail"
            class="w-full rounded-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-left text-gray-900 dark:text-gray-300 outline-blue-500"
            type="email"
            placeholder="Enter member's email"
          />
          <button
            class="ml-2 rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:scale-105 hover:cursor-pointer hover:bg-blue-600 w-2xs"
            @click="addMemberToBoard"
          >
            Add Member
          </button>
        </div>
        <span
          class="ml-2 opacity-0 h-4"
          :class="{
            'opacity-100 text-red-500': result && !result.success,
            'opacity-100 text-green-500': result && result.success,
          }"
          >{{ result?.message }}
        </span>

        <div class="mt-4 flex justify-end gap-2">
          <button
            class="rounded-md bg-gray-200 dark:bg-gray-600 px-4 py-2 font-medium text-gray-800 dark:text-gray-300 hover:scale-105 hover:cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-500"
            @click="closeEditor"
          >
            Cancel
          </button>

          <button
            class="rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:scale-105 hover:cursor-pointer hover:bg-blue-600"
            @click="saveBoard"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
```
