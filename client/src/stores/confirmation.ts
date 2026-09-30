import { defineStore } from 'pinia'
import { ref } from 'vue'

type ConfirmationCallback = () => void | Promise<void>

export const useConfirmationStore = defineStore('confirmation', () => {
  const isVisible = ref(false)
  const isLoading = ref(false)
  const message = ref('')
  const error = ref('')

  const onConfirm = ref<ConfirmationCallback | null>(null)
  const onCancel = ref<ConfirmationCallback | null>(null)

  function requestConfirmation(
    msg: string,
    confirmCallback: ConfirmationCallback,
    cancelCallback: ConfirmationCallback | null = null,
  ) {
    // Keep an existing confirmation from being overwritten.
    if (isVisible.value || isLoading.value) return

    message.value = msg
    error.value = ''
    onConfirm.value = confirmCallback
    onCancel.value = cancelCallback
    isVisible.value = true
  }

  function close() {
    isVisible.value = false
    message.value = ''
    error.value = ''
    onConfirm.value = null
    onCancel.value = null
  }

  async function run(callback: ConfirmationCallback | null) {
    if (!isVisible.value || isLoading.value) return

    isLoading.value = true
    error.value = ''

    try {
      await callback?.()
      close()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'The action failed. Please try again.'
    } finally {
      isLoading.value = false
    }
  }

  async function confirm() {
    await run(onConfirm.value)
  }

  async function cancel() {
    await run(onCancel.value)
  }

  return {
    isVisible,
    isLoading,
    message,
    error,
    requestConfirmation,
    confirm,
    cancel,
  }
})
