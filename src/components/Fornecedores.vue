<template>
  <div class="section-content">
    <!-- Loading indicator -->
    <div v-if="loading" class="loading-container">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Carregando fornecedores...</span>
    </div>

    <div v-else>
      <div class="filter-row">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar fornecedor..."
            v-model="localFiltro"
            @input="updateFiltro"
          />
        </div>
        <button class="btn-success" @click="editarFornecedor(null)">
          <i class="fas fa-plus"></i> Novo Fornecedor
        </button>
      </div>

      <div class="table-container" v-if="fornecedoresFiltrados.length > 0">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CNPJ</th>
              <th>Telefone</th>
              <th>Email</th>
              <th>Cidade</th>
              <th>Estado</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(fornecedor, idx) in fornecedoresFiltrados" :key="fornecedor.id || idx">
              <td>{{ fornecedor.nome }}</td>
              <td>{{ formatarCNPJ(fornecedor.cnpj) }}</td>
              <td>{{ fornecedor.telefone || '-' }}</td>
              <td>{{ fornecedor.email || '-' }}</td>
              <td>{{ fornecedor.cidade || '-' }}</td>
              <td>{{ fornecedor.estado || '-' }}</td>
              <td class="actions">
                <button class="edit" @click="editarFornecedor(idx)" title="Editar">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="delete" @click="excluirFornecedor(idx)" title="Excluir">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="!loading" class="empty-state">
        <i class="fas fa-truck fa-3x"></i>
        <h3>Nenhum fornecedor encontrado</h3>
        <p>{{ localFiltro ? 'Nenhum fornecedor encontrado para sua busca.' : 'Cadastre o primeiro fornecedor clicando em "Novo Fornecedor".' }}</p>
      </div>

      <transition name="fade">
        <div v-if="showCadastroFornecedor" class="cadastro-bloco">
          <h3>{{ editingIndex === null ? 'Novo Fornecedor' : 'Editar Fornecedor' }}</h3>
          <form @submit.prevent="salvarFornecedor">
            <div class="form-group">
              <label for="nome">Nome/Razão Social *</label>
              <input 
                type="text" 
                id="nome" 
                v-model="formFornecedor.nome" 
                required 
                placeholder="Digite o nome do fornecedor"
              />
            </div>
            
            <div class="form-group">
              <label for="cnpj">CNPJ *</label>
              <input
                type="text"
                id="cnpj"
                v-model="formFornecedor.cnpj"
                @input="mascararCNPJ"
                maxlength="18"
                placeholder="00.000.000/0000-00"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="inscricao_estadual">Inscrição Estadual</label>
              <input 
                type="text" 
                id="inscricao_estadual" 
                v-model="formFornecedor.inscricao_estadual" 
                placeholder="Digite a inscrição estadual"
              />
            </div>
            
            <div class="form-group">
              <label for="telefone">Telefone</label>
              <input
                type="text"
                id="telefone"
                v-model="formFornecedor.telefone"
                @input="mascararTelefone"
                placeholder="(11) 2345-6789"
              />
            </div>
            
            <div class="form-group">
              <label for="celular">Telefone Celular</label>
              <input
                type="text"
                id="celular"
                v-model="formFornecedor.celular"
                @input="mascararCelular"
                placeholder="(11) 91234-5678"
              />
            </div>
            
            <div class="form-group">
              <label for="email">E-mail</label>
              <input
                type="email"
                id="email"
                v-model="formFornecedor.email"
                placeholder="fornecedor@email.com"
              />
            </div>
            
            <div class="form-group">
              <label for="numero">Número</label>
              <input 
                type="text" 
                id="numero" 
                v-model="formFornecedor.numero" 
                placeholder="Número do endereço"
              />
            </div>
            
            <div class="form-group">
              <label for="cep">CEP</label>
              <input
                type="text"
                id="cep"
                v-model="formFornecedor.cep"
                @input="mascararCEP"
                maxlength="9"
                placeholder="00000-000"
              />
            </div>
            
            <div class="form-group">
              <label for="bairro">Bairro</label>
              <input 
                type="text" 
                id="bairro" 
                v-model="formFornecedor.bairro" 
                placeholder="Nome do bairro"
              />
            </div>
            
            <div class="form-group">
              <label for="cidade">Cidade *</label>
              <input 
                type="text" 
                id="cidade" 
                v-model="formFornecedor.cidade" 
                required 
                placeholder="Nome da cidade"
              />
            </div>
            
            <div class="form-group">
              <label for="estado">Estado *</label>
              <select id="estado" v-model="formFornecedor.estado" required>
                <option value="">Selecione o Estado</option>
                <option v-for="uf in estados" :key="uf" :value="uf">{{ uf }}</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="site">Site</label>
              <input 
                type="url" 
                id="site" 
                v-model="formFornecedor.site" 
                placeholder="https://www.fornecedor.com.br"
              />
            </div>
            
            <div class="form-group">
              <label for="representante">Representante</label>
              <input 
                type="text" 
                id="representante" 
                v-model="formFornecedor.representante" 
                placeholder="Nome do representante"
              />
            </div>

            <div class="form-actions">
              <button type="button" @click="cancelarFormulario" class="btn-cancel">
                Cancelar
              </button>
              <button type="submit" :disabled="!isFormValid" class="btn-save">
                {{ editingIndex === null ? 'Salvar Fornecedor' : 'Atualizar Fornecedor' }}
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
  name: 'Fornecedores',
  props: {
    fornecedores: { 
      type: Array, 
      default: () => [] 
    },
    filtroFornecedor: { 
      type: String, 
      default: '' 
    },
    showCadastroFornecedor: { 
      type: Boolean, 
      default: false 
    },
    formFornecedor: { 
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
    'update:filtroFornecedor',
    'save-fornecedor',
    'edit-fornecedor',
    'delete-fornecedor',
    'cancel-fornecedor',
  ],
  data() {
    return {
      localFiltro: this.filtroFornecedor,
      estados: [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
        'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
        'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
      ],
    };
  },
  watch: {
    filtroFornecedor(newVal) {
      this.localFiltro = newVal;
    },
  },
  computed: {
    fornecedoresFiltrados() {
      if (!this.localFiltro) return this.fornecedores;
      
      const termo = this.localFiltro.toLowerCase();
      return this.fornecedores.filter((fornecedor) => {
        const nome = fornecedor.nome || '';
        const cnpj = fornecedor.cnpj || '';
        const email = fornecedor.email || '';
        const cidade = fornecedor.cidade || '';
        
        return (
          nome.toLowerCase().includes(termo) ||
          cnpj.includes(this.localFiltro) ||
          email.toLowerCase().includes(termo) ||
          cidade.toLowerCase().includes(termo)
        );
      });
    },
    
    isFormValid() {
      return !!(
        this.formFornecedor.nome &&
        this.formFornecedor.cnpj &&
        this.formFornecedor.cidade &&
        this.formFornecedor.estado
      );
    },
  },
  methods: {
    updateFiltro() {
      this.$emit('update:filtroFornecedor', this.localFiltro);
    },

    editarFornecedor(index) {
      this.$emit('edit-fornecedor', index);
    },

    excluirFornecedor(index) {
      this.$emit('delete-fornecedor', index);
    },

    salvarFornecedor() {
      if (this.isFormValid) {
        this.$emit('save-fornecedor');
      }
    },

    cancelarFormulario() {
      this.$emit('cancel-fornecedor');
    },

    mascararCNPJ() {
      if (!this.formFornecedor.cnpj) return;
      
      let v = this.formFornecedor.cnpj.replace(/\D/g, '').slice(0, 14);
      v = v.replace(/^(\d{2})(\d)/, '$1.$2');
      v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
      v = v.replace(/(\d{4})(\d)/, '$1-$2');
      this.formFornecedor.cnpj = v;
    },

    mascararTelefone() {
      if (!this.formFornecedor.telefone) return;
      
      let v = this.formFornecedor.telefone.replace(/\D/g, '').slice(0, 10);
      v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      this.formFornecedor.telefone = v.trim().replace(/[- ]+$/, '');
    },

    mascararCelular() {
      if (!this.formFornecedor.celular) return;
      
      let v = this.formFornecedor.celular.replace(/\D/g, '').slice(0, 11);
      v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
      this.formFornecedor.celular = v.trim().replace(/[- ]+$/, '');
    },

    mascararCEP() {
      if (!this.formFornecedor.cep) return;
      
      let v = this.formFornecedor.cep.replace(/\D/g, '').slice(0, 8);
      v = v.replace(/(\d{5})(\d{0,3})/, '$1-$2');
      this.formFornecedor.cep = v;
    },

    formatarCNPJ(cnpj) {
      if (!cnpj) return '';
      const numericCnpj = cnpj.replace(/\D/g, '');
      if (numericCnpj.length === 14) {
        return numericCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
      }
      return cnpj;
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
}

.data-table td {
  padding: 12px;
  border-bottom: 1px solid #f1f3f4;
}

.data-table tbody tr:hover {
  background: #f8f9fa;
}

.actions {
  display: flex;
  gap: 8px;
}

.actions button {
  padding: 6px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.edit {
  background: #3498db;
  color: white;
}

.edit:hover {
  background: #2980b9;
}

.delete {
  background: #e74c3c;
  color: white;
}

.delete:hover {
  background: #c0392b;
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
.form-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #3498db;
  box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
  outline: none;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-cancel {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-cancel:hover {
  background: #7f8c8d;
}

.btn-save {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
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
@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: none;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .cadastro-bloco form {
    grid-template-columns: 1fr;
  }
}
</style>