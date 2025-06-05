<template>
  <div class="section-content">
    <h2>Equipamentos</h2>
    <p>Implementar listagem / formulário de equipamentos.</p>
  </div>
</template>
<script>
export default {
  name: 'Equipamentos',
  props: {
    equipamentos: { type: Array, default: () => [] },
  },
};
</script>
<style scoped></style>
