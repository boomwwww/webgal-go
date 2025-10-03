<script setup lang="ts">
import { ref } from 'vue'
import webgal from '@/webgal'
const input = ref('')
const handleClick = () => {
  webgal.bus.emit('num', Number(input.value))
}
</script>

<template>
  v: {{ webgal.version }}
  <h1>You did it! pixi: {{ webgal.ctx.stage.pixi }}</h1>
  <p>Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the documentation</p>
  <input type="text" v-model="input" />
  <button @click="handleClick">click</button>
</template>

<style scoped></style>
