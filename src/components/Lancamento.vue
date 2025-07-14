<template>
  <div class="section-content">
    <!-- Loading indicator -->
    <div v-if="loading" class="loading-container">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Carregando reparos...</span>
    </div>

    <div v-else>
      <div class="filter-row">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar reparo..."
            v-model="localFiltro"
            @input="updateFiltro"
          />
        </div>
        <button class="btn-success" @click="editarReparo(null)">
          <i class="fas fa-plus"></i> Novo Reparo
        </button>
      </div>

      <!-- Filtros adicionais -->
      <div class="filters-row">
        <div class="filter-group">
          <label for="filtroSituacao">Situação:</label>
          <select id="filtroSituacao" v-model="filtroSituacao">
            <option value="">Todas</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Finalizado">Finalizado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="filtroResponsavel">Responsável:</label>
          <select id="filtroResponsavel" v-model="filtroResponsavel">
            <option value="">Todos</option>
            <option v-for="responsavel in responsaveis" :key="responsavel" :value="responsavel">
              {{ responsavel }}
            </option>
          </select>
        </div>
      </div>

      <div class="table-container" v-if="reparosFiltrados.length > 0">
        <table class="data-table">
          <thead>
            <tr>
              <th>OS</th>
              <th>Cliente</th>
              <th>Equipamento</th>
              <th>Data Início</th>
              <th>Data Fim</th>
              <th>Responsável</th>
              <th>Situação</th>
              <th>Valor Final</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(reparo, idx) in reparosFiltrados" :key="reparo.id || idx" :class="getRowClass(reparo)">
              <td>
                <span class="os-badge">{{ reparo.ordem_servico }}</span>
              </td>
              <td>{{ reparo.nome_cliente || reparo.cliente }}</td>
              <td>
                <div class="equipamento-info">
                  <strong>{{ reparo.nome_equipamento || reparo.equipamento }}</strong>
                  <small v-if="reparo.modelo">{{ reparo.modelo }}</small>
                </div>
              </td>
              <td>{{ formatarData(reparo.data_hora_inicio || reparo.data_reparo) }}</td>
              <td>{{ formatarData(reparo.data_hora_fim) }}</td>
              <td>{{ reparo.responsavel || '-' }}</td>
              <td>
                <span class="status-badge" :class="getSituacaoClass(reparo.situacao || reparo.status)">
                  {{ reparo.situacao || reparo.status }}
                </span>
              </td>
              <td class="valor">{{ formatCurrency(reparo.valor_final) }}</td>
              <td class="actions">
                <button 
                  class="action-btn view" 
                  @click="visualizarReparo(reparo)" 
                  title="Visualizar Detalhes"
                >
                  <i class="fas fa-eye"></i>
                </button>
                <button 
                  class="action-btn edit" 
                  @click="editarReparo(idx)" 
                  title="Editar"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  class="action-btn delete" 
                  @click="excluirReparo(idx)" 
                  title="Excluir"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="!loading" class="empty-state">
        <i class="fas fa-tools fa-3x"></i>
        <h3>Nenhum reparo encontrado</h3>
        <p>{{ localFiltro ? 'Nenhum reparo encontrado para sua busca.' : 'Cadastre o primeiro reparo clicando em "Novo Reparo".' }}</p>
      </div>

      <!-- Formulário de Cadastro/Edição -->
      <transition name="fade">
        <div v-if="showCadastroReparo" class="cadastro-bloco">
          <h3>{{ editingIndex === null ? 'Novo Reparo' : 'Editar Reparo' }}</h3>
          <form @submit.prevent="salvarReparo">
            <div class="form-group">
              <label for="ordem_servico">Número da OS *</label>
              <input 
                type="text" 
                id="ordem_servico" 
                v-model="formReparo.ordem_servico" 
                required 
                placeholder="Ex: OS-001"
              />
            </div>
            
            <div class="form-group">
              <label for="data_hora_inicio">Data e Hora de Início *</label>
              <input 
                type="datetime-local" 
                id="data_hora_inicio" 
                v-model="formReparo.data_hora_inicio" 
                required 
              />
            </div>
            
            <div class="form-group">
              <label for="nome_cliente">Nome do Cliente *</label>
              <input 
                type="text" 
                id="nome_cliente" 
                v-model="formReparo.nome_cliente" 
                required 
                placeholder="Digite o nome do cliente"
              />
            </div>
            
            <div class="form-group">
              <label for="nome_equipamento">Nome do Equipamento *</label>
              <input 
                type="text" 
                id="nome_equipamento" 
                v-model="formReparo.nome_equipamento" 
                required 
                placeholder="Ex: Geladeira, Fogão..."
              />
            </div>
            
            <div class="form-group">
              <label for="modelo">Modelo</label>
              <input 
                type="text" 
                id="modelo" 
                v-model="formReparo.modelo" 
                placeholder="Modelo do equipamento"
              />
            </div>
            
            <div class="form-group">
              <label for="fabricante">Fabricante</label>
              <input 
                type="text" 
                id="fabricante" 
                v-model="formReparo.fabricante" 
                placeholder="Fabricante do equipamento"
              />
            </div>
            
            <div class="form-group">
              <label for="pecas_utilizadas">Peças Utilizadas</label>
              <textarea 
                id="pecas_utilizadas" 
                v-model="formReparo.pecas_utilizadas" 
                placeholder="Ex: Placa Mãe, Fonte, Resistência..."
                rows="3"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label for="quantidade">Quantidade de Peças</label>
              <input 
                type="number" 
                id="quantidade" 
                v-model.number="formReparo.quantidade" 
                min="0" 
                placeholder="0"
              />
            </div>
            
            <div class="form-group">
              <label for="valor_final">Valor Final (R$)</label>
              <input 
                type="number" 
                id="valor_final" 
                v-model.number="formReparo.valor_final" 
                min="0" 
                step="0.01" 
                placeholder="0.00"
              />
            </div>
            
            <div class="form-group">
              <label for="responsavel">Responsável *</label>
              <input 
                type="text" 
                id="responsavel" 
                v-model="formReparo.responsavel" 
                required 
                placeholder="Nome do técnico responsável"
              />
            </div>
            
            <div class="form-group">
              <label for="data_hora_fim">Data e Hora de Término</label>
              <input 
                type="datetime-local" 
                id="data_hora_fim" 
                v-model="formReparo.data_hora_fim"
              />
            </div>
            
            <div class="form-group">
              <label for="situacao">Situação Atual *</label>
              <select id="situacao" v-model="formReparo.situacao" required>
                <option value="">Selecione a situação</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Finalizado">Finalizado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <div class="form-actions">
              <button type="button" @click="cancelarFormulario" class="btn-cancel">
                Cancelar
              </button>
              <button type="submit" :disabled="!isFormValid" class="btn-save">
                {{ editingIndex === null ? 'Salvar Reparo' : 'Atualizar Reparo' }}
              </button>
            </div>
          </form>
        </div>
      </transition>

      <!-- Modal de Visualização -->
      <transition name="fade">
        <div v-if="showVisualizacaoModal" class="modal-overlay" @click="fecharVisualizacaoModal">
          <div class="modal-content view-modal" @click.stop>
            <div class="modal-header">
              <h3>Detalhes do Reparo - {{ reparoVisualizacao?.ordem_servico }}</h3>
              <button class="close-btn" @click="fecharVisualizacaoModal">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <div class="reparo-details" v-if="reparoVisualizacao">
                <div class="detail-section">
                  <h4>Informações Gerais</h4>
                  <div class="detail-row">
                    <span class="label">OS:</span>
                    <span class="value">{{ reparoVisualizacao.ordem_servico }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Situação:</span>
                    <span class="value">
                      <span class="status-badge" :class="getSituacaoClass(reparoVisualizacao.situacao)">
                        {{ reparoVisualizacao.situacao }}
                      </span>
                    </span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Responsável:</span>
                    <span class="value">{{ reparoVisualizacao.responsavel }}</span>
                  </div>
                </div>

                <div class="detail-section">
                  <h4>Cliente e Equipamento</h4>
                  <div class="detail-row">
                    <span class="label">Cliente:</span>
                    <span class="value">{{ reparoVisualizacao.nome_cliente }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Equipamento:</span>
                    <span class="value">{{ reparoVisualizacao.nome_equipamento }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Modelo:</span>
                    <span class="value">{{ reparoVisualizacao.modelo || '-' }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Fabricante:</span>
                    <span class="value">{{ reparoVisualizacao.fabricante || '-' }}</span>
                  </div>
                </div>

                <div class="detail-section">
                  <h4>Cronograma</h4>
                  <div class="detail-row">
                    <span class="label">Data/Hora Início:</span>
                    <span class="value">{{ formatarDataHora(reparoVisualizacao.data_hora_inicio) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Data/Hora Fim:</span>
                    <span class="value">{{ formatarDataHora(reparoVisualizacao.data_hora_fim) || 'Não informado' }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Duração:</span>
                    <span class="value">{{ calcularDuracao(reparoVisualizacao.data_hora_inicio, reparoVisualizacao.data_hora_fim) }}</span>
                  </div>
                </div>

                <div class="detail-section">
                  <h4>Peças e Valores</h4>
                  <div class="detail-row">
                    <span class="label">Peças Utilizadas:</span>
                    <span class="value">{{ reparoVisualizacao.pecas_utilizadas || 'Nenhuma peça informada' }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Quantidade:</span>
                    <span class="value">{{ reparoVisualizacao.quantidade || 0 }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Valor Final:</span>
                    <span class="value valor-destaque">{{ formatCurrency(reparoVisualizacao.valor_final) }}</span>
                  </div>
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
  name: 'Reparos',
  props: {
    reparos: { 
      type: Array, 
      default: () => [] 
    },
    filtroReparo: { 
      type: String, 
      default: '' 
    },
    showCadastroReparo: { 
      type: Boolean, 
      default: false 
    },
    formReparo: { 
      type: Object, 
      required: true 
    },
    editingIndex: { 
      type: [Number, null], 
      default: null 
    },
    loading: { 
      type: Boolean, 
      default: false 
    },
  },
  emits: [
    'update:filtroReparo',
    'save-reparo',
    'edit-reparo',
    'delete-reparo',
    'cancel-reparo',
  ],
  data() {
    return {
      localFiltro: this.filtroReparo,
      filtroSituacao: '',
      filtroResponsavel: '',
      showVisualizacaoModal: false,
      reparoVisualizacao: null,
    };
  },
  watch: {
    filtroReparo(newVal) {
      this.localFiltro = newVal;
    },
  },
  computed: {
    reparosFiltrados() {
      let resultado = this.reparos;

      // Filtro por busca
      if (this.localFiltro) {
        const termo = this.localFiltro.toLowerCase();
        resultado = resultado.filter((reparo) => {
          const os = (reparo.ordem_servico || '').toLowerCase();
          const cliente = (reparo.nome_cliente || reparo.cliente || '').toLowerCase();
          const equipamento = (reparo.nome_equipamento || reparo.equipamento || '').toLowerCase();
          const situacao = (reparo.situacao || reparo.status || '').toLowerCase();
          
          return (
            os.includes(termo) ||
            cliente.includes(termo) ||
            equipamento.includes(termo) ||
            situacao.includes(termo)
          );
        });
      }

      // Filtro por situação
      if (this.filtroSituacao) {
        resultado = resultado.filter(reparo => 
          (reparo.situacao || reparo.status) === this.filtroSituacao
        );
      }

      // Filtro por responsável
      if (this.filtroResponsavel) {
        resultado = resultado.filter(reparo => 
          reparo.responsavel === this.filtroResponsavel
        );
      }

      return resultado;
    },

    responsaveis() {
      const resp = [...new Set(this.reparos.map(r => r.responsavel).filter(Boolean))];
      return resp.sort();
    },
    
    isFormValid() {
      return !!(
        this.formReparo.ordem_servico &&
        this.formReparo.data_hora_inicio &&
        this.formReparo.nome_cliente &&
        this.formReparo.nome_equipamento &&
        this.formReparo.responsavel &&
        this.formReparo.situacao
      );
    },
  },
  methods: {
    updateFiltro() {
      this.$emit('update:filtroReparo', this.localFiltro);
    },

    editarReparo(index) {
      this.$emit('edit-reparo', index);
    },

    excluirReparo(index) {
      this.$emit('delete-reparo', index);
    },

    salvarReparo() {
      if (this.isFormValid) {
        this.$emit('save-reparo');
      }
    },

    cancelarFormulario() {
      this.$emit('cancel-reparo');
    },

    visualizarReparo(reparo) {
      this.reparoVisualizacao = reparo;
      this.showVisualizacaoModal = true;
    },

    fecharVisualizacaoModal() {
      this.showVisualizacaoModal = false;
      this.reparoVisualizacao = null;
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }).format(value || 0);
    },

    formatarData(dataString) {
      if (!dataString) return '-';
      
      try {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
      } catch {
        return dataString;
      }
    },

    formatarDataHora(dataString) {
      if (!dataString) return '-';
      
      try {
        const data = new Date(dataString);
        return data.toLocaleString('pt-BR');
      } catch {
        return dataString;
      }
    },

    calcularDuracao(inicio, fim) {
      if (!inicio || !fim) return 'Em andamento';
      
      try {
        const dataInicio = new Date(inicio);
        const dataFim = new Date(fim);
        const diffMs = dataFim - dataInicio;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (diffDays > 0) {
          return `${diffDays} dia(s) e ${diffHours} hora(s)`;
        } else {
          return `${diffHours} hora(s)`;
        }
      } catch {
        return 'Não calculado';
      }
    },

    getRowClass(reparo) {
      const situacao = reparo.situacao || reparo.status;
      if (situacao === 'Cancelado') return 'row-danger';
      if (situacao === 'Em andamento') return 'row-warning';
      return '';
    },

    getSituacaoClass(situacao) {
      switch (situacao) {
        case 'Finalizado':
        case 'Concluído':
          return 'status-success';
        case 'Em andamento':
          return 'status-warning';
        case 'Cancelado':
          return 'status-danger';
        default:
          return 'status-info';
      }
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

.btn-success {
  background: #27ae60;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.3s;
}

.btn-success:hover {
  background: #229954;
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

.os-badge {
  background: #007bff;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.equipamento-info strong {
  display: block;
  margin-bottom: 2px;
}

.equipamento-info small {
  color: #666;
  font-style: italic;
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

.status-info {
  background: #d1ecf1;
  color: #0c5460;
}

.valor {
  font-weight: bold;
  color: #28a745;
}

.actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  padding: 6px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  color: white;
}

.view {
  background: #17a2b8;
}

.view:hover {
  background: #138496;
}

.edit {
  background: #ffc107;
  color: #212529;
}

.edit:hover {
  background: #e0a800;
}

.delete {
  background: #dc3545;
}

.delete:hover {
  background: #c82333;
}

.cadastro-bloco {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-top: 20px;
}

.cadastro-bloco h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.5em;
}

.cadastro-bloco form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 5px;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #3498db;
  box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
  outline: none;
}

.form-group textarea {
  resize: vertical;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
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
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
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

.reparo-details {
  display: grid;
  gap: 20px;
}

.detail-section {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 16px;
}

.detail-section h4 {
  margin: 0 0 12px 0;
  color: #495057;
  font-size: 1.1em;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 8px;
}

.detail-row {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f8f9fa;
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

.valor-destaque {
  font-weight: bold;
  color: #28a745;
  font-size: 1.1em;
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
  
  .cadastro-bloco form {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
    margin: 10px;
  }
  
  .detail-row {
    grid-template-columns: 1fr;
    gap: 5px;
  }
  
  .actions {
    flex-direction: column;
    gap: 4px;
  }
}
</style>