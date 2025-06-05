<template>
  <div class="section-content">
    <h2>Reparos</h2>
    <p>Implementar listagem / lançamento de reparos.</p>
  </div>
</template>
<script>
export default {
  name: 'Lancamento',
  props: {
    reparos: { type: Array, default: () => [] },
  },
};
</script>
<style scoped></style>
