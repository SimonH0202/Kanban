<script setup lang="ts">
import IconHome from './icons/IconHome.vue'
</script>

<template>
  <RouterLink class="home-icon-container" :to="`/`"
    ><IconHome class="home-icon"></IconHome
  ></RouterLink>
</template>

<style scoped>
.home-icon-container:hover {
  background-color: var(--color-background);
  border: none;
  border-radius: var(--border-radius-inner);
}
.home-icon {
  color: var(--color-icon);
  align-self: start;
  padding-top: 0.5rem;
}
</style>
