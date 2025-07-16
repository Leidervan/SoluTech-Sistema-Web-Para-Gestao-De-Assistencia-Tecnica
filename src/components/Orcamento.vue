<template>
  <div class="section-content">
    <!-- Loading indicator -->
    <div v-if="loading" class="loading-container">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Carregando orçamentos...</span>
    </div>

    <div v-else>
      <!-- Barra de busca e ações -->
      <div class="filter-row">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar orçamento..."
            v-model="localFiltro"
            @input="updateFiltro"
          />
        </div>
        <div class="filter-group">
          <select v-model="filtroStatus">
            <option value="">Todos os status</option>
            <option value="Pendente">Pendente</option>
            <option value="Aprovado">Aprovado</option>
            <option value="Rejeitado">Rejeitado</option>
            <option value="Vencido">Vencido</option>
          </select>
        </div>
        <button class="btn-success" @click="editarOrcamento(null)">
          <i class="fas fa-plus"></i> Novo Orçamento
        </button>
      </div>

      <!-- Lista de orçamentos -->
      <div class="table-container" v-if="orcamentosFiltrados.length > 0">
        <table class="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Documento</th>
              <th>Equipamento</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(orcamento, idx) in orcamentosFiltrados" :key="orcamento.id || idx" :class="getRowClass(orcamento)">
              <td>
                <div class="cliente-info">
                  <strong>{{ orcamento.cliente || orcamento.nomeCliente }}</strong>
                  <small v-if="orcamento.telefone">{{ orcamento.telefone }}</small>
                </div>
              </td>
              <td>{{ formatarDocumento(orcamento.documento || orcamento.cpf) }}</td>
              <td>{{ orcamento.nome_equipamento || orcamento.nomeEquipamento || '-' }}</td>
              <td class="valor">
                <div class="valor-info">
                  <span class="valor-com-desconto">{{ formatCurrency(orcamento.valor_com_desconto || orcamento.valorComDesconto) }}</span>
                  <small v-if="temDesconto(orcamento)" class="valor-sem-desconto">
                    {{ formatCurrency(orcamento.valor_sem_desconto || orcamento.valorSemDesconto) }}
                  </small>
                </div>
              </td>
              <td>
                <span class="status-badge" :class="getStatusClass(orcamento.status)">
                  {{ orcamento.status }}
                </span>
              </td>
              <td>{{ formatarData(orcamento.data_emissao || orcamento.emissao) }}</td>
              <td class="actions">
                <button 
                  class="action-btn edit" 
                  @click="editarOrcamento(idx)" 
                  title="Editar"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  class="action-btn delete" 
                  @click="excluirOrcamento(idx)" 
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
        <i class="fas fa-file-invoice fa-3x"></i>
        <h3>Nenhum orçamento encontrado</h3>
        <p>{{ localFiltro ? 'Nenhum orçamento encontrado para sua busca.' : 'Cadastre o primeiro orçamento clicando em "Novo Orçamento".' }}</p>
      </div>

      <!-- Formulário de Cadastro/Edição -->
      <transition name="fade">
        <div v-if="showCadastroOrcamento" class="cadastro-bloco">
          <h3>
            <i class="fas fa-file-invoice"></i>
            {{ editingIndex === null ? 'Novo Orçamento' : 'Editar Orçamento' }}
          </h3>
          
          <form @submit.prevent="salvarOrcamento">
            <!-- Dados do Cliente -->
            <div class="section-title">
              <i class="fas fa-user"></i> Dados do Cliente
            </div>
            
            <div class="form-group">
              <label for="cliente">Nome do Cliente *</label>
              <input 
                type="text" 
                id="cliente" 
                v-model="formOrcamento.cliente" 
                required 
                placeholder="Nome completo do cliente"
              />
            </div>
            
            <div class="form-group">
              <label for="documento">CNPJ/CPF *</label>
              <input
                type="text"
                id="documento"
                v-model="formOrcamento.documento"
                @input="mascararDocumento"
                required
                placeholder="00.000.000/0000-00"
              />
            </div>
            
            <div class="form-group">
              <label for="telefone">Telefone</label>
              <input 
                type="text" 
                id="telefone" 
                v-model="formOrcamento.telefone" 
                placeholder="(11) 99999-0000"
                @input="mascararTelefone"
              />
            </div>

            <!-- Dados do Equipamento -->
            <div class="section-title">
              <i class="fas fa-cogs"></i> Equipamento
            </div>
            
            <div class="form-group">
              <label for="nome_equipamento">Tipo de Equipamento</label>
              <input 
                type="text" 
                id="nome_equipamento" 
                v-model="formOrcamento.nome_equipamento" 
                placeholder="Ex: Geladeira, Fogão, Ar Condicionado..."
                list="tipos-equipamento"
              />
              <datalist id="tipos-equipamento">
                <option value="Geladeira"></option>
                <option value="Fogão"></option>
                <option value="Ar Condicionado"></option>
                <option value="Máquina de Lavar"></option>
                <option value="Microondas"></option>
                <option value="Lava Louças"></option>
              </datalist>
            </div>
            
            <div class="form-group">
              <label for="fabricante">Fabricante</label>
              <input 
                type="text" 
                id="fabricante" 
                v-model="formOrcamento.fabricante" 
                placeholder="Ex: Brastemp, Electrolux..."
              />
            </div>
            
            <div class="form-group">
              <label for="modelo">Modelo</label>
              <input 
                type="text" 
                id="modelo" 
                v-model="formOrcamento.modelo" 
                placeholder="Modelo específico" 
              />
            </div>

            <!-- Itens do Orçamento -->
            <div class="section-title">
              <i class="fas fa-list"></i> Itens do Orçamento
              <button type="button" class="btn-add-item" @click="adicionarItem">
                <i class="fas fa-plus"></i> Adicionar Item
              </button>
            </div>

            <div class="itens-container">
              <div v-for="(item, idx) in formOrcamento.itens" :key="idx" class="item-row">
                <div class="item-fields">
                  <div class="form-group">
                    <label>Descrição *</label>
                    <input 
                      v-model="item.descricao" 
                      type="text" 
                      placeholder="Descreva o serviço ou peça"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label>Qtd *</label>
                    <input 
                      v-model.number="item.quantidade" 
                      type="number" 
                      min="1" 
                      @input="calcularTotais"
                      required
                      placeholder="1"
                    />
                  </div>
                  <div class="form-group">
                    <label>Valor Unit. (R$) *</label>
                    <input 
                      v-model="item.valorUnitarioFormatado" 
                      type="text" 
                      @input="formatarValorUnitario(item)"
                      required
                      placeholder="0,00"
                    />
                  </div>
                  <div class="form-group">
                    <label>Total</label>
                    <div class="valor-total-display">
                      {{ formatCurrency(item.quantidade * (item.valorUnitario || 0)) }}
                    </div>
                  </div>
                  <div class="form-group">
                    <label>&nbsp;</label>
                    <button 
                      type="button" 
                      class="btn-remove-item"
                      @click="removerItem(idx)"
                      :disabled="formOrcamento.itens.length === 1"
                      title="Remover item"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Totais -->
            <div class="totais-container">
              <div class="totais-row">
                <span>Subtotal:</span>
                <span class="valor">{{ formatCurrency(subtotal) }}</span>
              </div>
              
              <div class="totais-row">
                <div class="desconto-field">
                  <label for="desconto">Desconto (%):</label>
                  <input 
                    id="desconto"
                    v-model.number="formOrcamento.desconto" 
                    type="number" 
                    min="0" 
                    max="100"
                    step="0.01"
                    @input="calcularTotais"
                    placeholder="0"
                    class="desconto-input"
                  />
                </div>
              </div>
              
              <div class="totais-row total-final">
                <span><strong>TOTAL FINAL:</strong></span>
                <span class="valor final"><strong>{{ formatCurrency(totalFinal) }}</strong></span>
              </div>
            </div>

            <!-- Informações Comerciais -->
            <div class="section-title">
              <i class="fas fa-handshake"></i> Informações Comerciais
            </div>
            
            <div class="form-group">
              <label for="forma_pagamento">Forma de Pagamento</label>
              <select id="forma_pagamento" v-model="formOrcamento.forma_pagamento">
                <option value="">Selecione</option>
                <option value="À vista">À vista</option>
                <option value="PIX">PIX</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cartão de débito">Cartão de débito</option>
                <option value="Cartão de crédito">Cartão de crédito</option>
                <option value="Boleto bancário">Boleto bancário</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="prazo_entrega">Prazo de Execução</label>
              <select id="prazo_entrega" v-model="formOrcamento.prazo_entrega">
                <option value="">Selecione</option>
                <option value="Imediato">Imediato</option>
                <option value="24 horas">24 horas</option>
                <option value="2 dias úteis">2 dias úteis</option>
                <option value="5 dias úteis">5 dias úteis</option>
                <option value="7 dias úteis">7 dias úteis</option>
                <option value="10 dias úteis">10 dias úteis</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="status">Status do Orçamento</label>
              <select id="status" v-model="formOrcamento.status">
                <option value="Pendente">Pendente</option>
                <option value="Aprovado">Aprovado</option>
                <option value="Rejeitado">Rejeitado</option>
                <option value="Vencido">Vencido</option>
              </select>
            </div>
            
            <div class="form-group full-width">
              <label for="observacao">Observações</label>
              <textarea 
                id="observacao" 
                v-model="formOrcamento.observacao" 
                rows="3"
                placeholder="Observações adicionais, condições de pagamento, garantias, etc..."
              ></textarea>
            </div>

            <!-- Botões de ação -->
            <div class="form-actions">
              <button type="button" @click="cancelarFormulario" class="btn-cancel">
                Cancelar
              </button>
              <button type="submit" :disabled="!isFormValid" class="btn-save">
                {{ editingIndex === null ? 'Salvar Orçamento' : 'Atualizar Orçamento' }}
              </button>
            </div>
          </form>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Orcamentos',
  props: {
    orcamentos: { 
      type: Array, 
      default: () => [] 
    },
    filtroOrcamento: { 
      type: String, 
      default: '' 
    },
    showCadastroOrcamento: { 
      type: Boolean, 
      default: false 
    },
    formOrcamento: { 
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
    'update:filtroOrcamento',
    'save-orcamento',
    'edit-orcamento',
    'delete-orcamento',
    'cancel-orcamento',
  ],
  data() {
    return {
      localFiltro: this.filtroOrcamento,
      filtroStatus: '',
    };
  },
  watch: {
    filtroOrcamento(newVal) {
      this.localFiltro = newVal;
    },
  },
  computed: {
    orcamentosFiltrados() {
      let resultado = this.orcamentos;

      // Filtro por busca
      if (this.localFiltro) {
        const termo = this.localFiltro.toLowerCase();
        resultado = resultado.filter((orcamento) => {
          const cliente = (orcamento.cliente || orcamento.nomeCliente || '').toLowerCase();
          const documento = (orcamento.documento || orcamento.cpf || '').toLowerCase();
          const equipamento = (orcamento.nome_equipamento || orcamento.nomeEquipamento || '').toLowerCase();
          
          return (
            cliente.includes(termo) ||
            documento.includes(termo) ||
            equipamento.includes(termo)
          );
        });
      }

      // Filtro por status
      if (this.filtroStatus) {
        resultado = resultado.filter(orcamento => 
          orcamento.status === this.filtroStatus
        );
      }

      return resultado;
    },

    subtotal() {
      return this.formOrcamento.itens.reduce((total, item) => {
        return total + (item.quantidade * (item.valorUnitario || 0));
      }, 0);
    },

    totalFinal() {
      const desconto = this.formOrcamento.desconto || 0;
      return this.subtotal * (1 - desconto / 100);
    },
    
    isFormValid() {
      return !!(
        this.formOrcamento.cliente &&
        this.formOrcamento.documento &&
        this.formOrcamento.itens.length > 0 &&
        this.formOrcamento.itens.every(item => 
          item.descricao && 
          item.quantidade > 0 && 
          (item.valorUnitario || 0) >= 0
        )
      );
    }
  },
  methods: {
    updateFiltro() {
      this.$emit('update:filtroOrcamento', this.localFiltro);
    },

    editarOrcamento(index) {
      this.$emit('edit-orcamento', index);
    },

    excluirOrcamento(index) {
      if (confirm('Tem certeza que deseja excluir este orçamento?')) {
        this.$emit('delete-orcamento', index);
      }
    },

    salvarOrcamento() {
      if (this.isFormValid) {
        // Atualizar valores antes de salvar
        this.formOrcamento.valor_sem_desconto = this.subtotal;
        this.formOrcamento.valor_com_desconto = this.totalFinal;
        this.formOrcamento.data_emissao = this.formOrcamento.data_emissao || new Date().toISOString().slice(0, 10);
        
        this.$emit('save-orcamento');
      }
    },

    cancelarFormulario() {
      this.$emit('cancel-orcamento');
    },

    adicionarItem() {
      this.formOrcamento.itens.push({
        descricao: '',
        quantidade: 1,
        valorUnitario: 0,
        valorUnitarioFormatado: '0,00'
      });
    },

    removerItem(index) {
      if (this.formOrcamento.itens.length > 1) {
        this.formOrcamento.itens.splice(index, 1);
        this.calcularTotais();
      }
    },

    formatarValorUnitario(item) {
      let valor = item.valorUnitarioFormatado.replace(/\D/g, '');
      valor = (parseFloat(valor) / 100).toFixed(2);
      item.valorUnitario = parseFloat(valor);
      item.valorUnitarioFormatado = valor.replace('.', ',');
      this.calcularTotais();
    },

    calcularTotais() {
      this.$forceUpdate();
    },

    // Máscaras e formatações
    mascararDocumento() {
      if (!this.formOrcamento.documento) return;
      
      let v = this.formOrcamento.documento.replace(/\D/g, '');
      
      if (v.length <= 11) {
        // CPF
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      } else {
        // CNPJ
        v = v.slice(0, 14);
        v = v.replace(/^(\d{2})(\d)/, '$1.$2');
        v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
        v = v.replace(/(\d{4})(\d)/, '$1-$2');
      }
      
      this.formOrcamento.documento = v;
    },

    mascararTelefone() {
      if (!this.formOrcamento.telefone) return;
      
      let v = this.formOrcamento.telefone.replace(/\D/g, '');
      v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
      v = v.replace(/(\d)(\d{4})$/, '$1-$2');
      this.formOrcamento.telefone = v;
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

    formatarDocumento(documento) {
      if (!documento) return '';
      
      const numericDoc = documento.replace(/\D/g, '');
      if (numericDoc.length === 11) {
        // CPF
        return numericDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      } else if (numericDoc.length === 14) {
        // CNPJ
        return numericDoc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
      }
      return documento;
    },

    temDesconto(orcamento) {
      const semDesconto = orcamento.valor_sem_desconto || orcamento.valorSemDesconto || 0;
      const comDesconto = orcamento.valor_com_desconto || orcamento.valorComDesconto || 0;
      return semDesconto > comDesconto;
    },

    getRowClass(orcamento) {
      if (orcamento.status === 'Vencido') return 'row-danger';
      if (orcamento.status === 'Rejeitado') return 'row-warning';
      return '';
    },

    getStatusClass(status) {
      switch (status) {
        case 'Aprovado':
          return 'status-success';
        case 'Pendente':
          return 'status-warning';
        case 'Rejeitado':
        case 'Vencido':
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

.empty-state h3 {
  margin-bottom: 10px;
  color: #7f8c8d;
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
  max-width: 300px;
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

.filter-group select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 150px;
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
  font-weight: 500;
}

.btn-success:hover {
  background: #229954;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
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

.cliente-info strong {
  display: block;
  margin-bottom: 2px;
}

.cliente-info small {
  color: #666;
  font-style: italic;
}

.valor-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.valor-com-desconto {
  font-weight: bold;
  color: #28a745;
}

.valor-sem-desconto {
  text-decoration: line-through;
  color: #6c757d;
  font-size: 0.9em;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  display: inline-block;
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

.edit {
  background: #3498db;
}

.edit:hover {
  background: #2980b9;
}

.delete {
  background: #e74c3c;
}

.delete:hover {
  background: #c0392b;
}

/* Formulário de Cadastro */
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
  display: flex;
  align-items: center;
  gap: 10px;
}

.cadastro-bloco form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.section-title {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.2em;
  font-weight: 600;
  color: #333;
  margin: 20px 0 10px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #3498db;
}

.section-title i {
  color: #3498db;
  margin-right: 8px;
}

.btn-add-item {
  background: #28a745;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  transition: background 0.3s;
}

.btn-add-item:hover {
  background: #218838;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
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
  font-family: inherit;
}

/* Seção de Itens */
.itens-container {
  grid-column: 1 / -1;
  margin-bottom: 20px;
}

.item-row {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 10px;
  border-left: 4px solid #3498db;
}

.item-fields {
  display: grid;
  grid-template-columns: 2fr 80px 120px 120px 60px;
  gap: 15px;
  align-items: end;
}

.valor-total-display {
  background: #e9ecef;
  padding: 8px 12px;
  border-radius: 4px;
  font-weight: bold;
  color: #28a745;
  text-align: right;
  border: 1px solid #ddd;
}

.btn-remove-item {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
  height: fit-content;
}

.btn-remove-item:hover:not(:disabled) {
  background: #c82333;
}

.btn-remove-item:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* Totais */
.totais-container {
  grid-column: 1 / -1;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 6px;
  border-left: 4px solid #28a745;
  margin: 20px 0;
}

.totais-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #dee2e6;
}

.totais-row:last-child {
  border-bottom: none;
}

.totais-row.total-final {
  border-top: 2px solid #28a745;
  padding-top: 15px;
  margin-top: 10px;
  font-size: 1.2em;
}

.desconto-field {
  display: flex;
  align-items: center;
  gap: 10px;
}

.desconto-input {
  width: 80px;
  text-align: center;
  padding: 6px 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.valor {
  font-weight: bold;
  color: #28a745;
}

.valor.final {
  color: #28a745;
  font-size: 1.3em;
}

/* Botões de ação */
.form-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #dee2e6;
}

.btn-cancel,
.btn-save {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
  font-weight: 500;
}

.btn-cancel {
  background: #95a5a6;
  color: white;
}

.btn-cancel:hover {
  background: #7f8c8d;
}

.btn-save {
  background: #3498db;
  color: white;
}

.btn-save:hover {
  background: #2980b9;
}

.btn-save:disabled {
  background-color: #bdc3c7 !important;
  cursor: not-allowed;
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
@media (max-width: 1024px) {
  .item-fields {
    grid-template-columns: 1fr 60px 80px 80px 50px;
    gap: 10px;
  }
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .search-box {
    max-width: none;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .cadastro-bloco form {
    grid-template-columns: 1fr;
  }
  
  .item-fields {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .totais-row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .desconto-field {
    justify-content: space-between;
  }
  
  .desconto-input {
    width: 100px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .actions {
    flex-direction: column;
    gap: 4px;
  }
  
  .data-table {
    min-width: 800px;
  }
}

@media (max-width: 480px) {
  .cadastro-bloco {
    padding: 16px;
    margin: 10px 0;
  }
  
  .section-title {
    font-size: 1.1em;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .btn-add-item {
    align-self: flex-start;
  }
  
  .item-row {
    padding: 12px;
  }
  
  .totais-container {
    padding: 15px;
  }
  
  .filter-row {
    gap: 8px;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .filter-group select {
    width: 100%;
    min-width: auto;
  }
}
</style>