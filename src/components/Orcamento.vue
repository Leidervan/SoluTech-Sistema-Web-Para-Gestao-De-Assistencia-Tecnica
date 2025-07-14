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
        <button class="btn-success" @click="editarOrcamento(null)">
          <i class="fas fa-plus"></i> Novo Orçamento
        </button>
      </div>

      <!-- Filtros adicionais -->
      <div class="filters-row">
        <div class="filter-group">
          <label for="filtroStatus">Status:</label>
          <select id="filtroStatus" v-model="filtroStatus">
            <option value="">Todos</option>
            <option value="Pendente">Pendente</option>
            <option value="Aprovado">Aprovado</option>
            <option value="Rejeitado">Rejeitado</option>
            <option value="Vencido">Vencido</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="filtroData">Período:</label>
          <select id="filtroData" v-model="filtroData">
            <option value="">Todos</option>
            <option value="hoje">Hoje</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mês</option>
          </select>
        </div>
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
                  class="action-btn view" 
                  @click="visualizarOrcamento(orcamento)" 
                  title="Visualizar"
                >
                  <i class="fas fa-eye"></i>
                </button>
                <button 
                  class="action-btn edit" 
                  @click="editarOrcamento(idx)" 
                  title="Editar"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  class="action-btn pdf" 
                  @click="gerarPDF(orcamento)" 
                  title="Gerar PDF"
                >
                  <i class="fas fa-file-pdf"></i>
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
        <div v-if="showCadastroOrcamento" class="orcamento-form-container">
          <div class="form-header">
            <h2>{{ editingIndex === null ? 'Novo Orçamento' : 'Editar Orçamento' }}</h2>
          </div>

          <form @submit.prevent="salvarOrcamento">
            <!-- Dados do Cliente -->
            <div class="form-section">
              <h3>Dados do Cliente</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label for="cliente">Cliente *</label>
                  <input 
                    id="cliente" 
                    v-model="formOrcamento.cliente" 
                    type="text" 
                    placeholder="Nome do cliente" 
                    required 
                  />
                </div>
                <div class="form-group">
                  <label for="documento">CNPJ ou CPF *</label>
                  <input
                    id="documento"
                    v-model="formOrcamento.documento"
                    @input="mascararDocumento"
                    type="text"
                    placeholder="00.000.000/0000-00 ou 000.000.000-00"
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="telefone">Telefone</label>
                  <input 
                    id="telefone" 
                    v-model="formOrcamento.telefone" 
                    type="text" 
                    placeholder="(11) 99999-0000" 
                  />
                </div>
                <div class="form-group">
                  <label for="email">E-mail</label>
                  <input 
                    id="email" 
                    v-model="formOrcamento.email" 
                    type="email" 
                    placeholder="cliente@email.com" 
                  />
                </div>
              </div>

              <!-- Endereço -->
              <div class="form-group full-width">
                <label>Endereço Completo</label>
                <div class="address-grid">
                  <input v-model="formOrcamento.rua" type="text" placeholder="Rua" />
                  <input v-model="formOrcamento.bairro" type="text" placeholder="Bairro" />
                  <input v-model="formOrcamento.cidade" type="text" placeholder="Cidade" />
                  <select v-model="formOrcamento.estado">
                    <option value="">Estado</option>
                    <option v-for="uf in estados" :key="uf" :value="uf">{{ uf }}</option>
                  </select>
                  <input v-model="formOrcamento.cep" type="text" placeholder="CEP" />
                </div>
              </div>
            </div>

            <!-- Dados do Equipamento -->
            <div class="form-section">
              <h3>Equipamento</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label for="nome_equipamento">Nome do Equipamento</label>
                  <input 
                    id="nome_equipamento" 
                    v-model="formOrcamento.nome_equipamento" 
                    type="text" 
                    placeholder="Ex: Geladeira, Fogão..." 
                  />
                </div>
                <div class="form-group">
                  <label for="modelo">Modelo</label>
                  <input 
                    id="modelo" 
                    v-model="formOrcamento.modelo" 
                    type="text" 
                    placeholder="Modelo do equipamento" 
                  />
                </div>
                <div class="form-group">
                  <label for="fabricante">Fabricante</label>
                  <input 
                    id="fabricante" 
                    v-model="formOrcamento.fabricante" 
                    type="text" 
                    placeholder="Fabricante" 
                  />
                </div>
                <div class="form-group">
                  <label for="ano_fabricacao">Ano de Fabricação</label>
                  <input 
                    id="ano_fabricacao" 
                    v-model.number="formOrcamento.ano_fabricacao" 
                    type="number" 
                    :min="1990"
                    :max="new Date().getFullYear()"
                  />
                </div>
              </div>
            </div>

            <!-- Itens do Orçamento -->
            <div class="form-section">
              <h3>Itens do Orçamento</h3>
              <div class="itens-table">
                <table>
                  <thead>
                    <tr>
                      <th>Descrição do Serviço/Peça</th>
                      <th>Quantidade</th>
                      <th>Valor Unitário</th>
                      <th>Valor Total</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, idx) in formOrcamento.itens" :key="idx">
                      <td>
                        <input 
                          v-model="item.descricao" 
                          type="text" 
                          placeholder="Descrição do item"
                          required
                        />
                      </td>
                      <td>
                        <input 
                          v-model.number="item.quantidade" 
                          type="number" 
                          min="1" 
                          @input="calcularTotais"
                          required
                        />
                      </td>
                      <td>
                        <input 
                          v-model.number="item.valorUnitario" 
                          type="number" 
                          step="0.01" 
                          min="0"
                          @input="calcularTotais"
                          required
                        />
                      </td>
                      <td class="valor-total">
                        {{ formatCurrency(item.quantidade * item.valorUnitario) }}
                      </td>
                      <td>
                        <button 
                          type="button" 
                          class="btn-remove" 
                          @click="removerItem(idx)"
                          :disabled="formOrcamento.itens.length === 1"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                
                <div class="itens-actions">
                  <button type="button" class="btn-add-item" @click="adicionarItem">
                    <i class="fas fa-plus"></i> Adicionar Item
                  </button>
                </div>

                <div class="totais-container">
                  <div class="total-row">
                    <span>Subtotal:</span>
                    <strong>{{ formatCurrency(subtotal) }}</strong>
                  </div>
                  <div class="total-row desconto-row">
                    <label for="desconto">Desconto (%):</label>
                    <input 
                      id="desconto"
                      v-model.number="formOrcamento.desconto" 
                      type="number" 
                      min="0" 
                      max="100"
                      step="0.01"
                      @input="calcularTotais"
                    />
                  </div>
                  <div class="total-row total-final">
                    <span>Total Final:</span>
                    <strong>{{ formatCurrency(totalFinal) }}</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- Informações Adicionais -->
            <div class="form-section">
              <h3>Informações Adicionais</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label for="forma_pagamento">Forma de Pagamento</label>
                  <select id="forma_pagamento" v-model="formOrcamento.forma_pagamento">
                    <option value="">Selecione</option>
                    <option value="À vista">À vista</option>
                    <option value="Cartão de crédito">Cartão de crédito</option>
                    <option value="Cartão de débito">Cartão de débito</option>
                    <option value="PIX">PIX</option>
                    <option value="Boleto bancário">Boleto bancário</option>
                    <option value="Transferência bancária">Transferência bancária</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="prazo_entrega">Prazo de Entrega</label>
                  <input 
                    id="prazo_entrega" 
                    v-model="formOrcamento.prazo_entrega" 
                    type="text" 
                    placeholder="Ex: 7 dias úteis" 
                  />
                </div>
                <div class="form-group">
                  <label for="validade">Validade da Proposta</label>
                  <input 
                    id="validade" 
                    v-model="formOrcamento.validade" 
                    type="date" 
                  />
                </div>
                <div class="form-group">
                  <label for="status">Status</label>
                  <select id="status" v-model="formOrcamento.status">
                    <option value="Pendente">Pendente</option>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Rejeitado">Rejeitado</option>
                    <option value="Vencido">Vencido</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group full-width">
                <label for="observacao">Observações</label>
                <textarea 
                  id="observacao" 
                  v-model="formOrcamento.observacao" 
                  rows="4"
                  placeholder="Observações adicionais sobre o orçamento..."
                ></textarea>
              </div>
            </div>

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

      <!-- Modal de Visualização -->
      <transition name="fade">
        <div v-if="showVisualizacaoModal" class="modal-overlay" @click="fecharVisualizacaoModal">
          <div class="modal-content orcamento-preview" @click.stop>
            <div class="modal-header">
              <h3>Orçamento - {{ orcamentoVisualizacao?.cliente }}</h3>
              <button class="close-btn" @click="fecharVisualizacaoModal">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <div class="orcamento-details" v-if="orcamentoVisualizacao">
                <!-- Cabeçalho do orçamento -->
                <div class="orcamento-header">
                  <div class="empresa-info">
                    <h2>Sua Empresa</h2>
                    <p>Endereço da empresa</p>
                    <p>Telefone: (11) 99999-0000</p>
                  </div>
                  <div class="orcamento-info">
                    <h3>ORÇAMENTO</h3>
                    <p><strong>Data:</strong> {{ formatarData(orcamentoVisualizacao.data_emissao) }}</p>
                    <p><strong>Validade:</strong> {{ formatarData(orcamentoVisualizacao.validade) }}</p>
                  </div>
                </div>

                <!-- Dados do cliente -->
                <div class="cliente-section">
                  <h4>Cliente</h4>
                  <div class="cliente-dados">
                    <p><strong>Nome:</strong> {{ orcamentoVisualizacao.cliente }}</p>
                    <p><strong>Documento:</strong> {{ formatarDocumento(orcamentoVisualizacao.documento) }}</p>
                    <p v-if="orcamentoVisualizacao.telefone"><strong>Telefone:</strong> {{ orcamentoVisualizacao.telefone }}</p>
                    <p v-if="orcamentoVisualizacao.email"><strong>E-mail:</strong> {{ orcamentoVisualizacao.email }}</p>
                    <p v-if="orcamentoVisualizacao.rua">
                      <strong>Endereço:</strong> 
                      {{ orcamentoVisualizacao.rua }}, {{ orcamentoVisualizacao.bairro }}, 
                      {{ orcamentoVisualizacao.cidade }} - {{ orcamentoVisualizacao.estado }}, 
                      {{ orcamentoVisualizacao.cep }}
                    </p>
                  </div>
                </div>

                <!-- Equipamento -->
                <div class="equipamento-section" v-if="orcamentoVisualizacao.nome_equipamento">
                  <h4>Equipamento</h4>
                  <div class="equipamento-dados">
                    <p><strong>Tipo:</strong> {{ orcamentoVisualizacao.nome_equipamento }}</p>
                    <p v-if="orcamentoVisualizacao.modelo"><strong>Modelo:</strong> {{ orcamentoVisualizacao.modelo }}</p>
                    <p v-if="orcamentoVisualizacao.fabricante"><strong>Fabricante:</strong> {{ orcamentoVisualizacao.fabricante }}</p>
                    <p v-if="orcamentoVisualizacao.ano_fabricacao"><strong>Ano:</strong> {{ orcamentoVisualizacao.ano_fabricacao }}</p>
                  </div>
                </div>

                <!-- Itens -->
                <div class="itens-section">
                  <h4>Itens</h4>
                  <table class="itens-preview-table">
                    <thead>
                      <tr>
                        <th>Descrição</th>
                        <th>Qtd</th>
                        <th>Valor Unit.</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, idx) in orcamentoVisualizacao.itens" :key="idx">
                        <td>{{ item.descricao }}</td>
                        <td>{{ item.quantidade }}</td>
                        <td>{{ formatCurrency(item.valorUnitario) }}</td>
                        <td>{{ formatCurrency(item.quantidade * item.valorUnitario) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Totais -->
                <div class="totais-section">
                  <div class="total-line">
                    <span>Subtotal:</span>
                    <span>{{ formatCurrency(orcamentoVisualizacao.valor_sem_desconto) }}</span>
                  </div>
                  <div class="total-line" v-if="orcamentoVisualizacao.desconto > 0">
                    <span>Desconto ({{ orcamentoVisualizacao.desconto }}%):</span>
                    <span>-{{ formatCurrency(orcamentoVisualizacao.valor_sem_desconto - orcamentoVisualizacao.valor_com_desconto) }}</span>
                  </div>
                  <div class="total-line total-final">
                    <span><strong>Total:</strong></span>
                    <span><strong>{{ formatCurrency(orcamentoVisualizacao.valor_com_desconto) }}</strong></span>
                  </div>
                </div>

                <!-- Informações adicionais -->
                <div class="info-adicional">
                  <p v-if="orcamentoVisualizacao.forma_pagamento"><strong>Forma de Pagamento:</strong> {{ orcamentoVisualizacao.forma_pagamento }}</p>
                  <p v-if="orcamentoVisualizacao.prazo_entrega"><strong>Prazo de Entrega:</strong> {{ orcamentoVisualizacao.prazo_entrega }}</p>
                  <p v-if="orcamentoVisualizacao.observacao"><strong>Observações:</strong> {{ orcamentoVisualizacao.observacao }}</p>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" @click="gerarPDF(orcamentoVisualizacao)">
                <i class="fas fa-file-pdf"></i> Gerar PDF
              </button>
              <button class="btn-primary" @click="editarOrcamento(getOrcamentoIndex(orcamentoVisualizacao))">
                <i class="fas fa-edit"></i> Editar
              </button>
            </div>
          </div>
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
      filtroData: '',
      showVisualizacaoModal: false,
      orcamentoVisualizacao: null,
      estados: [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
        'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
        'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
      ],
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

      // Filtro por data
      if (this.filtroData) {
        const hoje = new Date();
        resultado = resultado.filter(orcamento => {
          const dataOrcamento = new Date(orcamento.data_emissao || orcamento.emissao);
          
          switch (this.filtroData) {
            case 'hoje':
              return dataOrcamento.toDateString() === hoje.toDateString();
            case 'semana':
              const inicioSemana = new Date(hoje);
              inicioSemana.setDate(hoje.getDate() - hoje.getDay());
              return dataOrcamento >= inicioSemana;
            case 'mes':
              return dataOrcamento.getMonth() === hoje.getMonth() && 
                     dataOrcamento.getFullYear() === hoje.getFullYear();
            default:
              return true;
          }
        });
      }

      return resultado;
    },

    subtotal() {
      return this.formOrcamento.itens.reduce((total, item) => {
        return total + (item.quantidade * item.valorUnitario);
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
        this.formOrcamento.itens.every(item => item.descricao && item.quantidade > 0 && item.valorUnitario >= 0)
      );
    },
  },
  methods: {
    updateFiltro() {
      this.$emit('update:filtroOrcamento', this.localFiltro);
    },

    editarOrcamento(index) {
      this.$emit('edit-orcamento', index);
    },

    excluirOrcamento(index) {
      this.$emit('delete-orcamento', index);
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
        valorUnitario: 0
      });
    },

    removerItem(index) {
      if (this.formOrcamento.itens.length > 1) {
        this.formOrcamento.itens.splice(index, 1);
        this.calcularTotais();
      }
    },

    calcularTotais() {
      // Os totais são calculados automaticamente via computed properties
      // Este método pode ser usado para forçar atualização se necessário
      this.$forceUpdate();
    },

    visualizarOrcamento(orcamento) {
      this.orcamentoVisualizacao = orcamento;
      this.showVisualizacaoModal = true;
    },

    fecharVisualizacaoModal() {
      this.showVisualizacaoModal = false;
      this.orcamentoVisualizacao = null;
    },

    getOrcamentoIndex(orcamento) {
      return this.orcamentos.findIndex(o => o.id === orcamento.id);
    },

    gerarPDF(orcamento) {
      // Implementar geração de PDF
      alert('Funcionalidade de PDF em desenvolvimento');
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

.pdf {
  background: #dc3545;
}

.pdf:hover {
  background: #c82333;
}

.delete {
  background: #6c757d;
}

.delete:hover {
  background: #545b62;
}

/* Formulário */
.orcamento-form-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.form-header {
  background: #007bff;
  color: white;
  padding: 20px;
  text-align: center;
}

.form-header h2 {
  margin: 0;
}

.form-section {
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h3 {
  margin: 0 0 15px 0;
  color: #495057;
  font-size: 1.2em;
  border-bottom: 2px solid #007bff;
  padding-bottom: 5px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
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
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
  outline: none;
}

.address-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 100px 120px;
  gap: 10px;
}

.itens-table table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.itens-table th,
.itens-table td {
  padding: 8px;
  border: 1px solid #dee2e6;
  text-align: left;
}

.itens-table th {
  background: #f8f9fa;
  font-weight: 600;
}

.itens-table input {
  width: 100%;
  border: none;
  padding: 4px;
  font-size: 14px;
}

.itens-table input:focus {
  outline: 1px solid #007bff;
}

.valor-total {
  text-align: right;
  font-weight: bold;
  color: #28a745;
}

.btn-remove {
  background: #dc3545;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-remove:hover {
  background: #c82333;
}

.btn-remove:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.itens-actions {
  margin-bottom: 20px;
}

.btn-add-item {
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.3s;
}

.btn-add-item:hover {
  background: #218838;
}

.totais-container {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #007bff;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.total-row:last-child {
  margin-bottom: 0;
}

.desconto-row input {
  width: 80px;
  text-align: right;
}

.total-final {
  font-size: 1.2em;
  border-top: 2px solid #007bff;
  padding-top: 8px;
  margin-top: 8px;
}

.form-actions {
  padding: 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  background: #f8f9fa;
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
  background: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background: #545b62;
}

.btn-save {
  background: #007bff;
  color: white;
}

.btn-save:hover {
  background: #0056b3;
}

.btn-save:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* Modal de visualização */
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
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.orcamento-preview {
  max-width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
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

.orcamento-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #007bff;
}

.empresa-info h2 {
  margin: 0 0 10px 0;
  color: #007bff;
}

.empresa-info p {
  margin: 2px 0;
  color: #666;
}

.orcamento-info {
  text-align: right;
}

.orcamento-info h3 {
  margin: 0 0 10px 0;
  color: #007bff;
  font-size: 1.5em;
}

.cliente-section,
.equipamento-section,
.itens-section {
  margin-bottom: 25px;
}

.cliente-section h4,
.equipamento-section h4,
.itens-section h4 {
  margin: 0 0 10px 0;
  color: #495057;
  font-size: 1.1em;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 5px;
}

.cliente-dados p,
.equipamento-dados p {
  margin: 5px 0;
}

.itens-preview-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.itens-preview-table th,
.itens-preview-table td {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  text-align: left;
}

.itens-preview-table th {
  background: #f8f9fa;
  font-weight: 600;
}

.itens-preview-table td:nth-child(2),
.itens-preview-table td:nth-child(3),
.itens-preview-table td:nth-child(4) {
  text-align: right;
}

.totais-section {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.total-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.total-line:last-child {
  margin-bottom: 0;
}

.total-final {
  border-top: 2px solid #007bff;
  padding-top: 10px;
  margin-top: 10px;
  font-size: 1.2em;
}

.info-adicional {
  border-top: 1px solid #dee2e6;
  padding-top: 15px;
}

.info-adicional p {
  margin: 5px 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #dee2e6;
  background: #f8f9fa;
}

.btn-secondary,
.btn-primary {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.3s;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
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
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .address-grid {
    grid-template-columns: 1fr;
  }
  
  .orcamento-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .orcamento-info {
    text-align: left;
  }
  
  .modal-content {
    width: 95%;
    margin: 10px;
  }
  
  .actions {
    flex-direction: column;
    gap: 4px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .modal-footer {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .itens-table table {
    font-size: 12px;
  }
  
  .itens-table th,
  .itens-table td {
    padding: 4px;
  }
  
  .totais-container {
    padding: 10px;
  }
  
  .total-row {
    font-size: 14px;
  }
}
</style>