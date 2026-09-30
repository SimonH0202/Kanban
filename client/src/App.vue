<script setup lang="ts">
import { RouterView } from 'vue-router'
import ActionConfirmation from '@/components/overlays/ActionConfirmation.vue'
</script>

<template>
  <main>
    <RouterView />
    <ActionConfirmation />
  </main>
</template>
