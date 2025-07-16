<template>
  <div class="section-content">
    <!-- Cabeçalho com filtros -->
    <div class="header-section">
      <div class="header-info">
        <h2>Relatórios do Sistema</h2>
        <p>Gere relatórios detalhados sobre clientes, equipamentos, reparos e mais.</p>
      </div>
      <div class="date-info">
        <i class="fas fa-calendar-alt"></i>
        <span>{{ dataAtual }}</span>
      </div>
    </div>

    <!-- Filtros e configurações -->
    <div class="filter-section">
      <div class="filter-grid">
        <div class="filter-group">
          <label for="tipoRelatorio">Tipo de Relatório *</label>
          <select id="tipoRelatorio" v-model="tipoRelatorio" @change="resetFiltros">
            <option value="">Selecione o tipo de relatório</option>
            <option value="clientes">📋 Relatório de Clientes</option>
            <option value="equipamentos">⚙️ Relatório de Equipamentos</option>
            <option value="reparos">🔧 Relatório de Reparos</option>
            <option value="orcamentos">💰 Relatório de Orçamentos</option>
            <option value="financeiro">📊 Relatório Financeiro</option>
            <option value="estoque">📦 Relatório de Estoque</option>
          </select>
        </div>

        <div class="filter-group" v-if="tipoRelatorio">
          <label for="periodoInicio">Data Inicial</label>
          <input 
            type="date" 
            id="periodoInicio" 
            v-model="filtros.dataInicio"
          />
        </div>

        <div class="filter-group" v-if="tipoRelatorio">
          <label for="periodoFim">Data Final</label>
          <input 
            type="date" 
            id="periodoFim" 
            v-model="filtros.dataFim"
          />
        </div>

        <!-- Filtros específicos por tipo -->
        <div class="filter-group" v-if="tipoRelatorio === 'reparos'">
          <label for="statusReparo">Status</label>
          <select id="statusReparo" v-model="filtros.status">
            <option value="">Todos os status</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Finalizado">Finalizado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>

        <div class="filter-group" v-if="tipoRelatorio === 'orcamentos'">
          <label for="statusOrcamento">Status</label>
          <select id="statusOrcamento" v-model="filtros.status">
            <option value="">Todos os status</option>
            <option value="Pendente">Pendente</option>
            <option value="Aprovado">Aprovado</option>
            <option value="Rejeitado">Rejeitado</option>
            <option value="Vencido">Vencido</option>
          </select>
        </div>

        <div class="filter-group" v-if="tipoRelatorio === 'estoque'">
          <label for="filtroEstoque">Filtro</label>
          <select id="filtroEstoque" v-model="filtros.tipoEstoque">
            <option value="">Todos os itens</option>
            <option value="baixo">Estoque baixo (≤ 5)</option>
            <option value="zerado">Estoque zerado</option>
            <option value="disponivel">Disponível (> 0)</option>
          </select>
        </div>
      </div>

      <div class="action-buttons">
        <button 
          class="btn-clear" 
          @click="limparFiltros"
          :disabled="!tipoRelatorio"
        >
          <i class="fas fa-eraser"></i>
          Limpar
        </button>
        <button 
          class="btn-generate" 
          @click="gerarRelatorio"
          :disabled="!tipoRelatorio || gerando"
        >
          <i class="fas fa-spinner fa-spin" v-if="gerando"></i>
          <i class="fas fa-chart-bar" v-else></i>
          {{ gerando ? 'Gerando...' : 'Gerar Relatório' }}
        </button>
      </div>
    </div>

    <!-- Resumo estatístico -->
    <div v-if="dadosRelatorio.length > 0" class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-list"></i>
          </div>
          <div class="stat-info">
            <h3>{{ dadosRelatorio.length }}</h3>
            <p>Total de Registros</p>
          </div>
        </div>
        <div class="stat-card" v-if="valorTotal > 0">
          <div class="stat-icon">
            <i class="fas fa-dollar-sign"></i>
          </div>
          <div class="stat-info">
            <h3>{{ formatCurrency(valorTotal) }}</h3>
            <p>Valor Total</p>
          </div>
        </div>
        <div class="stat-card" v-if="estatisticas.media > 0">
          <div class="stat-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="stat-info">
            <h3>{{ formatCurrency(estatisticas.media) }}</h3>
            <p>Valor Médio</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-calendar"></i>
          </div>
          <div class="stat-info">
            <h3>{{ getPeriodoTexto() }}</h3>
            <p>Período</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabela de resultados -->
    <div v-if="dadosRelatorio.length > 0" class="results-section">
      <div class="results-header">
        <h3>
          <i class="fas fa-table"></i>
          {{ getTituloRelatorio() }}
        </h3>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th v-for="(coluna, idx) in colunas" :key="idx" @click="ordenarPor(coluna)">
                {{ coluna }}
                <i class="fas fa-sort" v-if="colunaOrdenacao !== coluna"></i>
                <i class="fas fa-sort-up" v-else-if="ordemCrescente"></i>
                <i class="fas fa-sort-down" v-else></i>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in dadosOrdenados" :key="idx" :class="getRowClass(item)">
              <td v-for="(valor, k) in item" :key="k" :class="getCellClass(k)">
                {{ formatarValor(valor, k) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginação -->
      <div class="pagination" v-if="totalPaginas > 1">
        <button 
          @click="paginaAtual = 1" 
          :disabled="paginaAtual === 1"
          class="page-btn"
        >
          <i class="fas fa-angle-double-left"></i>
        </button>
        <button 
          @click="paginaAtual--" 
          :disabled="paginaAtual === 1"
          class="page-btn"
        >
          <i class="fas fa-angle-left"></i>
        </button>
        <span class="page-info">
          Página {{ paginaAtual }} de {{ totalPaginas }}
        </span>
        <button 
          @click="paginaAtual++" 
          :disabled="paginaAtual === totalPaginas"
          class="page-btn"
        >
          <i class="fas fa-angle-right"></i>
        </button>
        <button 
          @click="paginaAtual = totalPaginas" 
          :disabled="paginaAtual === totalPaginas"
          class="page-btn"
        >
          <i class="fas fa-angle-double-right"></i>
        </button>
      </div>
    </div>

    <!-- Estado vazio -->
    <div v-else-if="!gerando" class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-chart-pie fa-3x"></i>
      </div>
      <h3>Nenhum relatório gerado</h3>
      <p v-if="!tipoRelatorio">
        Selecione o tipo de relatório e configure os filtros para começar.
      </p>
      <p v-else>
        Clique em "Gerar Relatório" para visualizar os dados.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Relatorios',
  props: {
    clientes: { type: Array, default: () => [] },
    equipamentos: { type: Array, default: () => [] },
    reparos: { type: Array, default: () => [] },
    orcamentos: { type: Array, default: () => [] },
    pecas: { type: Array, default: () => [] },
    fornecedores: { type: Array, default: () => [] },
  },
  data() {
    return {
      tipoRelatorio: '',
      dadosRelatorio: [],
      colunas: [],
      gerando: false,
      paginaAtual: 1,
      itensPorPagina: 20,
      colunaOrdenacao: '',
      ordemCrescente: true,
      filtros: {
        dataInicio: '',
        dataFim: '',
        status: '',
        tipoEstoque: '',
      },
    };
  },
  computed: {
    dataAtual() {
      return new Date().toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    dadosOrdenados() {
      let dados = [...this.dadosRelatorio];
      
      if (this.colunaOrdenacao) {
        dados.sort((a, b) => {
          const valorA = a[this.colunaOrdenacao];
          const valorB = b[this.colunaOrdenacao];
          
          if (typeof valorA === 'number' && typeof valorB === 'number') {
            return this.ordemCrescente ? valorA - valorB : valorB - valorA;
          }
          
          const strA = String(valorA).toLowerCase();
          const strB = String(valorB).toLowerCase();
          
          if (this.ordemCrescente) {
            return strA.localeCompare(strB);
          } else {
            return strB.localeCompare(strA);
          }
        });
      }

      // Aplicar paginação
      const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
      const fim = inicio + this.itensPorPagina;
      return dados.slice(inicio, fim);
    },

    totalPaginas() {
      return Math.ceil(this.dadosRelatorio.length / this.itensPorPagina);
    },

    valorTotal() {
      if (!this.dadosRelatorio.length) return 0;
      
      const campoValor = this.getCampoValor();
      if (!campoValor) return 0;
      
      return this.dadosRelatorio.reduce((total, item) => {
        const valor = parseFloat(item[campoValor]) || 0;
        return total + valor;
      }, 0);
    },

    estatisticas() {
      const total = this.valorTotal;
      const count = this.dadosRelatorio.length;
      
      return {
        total,
        media: count > 0 ? total / count : 0,
        count
      };
    },
  },
  methods: {
    resetFiltros() {
      this.filtros = {
        dataInicio: '',
        dataFim: '',
        status: '',
        tipoEstoque: '',
      };
      this.dadosRelatorio = [];
      this.colunas = [];
      this.paginaAtual = 1;
    },

    limparFiltros() {
      this.resetFiltros();
      this.tipoRelatorio = '';
    },

    async gerarRelatorio() {
      if (!this.tipoRelatorio) return;
      
      this.gerando = true;
      this.paginaAtual = 1;
      
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 800));
      
      try {
        switch (this.tipoRelatorio) {
          case 'clientes':
            this.gerarRelatorioClientes();
            break;
          case 'equipamentos':
            this.gerarRelatorioEquipamentos();
            break;
          case 'reparos':
            this.gerarRelatorioReparos();
            break;
          case 'orcamentos':
            this.gerarRelatorioOrcamentos();
            break;
          case 'financeiro':
            this.gerarRelatorioFinanceiro();
            break;
          case 'estoque':
            this.gerarRelatorioEstoque();
            break;
        }
      } finally {
        this.gerando = false;
      }
    },

    gerarRelatorioClientes() {
      this.colunas = ['Nome', 'CPF', 'Telefone', 'Email', 'Cidade', 'Estado'];
      this.dadosRelatorio = this.clientes.map(cliente => ({
        'Nome': `${cliente.nome} ${cliente.sobrenome}`.trim(),
        'CPF': cliente.cpf || '-',
        'Telefone': cliente.celular || cliente.telefone || '-',
        'Email': cliente.email || '-',
        'Cidade': cliente.cidade || '-',
        'Estado': cliente.estado || '-'
      }));
    },

    gerarRelatorioEquipamentos() {
      this.colunas = ['Tipo', 'Marca', 'Modelo', 'Nº Série', 'Ano', 'Voltagem'];
      this.dadosRelatorio = this.equipamentos.map(eq => ({
        'Tipo': eq.tipo || eq.nome_equipamento || '-',
        'Marca': eq.marca || eq.fabricante || '-',
        'Modelo': eq.modelo || '-',
        'Nº Série': eq.numero_serie || '-',
        'Ano': eq.ano_fabricacao || '-',
        'Voltagem': eq.voltagem || '-'
      }));
    },

    gerarRelatorioReparos() {
      let dados = this.reparos;
      
      if (this.filtros.status) {
        dados = dados.filter(r => (r.situacao || r.status) === this.filtros.status);
      }
      
      this.colunas = ['OS', 'Cliente', 'Equipamento', 'Situação', 'Responsável', 'Valor', 'Data'];
      this.dadosRelatorio = dados.map(reparo => ({
        'OS': reparo.ordem_servico || '-',
        'Cliente': reparo.nome_cliente || reparo.cliente || '-',
        'Equipamento': reparo.nome_equipamento || reparo.equipamento || '-',
        'Situação': reparo.situacao || reparo.status || '-',
        'Responsável': reparo.responsavel || '-',
        'Valor': reparo.valor_final || 0,
        'Data': this.formatarDataBR(reparo.data_hora_inicio || reparo.data_reparo)
      }));
    },

    gerarRelatorioOrcamentos() {
      let dados = this.orcamentos;
      
      if (this.filtros.status) {
        dados = dados.filter(o => o.status === this.filtros.status);
      }
      
      this.colunas = ['Cliente', 'Documento', 'Equipamento', 'Status', 'Valor', 'Data'];
      this.dadosRelatorio = dados.map(orc => ({
        'Cliente': orc.cliente || orc.nomeCliente || '-',
        'Documento': orc.documento || orc.cpf || '-',
        'Equipamento': orc.nome_equipamento || orc.nomeEquipamento || '-',
        'Status': orc.status || '-',
        'Valor': orc.valor_com_desconto || orc.valorComDesconto || 0,
        'Data': this.formatarDataBR(orc.data_emissao || orc.emissao)
      }));
    },

    gerarRelatorioFinanceiro() {
      const reparosComValor = this.reparos.filter(r => r.valor_final > 0);
      const orcamentosAprovados = this.orcamentos.filter(o => o.status === 'Aprovado');
      
      this.colunas = ['Tipo', 'Cliente', 'Descrição', 'Valor', 'Data', 'Status'];
      this.dadosRelatorio = [
        ...reparosComValor.map(r => ({
          'Tipo': 'Reparo',
          'Cliente': r.nome_cliente || r.cliente || '-',
          'Descrição': `OS: ${r.ordem_servico} - ${r.nome_equipamento}`,
          'Valor': r.valor_final || 0,
          'Data': this.formatarDataBR(r.data_hora_inicio),
          'Status': 'Finalizado'
        })),
        ...orcamentosAprovados.map(o => ({
          'Tipo': 'Orçamento',
          'Cliente': o.cliente || o.nomeCliente || '-',
          'Descrição': o.nome_equipamento || o.nomeEquipamento || 'Serviços',
          'Valor': o.valor_com_desconto || o.valorComDesconto || 0,
          'Data': this.formatarDataBR(o.data_emissao),
          'Status': 'Aprovado'
        }))
      ];
    },

    gerarRelatorioEstoque() {
      let dados = this.pecas;
      
      if (this.filtros.tipoEstoque) {
        dados = dados.filter(p => {
          const qty = p.quantidade || 0;
          switch (this.filtros.tipoEstoque) {
            case 'baixo': return qty <= 5 && qty > 0;
            case 'zerado': return qty === 0;
            case 'disponivel': return qty > 0;
            default: return true;
          }
        });
      }
      
      this.colunas = ['Peça', 'Fabricante', 'Quantidade', 'Preço Unit.', 'Valor Total', 'Status'];
      this.dadosRelatorio = dados.map(peca => {
        const qty = peca.quantidade || 0;
        const preco = peca.preco || peca.valor_unitario || 0;
        
        return {
          'Peça': peca.peca || peca.nome || '-',
          'Fabricante': peca.fabricante || '-',
          'Quantidade': qty,
          'Preço Unit.': preco,
          'Valor Total': qty * preco,
          'Status': this.getStatusEstoque(qty)
        };
      });
    },

    getStatusEstoque(quantidade) {
      if (quantidade === 0) return 'Esgotado';
      if (quantidade <= 5) return 'Baixo';
      return 'Disponível';
    },

    getCampoValor() {
      switch (this.tipoRelatorio) {
        case 'reparos':
        case 'financeiro':
          return 'Valor';
        case 'orcamentos':
          return 'Valor';
        case 'estoque':
          return 'Valor Total';
        default:
          return null;
      }
    },

    getTituloRelatorio() {
      const titulos = {
        clientes: 'Relatório de Clientes',
        equipamentos: 'Relatório de Equipamentos', 
        reparos: 'Relatório de Reparos',
        orcamentos: 'Relatório de Orçamentos',
        financeiro: 'Relatório Financeiro',
        estoque: 'Relatório de Estoque'
      };
      return titulos[this.tipoRelatorio] || 'Relatório';
    },

    getPeriodoTexto() {
      if (this.filtros.dataInicio && this.filtros.dataFim) {
        return `${this.formatarDataBR(this.filtros.dataInicio)} - ${this.formatarDataBR(this.filtros.dataFim)}`;
      }
      return 'Todos os registros';
    },

    ordenarPor(coluna) {
      if (this.colunaOrdenacao === coluna) {
        this.ordemCrescente = !this.ordemCrescente;
      } else {
        this.colunaOrdenacao = coluna;
        this.ordemCrescente = true;
      }
      this.paginaAtual = 1;
    },

    getRowClass(item) {
      if (this.tipoRelatorio === 'estoque') {
        const status = item.Status;
        if (status === 'Esgotado') return 'row-danger';
        if (status === 'Baixo') return 'row-warning';
      }
      if (this.tipoRelatorio === 'reparos') {
        const situacao = item.Situação;
        if (situacao === 'Cancelado') return 'row-danger';
        if (situacao === 'Em andamento') return 'row-warning';
      }
      return '';
    },

    getCellClass(coluna) {
      if (coluna.includes('Valor') || coluna === 'Preço Unit.') return 'cell-currency';
      if (coluna === 'Quantidade') return 'cell-number';
      return '';
    },

    formatarValor(valor, coluna) {
      if (coluna.includes('Valor') || coluna === 'Preço Unit.') {
        return this.formatCurrency(valor);
      }
      if (coluna === 'Data') {
        return this.formatarDataBR(valor);
      }
      return valor;
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }).format(value || 0);
    },

    formatarDataBR(dataString) {
      if (!dataString) return '-';
      try {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
      } catch {
        return dataString;
      }
    },
  },
};
</script>

<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
}

.header-info h2 {
  margin: 0 0 5px 0;
  font-size: 1.8em;
}

.header-info p {
  margin: 0;
  opacity: 0.9;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95em;
  opacity: 0.9;
}

.filter-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  font-weight: 500;
  margin-bottom: 5px;
  color: #333;
}

.filter-group select,
.filter-group input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.filter-group select:focus,
.filter-group input:focus {
  border-color: #667eea;
  box-shadow: 0 0 5px rgba(102, 126, 234, 0.3);
  outline: none;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-clear,
.btn-generate {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-clear {
  background: #95a5a6;
  color: white;
}

.btn-clear:hover:not(:disabled) {
  background: #7f8c8d;
}

.btn-generate {
  background: #667eea;
  color: white;
}

.btn-generate:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-1px);
}

.btn-clear:disabled,
.btn-generate:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.stats-section {
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.2em;
}

.stat-info h3 {
  margin: 0;
  font-size: 1.5em;
  color: #333;
}

.stat-info p {
  margin: 0;
  color: #666;
  font-size: 0.9em;
}

.results-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.results-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #333;
}

.export-buttons {
  display: flex;
  gap: 8px;
}

.btn-export {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85em;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-export.csv {
  background: #28a745;
  color: white;
}

.btn-export.excel {
  background: #17a2b8;
  color: white;
}

.btn-export.pdf {
  background: #dc3545;
  color: white;
}

.btn-export:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f8f9fa;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #dee2e6;
  cursor: pointer;
  user-select: none;
  transition: background 0.3s;
  position: relative;
}

.data-table th:hover {
  background: #e9ecef;
}

.data-table th i {
  margin-left: 5px;
  opacity: 0.6;
}

.data-table td {
  padding: 12px;
  border-bottom: 1px solid #f1f3f4;
  vertical-align: middle;
}

.data-table tbody tr:hover {
  background: #f8f9fa;
}

.row-danger {
  background: #fee !important;
}

.row-warning {
  background: #fff3cd !important;
}

.cell-currency {
  text-align: right;
  font-weight: 500;
  color: #28a745;
}

.cell-number {
  text-align: center;
  font-weight: 500;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.page-btn:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.page-info {
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border-radius: 4px;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.empty-icon {
  margin-bottom: 20px;
}

.empty-icon i {
  color: #bdc3c7;
}

.empty-state h3 {
  margin: 0 0 10px 0;
  color: #7f8c8d;
  font-size: 1.3em;
}

.empty-state p {
  margin: 0;
  color: #95a5a6;
  font-size: 1em;
  line-height: 1.5;
}

/* Animações */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stats-section,
.results-section {
  animation: fadeIn 0.5s ease-out;
}

/* Loading states */
.btn-generate .fa-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsividade */
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .filter-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    justify-content: center;
  }
  
  .results-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .export-buttons {
    justify-content: center;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .data-table {
    min-width: 600px;
  }
  
  .pagination {
    flex-wrap: wrap;
    gap: 5px;
  }
  
  .page-info {
    order: -1;
    width: 100%;
    text-align: center;
    margin-bottom: 10px;
  }
}

@media (max-width: 480px) {
  .header-section {
    padding: 15px;
  }
  
  .header-info h2 {
    font-size: 1.4em;
  }
  
  .filter-section {
    padding: 15px;
  }
  
  .stat-card {
    padding: 15px;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1em;
  }
  
  .stat-info h3 {
    font-size: 1.2em;
  }
  
  .results-header {
    padding: 15px;
  }
  
  .data-table th,
  .data-table td {
    padding: 8px;
    font-size: 0.9em;
  }
  
  .btn-export {
    padding: 5px 8px;
    font-size: 0.8em;
  }
}

/* Estados específicos */
.filter-group select:invalid {
  color: #6c757d;
}

.filter-group select option:first-child {
  color: #6c757d;
}

.filter-group select option:not(:first-child) {
  color: #333;
}

/* Melhorias visuais */
.data-table th:first-child {
  border-top-left-radius: 4px;
}

.data-table th:last-child {
  border-top-right-radius: 4px;
}

.table-container::-webkit-scrollbar {
  height: 6px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.table-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Transições suaves */
.filter-section,
.stats-section,
.results-section,
.empty-state {
  transition: all 0.3s ease;
}

/* Estados de hover melhorados */
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.btn-export:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* Indicadores visuais */
.filter-group select:focus,
.filter-group input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

/* Acessibilidade */
.btn-clear:focus,
.btn-generate:focus,
.btn-export:focus,
.page-btn:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* Print styles */
@media print {
  .header-section,
  .filter-section,
  .export-buttons,
  .pagination {
    display: none;
  }
  
  .results-section {
    box-shadow: none;
    border: 1px solid #000;
  }
  
  .data-table th,
  .data-table td {
    border: 1px solid #000;
  }
}
</style>