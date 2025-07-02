<template>
  <div class="section-content">
    <div class="filter-row">
      <div class="search-box">
        <i class="fas fa-filter"></i>
        <select v-model="tipoRelatorio">
          <option value="">Selecione o Tipo de Relatório</option>
          <option value="clientes">Por Cliente</option>
          <option value="equipamentos">Por Equipamento</option>
          <option value="reparos">Por Status de Reparo</option>
        </select>
      </div>
      <button class="btn-success" @click="gerarRelatorio">
        <i class="fas fa-file-alt"></i> Gerar Relatório
      </button>
    </div>

    <div v-if="dadosRelatorio.length > 0" class="table-container">
      <h3 style="margin-bottom: 10px;">Resultado</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th v-for="(coluna, idx) in colunas" :key="idx">{{ coluna }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in dadosRelatorio" :key="idx">
            <td v-for="(valor, k) in item" :key="k">{{ valor }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="mensagem-relatorio">
      <p>Selecione o tipo de relatório e clique em "Gerar Relatório".</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Relatorios',
  data() {
    return {
      tipoRelatorio: '',
      dadosRelatorio: [],
      colunas: []
    };
  },
  methods: {
    gerarRelatorio() {
      switch (this.tipoRelatorio) {
        case 'clientes':
          this.colunas = ['Nome', 'Cidade', 'Telefone'];
          this.dadosRelatorio = [
            { Nome: 'João Silva', Cidade: 'São Paulo', Telefone: '(11) 99988-7766' },
            { Nome: 'Maria Santos', Cidade: 'Campinas', Telefone: '(19) 98888-1122' }
          ];
          break;
        case 'equipamentos':
          this.colunas = ['Tipo', 'Marca', 'Modelo'];
          this.dadosRelatorio = [
            { Tipo: 'Notebook', Marca: 'Dell', Modelo: 'Inspiron 15' },
            { Tipo: 'Impressora', Marca: 'HP', Modelo: 'DeskJet 2700' }
          ];
          break;
        case 'reparos':
          this.colunas = ['OS', 'Cliente', 'Situação'];
          this.dadosRelatorio = [
            { OS: '001', Cliente: 'João Silva', Situação: 'Finalizado' },
            { OS: '002', Cliente: 'Maria Santos', Situação: 'Em andamento' }
          ];
          break;
        default:
          this.colunas = [];
          this.dadosRelatorio = [];
          break;
      }
    }
  }
};
</script>

<style scoped>
.mensagem-relatorio {
  margin-top: 20px;
  text-align: center;
  font-style: italic;
  color: #666;
}
</style>