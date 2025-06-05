<template>
  <div class="content-header">
    <h1 class="content-title">{{ title }}</h1>
    <div id="clock">{{ currentTime }}</div>
  </div>
</template>

<script>
export default {
  name: 'ContentHeader',
  props: {
    title: { type: String, default: '' },
    currentTime: { type: String, default: '' },
  },
};
</script>

<style scoped>
/* Já estilado em styles.css global */
</style>
