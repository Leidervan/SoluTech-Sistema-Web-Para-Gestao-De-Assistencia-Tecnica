<template>
  <div class="section-content">
    <!-- Loading indicator -->
    <div v-if="loading" class="loading-container">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Carregando estoque...</span>
    </div>

    <div v-else>
      <div class="filter-row">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar peça no estoque..."
            v-model="localFiltro"
            @input="updateFiltro"
          />
        </div>
        <div class="stats-summary">
          <div class="stat-item">
            <span class="stat-label">Total de Itens:</span>
            <span class="stat-value">{{ pecas.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Estoque Total:</span>
            <span class="stat-value">{{ estoqueTotal }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Valor Total:</span>
            <span class="stat-value">{{ formatCurrency(valorTotal) }}</span>
          </div>
        </div>
      </div>

      <!-- Filtros por categoria e status -->
      <div class="filters-row">
        <div class="filter-group">
          <label for="filtroCategoria">Categoria:</label>
          <select id="filtroCategoria" v-model="filtroCategoria">
            <option value="">Todas as categorias</option>
            <option v-for="categoria in categorias" :key="categoria" :value="categoria">
              {{ categoria }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label for="filtroStatus">Status:</label>
          <select id="filtroStatus" v-model="filtroStatus">
            <option value="">Todos</option>
            <option value="disponivel">Disponível (> 0)</option>
            <option value="baixo">Estoque Baixo (≤ 5)</option>
            <option value="zerado">Estoque Zerado (0)</option>
          </select>
        </div>
      </div>

      <div class="table-container" v-if="estoqueFiltrado.length > 0">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nome da Peça</th>
              <th>Fabricante</th>
              <th>Categoria</th>
              <th>Quantidade</th>
              <th>Peso (kg)</th>
              <th>Valor Unitário</th>
              <th>Valor Total</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(peca, idx) in estoqueFiltrado" :key="peca.id || idx" :class="getRowClass(peca)">
              <td>
                <div class="peca-info">
                  <strong>{{ peca.peca || peca.nome }}</strong>
                  <small v-if="peca.observacao">{{ peca.observacao }}</small>
                </div>
              </td>
              <td>{{ peca.fabricante || '-' }}</td>
              <td>
                <span class="categoria-badge">{{ peca.categoria || 'Geral' }}</span>
              </td>
              <td>
                <span class="quantidade" :class="getQuantidadeClass(peca.quantidade)">
                  {{ peca.quantidade || 0 }}
                </span>
              </td>
              <td>{{ peca.peso || '-' }}</td>
              <td>{{ formatCurrency(peca.preco || peca.valor_unitario || 0) }}</td>
              <td>{{ formatCurrency((peca.preco || peca.valor_unitario || 0) * (peca.quantidade || 0)) }}</td>
              <td>
                <span class="status-badge" :class="getStatusClass(peca.quantidade)">
                  {{ getStatusText(peca.quantidade) }}
                </span>
              </td>
              <td class="actions">
                <button 
                  class="action-btn adjust" 
                  @click="abrirAjusteEstoque(peca, idx)" 
                  title="Ajustar Estoque"
                >
                  <i class="fas fa-exchange-alt"></i>
                </button>
                <button 
                  class="action-btn view" 
                  @click="visualizarPeca(peca)" 
                  title="Visualizar Detalhes"
                >
                  <i class="fas fa-eye"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="!loading" class="empty-state">
        <i class="fas fa-boxes fa-3x"></i>
        <h3>Nenhuma peça em estoque</h3>
        <p>{{ localFiltro ? 'Nenhuma peça encontrada para sua busca.' : 'Não há peças cadastradas no estoque.' }}</p>
      </div>

      <!-- Modal de Ajuste de Estoque -->
      <transition name="fade">
        <div v-if="showAjusteModal" class="modal-overlay" @click="fecharAjusteModal">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>Ajustar Estoque - {{ pecaAjuste?.peca || pecaAjuste?.nome }}</h3>
              <button class="close-btn" @click="fecharAjusteModal">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <div class="current-stock">
                <span>Estoque Atual: <strong>{{ pecaAjuste?.quantidade || 0 }}</strong></span>
              </div>
              <div class="form-group">
                <label for="tipoAjuste">Tipo de Ajuste:</label>
                <select id="tipoAjuste" v-model="ajusteForm.tipo">
                  <option value="entrada">Entrada (+)</option>
                  <option value="saida">Saída (-)</option>
                  <option value="definir">Definir Quantidade</option>
                </select>
              </div>
              <div class="form-group">
                <label for="quantidadeAjuste">
                  {{ ajusteForm.tipo === 'definir' ? 'Nova Quantidade:' : 'Quantidade:' }}
                </label>
                <input 
                  type="number" 
                  id="quantidadeAjuste" 
                  v-model.number="ajusteForm.quantidade" 
                  min="0" 
                  required
                />
              </div>
              <div class="form-group">
                <label for="motivoAjuste">Motivo:</label>
                <textarea 
                  id="motivoAjuste" 
                  v-model="ajusteForm.motivo" 
                  placeholder="Descreva o motivo do ajuste..."
                  rows="3"
                ></textarea>
              </div>
              <div class="preview-resultado">
                <span>Quantidade Final: <strong>{{ quantidadeFinal }}</strong></span>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-cancel" @click="fecharAjusteModal">
                Cancelar
              </button>
              <button class="btn-save" @click="salvarAjuste" :disabled="!ajusteForm.quantidade">
                Confirmar Ajuste
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Modal de Visualização -->
      <transition name="fade">
        <div v-if="showVisualizacaoModal" class="modal-overlay" @click="fecharVisualizacaoModal">
          <div class="modal-content view-modal" @click.stop>
            <div class="modal-header">
              <h3>Detalhes da Peça</h3>
              <button class="close-btn" @click="fecharVisualizacaoModal">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <div class="peca-details" v-if="pecaVisualizacao">
                <div class="detail-row">
                  <span class="label">Nome:</span>
                  <span class="value">{{ pecaVisualizacao.peca || pecaVisualizacao.nome }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Fabricante:</span>
                  <span class="value">{{ pecaVisualizacao.fabricante || '-' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Local de Fabricação:</span>
                  <span class="value">{{ pecaVisualizacao.local_fabricacao || '-' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Peso:</span>
                  <span class="value">{{ pecaVisualizacao.peso || '-' }} kg</span>
                </div>
                <div class="detail-row">
                  <span class="label">Quantidade em Estoque:</span>
                  <span class="value">{{ pecaVisualizacao.quantidade || 0 }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Número de Série:</span>
                  <span class="value">{{ pecaVisualizacao.numero_serie || '-' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Código de Produção:</span>
                  <span class="value">{{ pecaVisualizacao.codigo_producao || '-' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Preço Unitário:</span>
                  <span class="value">{{ formatCurrency(pecaVisualizacao.preco || pecaVisualizacao.valor_unitario || 0) }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Valor Total:</span>
                  <span class="value">{{ formatCurrency((pecaVisualizacao.preco || pecaVisualizacao.valor_unitario || 0) * (pecaVisualizacao.quantidade || 0)) }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Observações:</span>
                  <span class="value">{{ pecaVisualizacao.observacao || 'Nenhuma observação' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Estoque',
  props: {
    pecas: { 
      type: Array, 
      default: () => [] 
    },
    loading: { 
      type: Boolean, 
      default: false 
    },
  },
  emits: [
    'update-peca-estoque',
  ],
  data() {
    return {
      localFiltro: '',
      filtroCategoria: '',
      filtroStatus: '',
      showAjusteModal: false,
      showVisualizacaoModal: false,
      pecaAjuste: null,
      pecaVisualizacao: null,
      ajusteForm: {
        tipo: 'entrada',
        quantidade: 0,
        motivo: '',
      },
    };
  },
  computed: {
    estoqueFiltrado() {
      let resultado = this.pecas;

      // Filtro por busca
      if (this.localFiltro) {
        const termo = this.localFiltro.toLowerCase();
        resultado = resultado.filter((peca) => {
          const nome = (peca.peca || peca.nome || '').toLowerCase();
          const fabricante = (peca.fabricante || '').toLowerCase();
          const categoria = (peca.categoria || '').toLowerCase();
          
          return (
            nome.includes(termo) ||
            fabricante.includes(termo) ||
            categoria.includes(termo)
          );
        });
      }

      // Filtro por categoria
      if (this.filtroCategoria) {
        resultado = resultado.filter(peca => 
          (peca.categoria || 'Geral') === this.filtroCategoria
        );
      }

      // Filtro por status
      if (this.filtroStatus) {
        resultado = resultado.filter(peca => {
          const quantidade = peca.quantidade || 0;
          switch (this.filtroStatus) {
            case 'disponivel':
              return quantidade > 0;
            case 'baixo':
              return quantidade <= 5 && quantidade > 0;
            case 'zerado':
              return quantidade === 0;
            default:
              return true;
          }
        });
      }

      return resultado;
    },

    categorias() {
      const cats = [...new Set(this.pecas.map(p => p.categoria || 'Geral'))];
      return cats.sort();
    },

    estoqueTotal() {
      return this.pecas.reduce((total, peca) => total + (peca.quantidade || 0), 0);
    },

    valorTotal() {
      return this.pecas.reduce((total, peca) => {
        const preco = peca.preco || peca.valor_unitario || 0;
        const quantidade = peca.quantidade || 0;
        return total + (preco * quantidade);
      }, 0);
    },

    quantidadeFinal() {
      if (!this.pecaAjuste) return 0;
      
      const atual = this.pecaAjuste.quantidade || 0;
      const ajuste = this.ajusteForm.quantidade || 0;
      
      switch (this.ajusteForm.tipo) {
        case 'entrada':
          return atual + ajuste;
        case 'saida':
          return Math.max(0, atual - ajuste);
        case 'definir':
          return ajuste;
        default:
          return atual;
      }
    },
  },
  methods: {
    updateFiltro() {
      // Método para compatibilidade se necessário
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }).format(value || 0);
    },

    getRowClass(peca) {
      const quantidade = peca.quantidade || 0;
      if (quantidade === 0) return 'row-danger';
      if (quantidade <= 5) return 'row-warning';
      return '';
    },

    getQuantidadeClass(quantidade) {
      if (!quantidade || quantidade === 0) return 'qty-danger';
      if (quantidade <= 5) return 'qty-warning';
      return 'qty-success';
    },

    getStatusClass(quantidade) {
      if (!quantidade || quantidade === 0) return 'status-danger';
      if (quantidade <= 5) return 'status-warning';
      return 'status-success';
    },

    getStatusText(quantidade) {
      if (!quantidade || quantidade === 0) return 'Esgotado';
      if (quantidade <= 5) return 'Baixo';
      return 'Disponível';
    },

    abrirAjusteEstoque(peca, index) {
      this.pecaAjuste = { ...peca, index };
      this.ajusteForm = {
        tipo: 'entrada',
        quantidade: 0,
        motivo: '',
      };
      this.showAjusteModal = true;
    },

    fecharAjusteModal() {
      this.showAjusteModal = false;
      this.pecaAjuste = null;
    },

    salvarAjuste() {
      if (!this.pecaAjuste || !this.ajusteForm.quantidade) return;

      const novaQuantidade = this.quantidadeFinal;
      
      // Emitir evento para atualizar a peça
      this.$emit('update-peca-estoque', {
        ...this.pecaAjuste,
        quantidade: novaQuantidade,
        historicoAjuste: {
          tipo: this.ajusteForm.tipo,
          quantidadeAnterior: this.pecaAjuste.quantidade || 0,
          quantidadeNova: novaQuantidade,
          motivo: this.ajusteForm.motivo,
          data: new Date().toISOString(),
        }
      });

      this.fecharAjusteModal();
    },

    visualizarPeca(peca) {
      this.pecaVisualizacao = peca;
      this.showVisualizacaoModal = true;
    },

    fecharVisualizacaoModal() {
      this.showVisualizacaoModal = false;
      this.pecaVisualizacao = null;
    },
  },
};
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #666;
}

.loading-container i {
  font-size: 2rem;
  margin-bottom: 10px;
  color: #3498db;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.empty-state i {
  color: #bdc3c7;
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.search-box input {
  width: 100%;
  padding: 10px 15px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.stats-summary {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  min-width: 100px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.filters-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-group label {
  font-size: 14px;
  color: #666;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 150px;
}

.table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
  font-size: 14px;
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

.peca-info strong {
  display: block;
  margin-bottom: 2px;
}

.peca-info small {
  color: #666;
  font-style: italic;
}

.categoria-badge {
  background: #e9ecef;
  color: #495057;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.quantidade {
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
}

.qty-success {
  background: #d4edda;
  color: #155724;
}

.qty-warning {
  background: #fff3cd;
  color: #856404;
}

.qty-danger {
  background: #f8d7da;
  color: #721c24;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-success {
  background: #d4edda;
  color: #155724;
}

.status-warning {
  background: #fff3cd;
  color: #856404;
}

.status-danger {
  background: #f8d7da;
  color: #721c24;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  color: white;
}

.adjust {
  background: #17a2b8;
}

.adjust:hover {
  background: #138496;
}

.view {
  background: #6c757d;
}

.view:hover {
  background: #545b62;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.view-modal {
  max-width: 600px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.current-stock {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
}

.preview-resultado {
  background: #e7f3ff;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  margin-top: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #dee2e6;
}

.btn-cancel,
.btn-save {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background: #545b62;
}

.btn-save {
  background: #28a745;
  color: white;
}

.btn-save:hover {
  background: #218838;
}

.btn-save:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.peca-details {
  display: grid;
  gap: 12px;
}

.detail-row {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f1f3f4;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .label {
  font-weight: 500;
  color: #666;
}

.detail-row .value {
  color: #333;
}

/* Animações */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsividade */
@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .stats-summary {
    justify-content: center;
  }
  
  .filters-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .filter-group select {
    min-width: auto;
    width: 100%;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .modal-content {
    width: 95%;
    margin: 10px;
  }
  
  .detail-row {
    grid-template-columns: 1fr;
    gap: 5px;
  }
}
</style>