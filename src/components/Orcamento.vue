<template>
  <div class="section-content">
    <h2>Orçamentos</h2>
    <p>Implementar listagem / cadastro de orçamentos.</p>
  </div>
</template>
<script>
export default {
  name: 'Orcamento',
  props: {
    orcamentos: { type: Array, default: () => [] },
  },
};
</script>
<style scoped></style>
