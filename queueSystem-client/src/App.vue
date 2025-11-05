<template>
  <div class="app-container">
    <router-view />
    <global-message />
  </div>
</template>

<script setup>
import GlobalMessage from './components/GlobalMessage.vue';
// App组件逻辑
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}
.app-container {
  width: 100%;
  height: 100vh;
}
</style>
