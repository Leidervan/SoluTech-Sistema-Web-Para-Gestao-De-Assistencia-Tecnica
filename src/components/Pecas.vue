<template>
  <div class="section-content">
    <!-- Loading indicator -->
    <div v-if="loading" class="loading-container">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Carregando peças...</span>
    </div>

    <div v-else>
      <div class="filter-row">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar peça..."
            v-model="localFiltro"
            @input="updateFiltro"
          />
        </div>
        <button class="btn-success" @click="editarPeca(null)">
          <i class="fas fa-plus"></i> Nova Peça
        </button>
      </div>

      <div class="table-container" v-if="pecasFiltradas.length > 0">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nome da Peça</th>
              <th>Fabricante</th>
              <th>Local Fabricação</th>
              <th>Peso (kg)</th>
              <th>Quantidade</th>
              <th>Preço Unitário</th>
              <th>Valor Total</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(peca, idx) in pecasFiltradas" :key="peca.id || idx" :class="getRowClass(peca)">
              <td>
                <div class="peca-info">
                  <strong>{{ peca.peca || peca.nome }}</strong>
                  <small v-if="peca.observacao">{{ peca.observacao }}</small>
                </div>
              </td>
              <td>{{ peca.fabricante || '-' }}</td>
              <td>{{ peca.local_fabricacao || '-' }}</td>
              <td>{{ peca.peso || '-' }}</td>
              <td>
                <span class="quantidade" :class="getQuantidadeClass(peca.quantidade)">
                  {{ peca.quantidade || 0 }}
                </span>
              </td>
              <td>{{ formatCurrency(peca.preco || peca.valor_unitario || 0) }}</td>
              <td class="valor-total">{{ formatCurrency((peca.preco || peca.valor_unitario || 0) * (peca.quantidade || 0)) }}</td>
              <td class="actions">
                <button 
                  class="action-btn edit" 
                  @click="abrirModalAutenticacao('edit', idx)" 
                  title="Editar"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  class="action-btn delete" 
                  @click="abrirModalAutenticacao('delete', idx)" 
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
        <i class="fas fa-cogs fa-3x"></i>
        <h3>Nenhuma peça encontrada</h3>
        <p>{{ localFiltro ? 'Nenhuma peça encontrada para sua busca.' : 'Cadastre a primeira peça clicando em "Nova Peça".' }}</p>
      </div>

      <!-- Modal de Autenticação -->
      <transition name="fade">
        <div class="modal-overlay" v-if="mostrarModal" @click="cancelarModal">
          <div class="modal-auth" @click.stop>
            <div class="modal-header">
              <h3>Autenticação de Administrador</h3>
              <button class="close-btn" @click="cancelarModal">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <p class="auth-message">
                <i class="fas fa-shield-alt"></i>
                Esta ação requer autenticação de administrador
              </p>
              <div class="form-group">
                <label for="usuario">Usuário</label>
                <input 
                  type="text" 
                  id="usuario"
                  v-model="usuario" 
                  placeholder="Digite o usuário"
                  @keyup.enter="$refs.senhaInput.focus()"
                />
              </div>
              <div class="form-group">
                <label for="senha">Senha</label>
                <input 
                  type="password" 
                  id="senha"
                  ref="senhaInput"
                  v-model="senha" 
                  placeholder="Digite a senha"
                  @keyup.enter="confirmarAutenticacao"
                />
              </div>
              <div v-if="erroAuth" class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                {{ erroAuth }}
              </div>
            </div>
            <div class="modal-footer">
              <button @click="cancelarModal" class="btn-cancel">
                Cancelar
              </button>
              <button @click="confirmarAutenticacao" class="btn-confirm" :disabled="!usuario || !senha">
                <i class="fas fa-check"></i>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Formulário de Cadastro/Edição -->
      <transition name="fade">
        <div v-if="showCadastroPeca" class="cadastro-bloco">
          <h3>{{ editingIndex === null ? 'Nova Peça' : 'Editar Peça' }}</h3>
          <form @submit.prevent="salvarPeca">
            <div class="form-group">
              <label for="peca">Nome da Peça *</label>
              <input 
                type="text" 
                id="peca" 
                v-model="formPeca.peca" 
                required 
                placeholder="Digite o nome da peça"
              />
            </div>
            
            <div class="form-group">
              <label for="fabricante">Fabricante *</label>
              <input 
                type="text" 
                id="fabricante" 
                v-model="formPeca.fabricante" 
                required 
                placeholder="Nome do fabricante"
              />
            </div>
            
            <div class="form-group">
              <label for="local_fabricacao">Local de Fabricação</label>
              <input 
                type="text" 
                id="local_fabricacao" 
                v-model="formPeca.local_fabricacao" 
                placeholder="Cidade/País de fabricação"
              />
            </div>
            
            <div class="form-group">
              <label for="peso">Peso (kg)</label>
              <input 
                type="number" 
                id="peso" 
                v-model.number="formPeca.peso" 
                step="0.001" 
                min="0"
                placeholder="0.000"
              />
            </div>
            
            <div class="form-group">
              <label for="quantidade">Quantidade em Estoque *</label>
              <input 
                type="number" 
                id="quantidade" 
                v-model.number="formPeca.quantidade" 
                required 
                min="0"
                placeholder="0"
              />
            </div>
            
            <div class="form-group">
              <label for="numero_serie">Número de Série</label>
              <input 
                type="text" 
                id="numero_serie" 
                v-model="formPeca.numero_serie" 
                placeholder="Número de série (se aplicável)"
              />
            </div>
            
            <div class="form-group">
              <label for="codigo_producao">Código de Produção</label>
              <input 
                type="text" 
                id="codigo_producao" 
                v-model="formPeca.codigo_producao" 
                placeholder="Código interno de produção"
              />
            </div>
            
            <div class="form-group">
              <label for="preco">Preço Unitário (R$) *</label>
              <input 
                type="number" 
                id="preco" 
                v-model.number="formPeca.preco" 
                required 
                step="0.01" 
                min="0"
                placeholder="0.00"
              />
            </div>
            
            <div class="form-group full-width">
              <label for="observacao">Observações</label>
              <textarea 
                id="observacao" 
                v-model="formPeca.observacao" 
                rows="3"
                placeholder="Observações adicionais sobre a peça..."
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" @click="cancelarFormulario" class="btn-cancel">
                Cancelar
              </button>
              <button type="submit" :disabled="!isFormValid" class="btn-save">
                {{ editingIndex === null ? 'Salvar Peça' : 'Atualizar Peça' }}
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
  name: 'Pecas',
  props: {
    pecas: { 
      type: Array, 
      default: () => [] 
    },
    filtroPeca: { 
      type: String, 
      default: '' 
    },
    showCadastroPeca: { 
      type: Boolean, 
      default: false 
    },
    formPeca: { 
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
    'update:filtroPeca',
    'save-peca',
    'edit-peca',
    'delete-peca',
    'cancel-peca',
  ],
  data() {
    return {
      localFiltro: this.filtroPeca,
      mostrarModal: false,
      usuario: '',
      senha: '',
      erroAuth: '',
      acaoSolicitada: null,
      indexAlvo: null,
    };
  },
  watch: {
    filtroPeca(newVal) {
      this.localFiltro = newVal;
    },
  },
  computed: {
    pecasFiltradas() {
      if (!this.localFiltro) return this.pecas;
      
      const termo = this.localFiltro.toLowerCase();
      return this.pecas.filter((peca) => {
        const nome = (peca.peca || peca.nome || '').toLowerCase();
        const fabricante = (peca.fabricante || '').toLowerCase();
        const local = (peca.local_fabricacao || '').toLowerCase();
        
        return (
          nome.includes(termo) ||
          fabricante.includes(termo) ||
          local.includes(termo)
        );
      });
    },
    
    isFormValid() {
      return !!(
        this.formPeca.peca &&
        this.formPeca.fabricante &&
        this.formPeca.quantidade >= 0 &&
        this.formPeca.preco >= 0
      );
    },
  },
  methods: {
    updateFiltro() {
      this.$emit('update:filtroPeca', this.localFiltro);
    },

    editarPeca(index) {
      this.$emit('edit-peca', index);
    },

    salvarPeca() {
      if (this.isFormValid) {
        this.$emit('save-peca');
      }
    },

    cancelarFormulario() {
      this.$emit('cancel-peca');
    },

    abrirModalAutenticacao(acao, index) {
      this.acaoSolicitada = acao;
      this.indexAlvo = index;
      this.usuario = '';
      this.senha = '';
      this.erroAuth = '';
      this.mostrarModal = true;
      
      // Focus no campo usuário após abrir o modal
      this.$nextTick(() => {
        const userInput = document.getElementById('usuario');
        if (userInput) userInput.focus();
      });
    },

    cancelarModal() {
      this.mostrarModal = false;
      this.erroAuth = '';
    },

    confirmarAutenticacao() {
      // Credenciais de exemplo - em produção, isso deveria vir de uma API segura
      if (this.usuario === 'admin' && this.senha === '1234') {
        if (this.acaoSolicitada === 'edit') {
          this.$emit('edit-peca', this.indexAlvo);
        } else if (this.acaoSolicitada === 'delete') {
          this.$emit('delete-peca', this.indexAlvo);
        }
        this.cancelarModal();
      } else {
        this.erroAuth = 'Usuário ou senha incorretos. Tente novamente.';
        this.senha = ''; // Limpa a senha
        this.$nextTick(() => {
          this.$refs.senhaInput.focus();
        });
      }
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

.quantidade {
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  min-width: 30px;
  text-align: center;
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

.valor-total {
  font-weight: bold;
  color: #28a745;
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

/* Modal de Autenticação */
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

.modal-auth {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
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
  font-size: 1.2em;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
  padding: 4px;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.auth-message {
  background: #e8f4fd;
  border: 1px solid #bee5eb;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 20px;
  color: #0c5460;
  display: flex;
  align-items: center;
  gap: 8px;
}

.auth-message i {
  color: #17a2b8;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 5px;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  border-color: #3498db;
  box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
  outline: none;
}

.error-message {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 10px;
  color: #721c24;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.error-message i {
  color: #e74c3c;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #dee2e6;
  background: #f8f9fa;
}

.btn-cancel,
.btn-confirm {
  padding: 8px 16px;
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

.btn-confirm {
  background: #28a745;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-confirm:hover {
  background: #218838;
}

.btn-confirm:disabled {
  background: #6c757d;
  cursor: not-allowed;
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
}

.cadastro-bloco form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.cadastro-bloco .form-group {
  display: flex;
  flex-direction: column;
}

.cadastro-bloco .form-group.full-width {
  grid-column: 1 / -1;
}

.cadastro-bloco .form-group label {
  font-weight: 500;
  margin-bottom: 5px;
  color: #333;
}

.cadastro-bloco .form-group input,
.cadastro-bloco .form-group textarea {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.cadastro-bloco .form-group input:focus,
.cadastro-bloco .form-group textarea:focus {
  border-color: #3498db;
  box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
  outline: none;
}

.cadastro-bloco .form-group textarea {
  resize: vertical;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.form-actions .btn-cancel,
.form-actions .btn-save {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
  font-weight: 500;
}

.form-actions .btn-cancel {
  background: #95a5a6;
  color: white;
}

.form-actions .btn-cancel:hover {
  background: #7f8c8d;
}

.form-actions .btn-save {
  background: #3498db;
  color: white;
}

.form-actions .btn-save:hover {
  background: #2980b9;
}

.form-actions .btn-save:disabled {
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
@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
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
  
  .form-actions {
    flex-direction: column;
  }
  
  .modal-auth {
    width: 95%;
    margin: 10px;
  }
  
  .actions {
    flex-direction: column;
    gap: 4px;
  }
}
</style>