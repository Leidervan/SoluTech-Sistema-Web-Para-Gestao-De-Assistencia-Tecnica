<template>
  <div class="section-content">
    <h2>Dashboard</h2>
    <div class="grid-dashboard">
      <div class="cadastro-bloco">
        <h3><i class="fas fa-users"></i> Clientes</h3>
        <p class="dash-number">{{ clientes.length }}</p>
      </div>
      <div class="cadastro-bloco">
        <h3><i class="fas fa-tools"></i> Reparos</h3>
        <p class="dash-number">{{ reparos.length }}</p>
      </div>
      <div class="cadastro-bloco">
        <h3><i class="fas fa-boxes"></i> Peças em Estoque</h3>
        <p class="dash-number">{{ estoqueTotal }}</p>
      </div>
      <div class="cadastro-bloco">
        <h3><i class="fas fa-file-invoice-dollar"></i> Orçamentos</h3>
        <p class="dash-number">{{ orcamentos.length }}</p>
      </div>
    </div>

    <div class="cadastro-bloco" style="margin-top: 20px;">
      <h3>Reparos Recentes</h3>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Equipamento</th>
              <th>Data</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(reparo, idx) in recentReparos" :key="idx">
              <td>{{ reparo.cliente }}</td>
              <td>{{ reparo.equipamento }}</td>
              <td>{{ formatDate(reparo.data_reparo) }}</td>
              <td>
                <span class="badge" :class="'badge-' + reparo.statusClass">
                  {{ reparo.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  props: {
    clientes: { type: Array, default: () => [] },
    reparos: { type: Array, default: () => [] },
    pecas: { type: Array, default: () => [] },
    orcamentos: { type: Array, default: () => [] },
  },
  computed: {
    estoqueTotal() {
      return this.pecas.reduce((total, p) => total + parseInt(p.quantidade || 0), 0);
    },
    recentReparos() {
      return this.reparos.slice(-5).map(r => ({
        ...r,
        statusClass: this.getStatusClass(r.status),
      }));
    },
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '';
      const d = new Date(dateString);
      return d.toLocaleDateString('pt-BR');
    },
    getStatusClass(status) {
      switch (status?.toLowerCase()) {
        case 'concluído': return 'success';
        case 'em andamento': return 'warning';
        case 'cancelado': return 'danger';
        default: return 'warning';
      }
    },
  },
};
</script>

<style scoped>
.grid-dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}
.dash-number {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
}
</style>
