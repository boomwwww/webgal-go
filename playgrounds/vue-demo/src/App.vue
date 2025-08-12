<script setup lang="ts">
import { createWebgal } from 'webgal-go';
import { myPlugin } from '@webgal-go/test-plugin';
const wg = createWebgal();
wg.use(myPlugin);
const x = wg.ctx.x;
</script>

<template>
  <h1>You did it! wg.ctx.x = {{ x }}</h1>
  <p>Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the documentation</p>
</template>

<style scoped></style>
