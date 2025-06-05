<template>
  <div class="section-content">
    <h2>Estoque</h2>
    <p>Implementar controle de estoque baseado em peças.</p>
  </div>
</template>
<script>
export default {
  name: 'Estoque',
  props: {
    pecas: { type: Array, default: () => [] },
  },
};
</script>
<style scoped></style>
