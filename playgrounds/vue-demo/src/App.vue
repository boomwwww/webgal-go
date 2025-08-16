<script setup lang="ts">
import { createWebgal } from 'webgal-go';
import { myPlugin } from '@webgal-go/test-plugin';
const wg = createWebgal();
wg.use(myPlugin);

const _p = wg.ctx.stage;
wg.bus.emit('play', null);
</script>

<template>
  <h1>You did it! pixi: {{ wg.ctx.stage.pixi }}</h1>
  <p>Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the documentation</p>
</template>

<style scoped></style>
