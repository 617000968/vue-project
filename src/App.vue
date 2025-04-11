<template>
  <div id="app">
    <NavBar v-if="showNavBar" />
    <router-view/>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'

const route = useRoute()
const showNavBar = computed(() => !route.meta.hideNavbar)
</script>
<style>
html,
body {
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
}
</style>