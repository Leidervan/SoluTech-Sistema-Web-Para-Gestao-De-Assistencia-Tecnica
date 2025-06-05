<template>
  <div class="alert" :class="'alert-' + type">
    <span class="alert-icon"><i class="fas" :class="icon"></i></span>
    <span>{{ message }}</span>
  </div>
</template>

<script>
export default {
  name: 'AlertMessage',
  props: {
    type: { type: String, required: true },
    icon: { type: String, required: true },
    message: { type: String, required: true },
  },
};
</script>

<style scoped>
/* Estilos de .alert, .alert-success, .alert-danger, .alert-warning em styles.css */
</style>
