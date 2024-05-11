<script setup>
import { onMounted, computed } from 'vue';
import { NConfigProvider, NMessageProvider, useOsTheme, darkTheme } from 'naive-ui';
import Navbar from './components/NavBar.vue';

let osThemeRef = useOsTheme()
let theme = computed(() => osThemeRef.value === "dark" ? darkTheme : null);

const themeOverrides = {
  common: {
    primaryColor: '#2080F0FF',
    primaryColorHover: '#4098FCFF',
    primaryColorPressed: '#1060C9FF',
    primaryColorSuppl: '#4098FCFF',
  }
}
</script>

<template>
  <NConfigProvider :theme="theme" :theme-overrides="themeOverrides">
    <NMessageProvider>
      <Navbar />
    </NMessageProvider>
  </NConfigProvider>
</template>

<style scoped></style>
