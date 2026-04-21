<template>
  <EmployeeList />
</template>

<script setup lang="ts">
import EmployeeList from './views/EmployeeList.vue';
</script>

<style>
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #f3f4f6;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #111827;
}
</style>
