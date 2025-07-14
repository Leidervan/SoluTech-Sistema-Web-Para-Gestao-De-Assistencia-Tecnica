<template>
  <div class="section-content">
    <!-- Loading indicator -->
    <div v-if="loading" class="loading-container">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Carregando clientes...</span>
    </div>

    <div v-else>
      <div class="filter-row">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar cliente..."
            v-model="localFiltro"
            @input="updateFiltro"
          />
        </div>
        <button class="btn-success" @click="editarCliente(null)">
          <i class="fas fa-plus"></i> Novo Cliente
        </button>
      </div>

      <div class="table-container" v-if="clientesFiltrados.length > 0">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>Email</th>
              <th>Cidade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(cliente, idx) in clientesFiltrados" :key="cliente.id || idx">
              <td>{{ getNomeCompleto(cliente) }}</td>
              <td>{{ formatarCPF(cliente.cpf) }}</td>
              <td>{{ cliente.celular || cliente.telefone || '-' }}</td>
              <td>{{ cliente.email || '-' }}</td>
              <td>{{ cliente.cidade || '-' }}</td>
              <td class="actions">
                <button class="edit" @click="editarCliente(idx)" title="Editar">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="delete" @click="excluirCliente(idx)" title="Excluir">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="!loading" class="empty-state">
        <i class="fas fa-users fa-3x"></i>
        <h3>Nenhum cliente encontrado</h3>
        <p>{{ localFiltro ? 'Nenhum cliente encontrado para sua busca.' : 'Cadastre o primeiro cliente clicando em "Novo Cliente".' }}</p>
      </div>

      <transition name="fade">
        <div v-if="showCadastroCliente" class="cadastro-bloco">
          <h3>{{ editingIndex === null ? 'Novo Cliente' : 'Editar Cliente' }}</h3>
          <form @submit.prevent="salvarCliente">
            <div class="form-group">
              <label for="nome">Nome *</label>
              <input 
                type="text" 
                id="nome" 
                v-model="formCliente.nome" 
                required 
                placeholder="Digite o nome"
              />
            </div>
            <div class="form-group">
              <label for="sobrenome">Sobrenome *</label>
              <input 
                type="text" 
                id="sobrenome" 
                v-model="formCliente.sobrenome" 
                required 
                placeholder="Digite o sobrenome"
              />
            </div>
            <div class="form-group">
              <label for="cpf">CPF *</label>
              <input
                type="text"
                id="cpf"
                v-model="formCliente.cpf"
                @input="mascararCPF"
                maxlength="14"
                placeholder="000.000.000-00"
                required
              />
            </div>
            <div class="form-group">
              <label for="rg">RG *</label>
              <input 
                type="text" 
                id="rg" 
                v-model="formCliente.rg" 
                required 
                placeholder="Digite o RG"
              />
            </div>
            <div class="form-group">
              <label for="sexo">Sexo</label>
              <select id="sexo" v-model="formCliente.sexo">
                <option value="">Selecione o Sexo</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div class="form-group">
              <label for="telefone">Telefone Fixo</label>
              <input
                type="text"
                id="telefone"
                v-model="formCliente.telefone"
                @input="mascararTelefone('telefone')"
                placeholder="(11) 2345-6789"
              />
            </div>
            <div class="form-group">
              <label for="celular">Telefone Celular *</label>
              <input
                type="text"
                id="celular"
                v-model="formCliente.celular"
                @input="mascararTelefone('celular')"
                placeholder="(11) 91234-5678"
                required
              />
            </div>
            <div class="form-group">
              <label for="email">E-mail</label>
              <input
                type="email"
                id="email"
                v-model="formCliente.email"
                placeholder="cliente@email.com"
              />
            </div>
            <div class="form-group">
              <label for="data_nascimento">Data de Nascimento</label>
              <input
                type="date"
                id="data_nascimento"
                v-model="formCliente.data_nascimento"
                @change="calcularIdade"
              />
            </div>
            <div class="form-group">
              <label for="idade">Idade</label>
              <input 
                type="number" 
                id="idade" 
                v-model="formCliente.idade" 
                readonly 
                placeholder="Calculado automaticamente"
              />
            </div>
            <div class="form-group">
              <label for="rua">Rua *</label>
              <input 
                type="text" 
                id="rua" 
                v-model="formCliente.rua" 
                required 
                placeholder="Nome da rua"
              />
            </div>
            <div class="form-group">
              <label for="bairro">Bairro *</label>
              <input 
                type="text" 
                id="bairro" 
                v-model="formCliente.bairro" 
                required 
                placeholder="Nome do bairro"
              />
            </div>
            <div class="form-group">
              <label for="numero_residencia">Número *</label>
              <input 
                type="text" 
                id="numero_residencia" 
                v-model="formCliente.numero_residencia" 
                required 
                placeholder="Número da residência"
              />
            </div>
            <div class="form-group">
              <label for="cidade">Cidade *</label>
              <input 
                type="text" 
                id="cidade" 
                v-model="formCliente.cidade" 
                required 
                placeholder="Nome da cidade"
              />
            </div>
            <div class="form-group">
              <label for="estado">Estado *</label>
              <select id="estado" v-model="formCliente.estado" required>
                <option value="">Selecione o Estado</option>
                <option v-for="uf in estados" :key="uf" :value="uf">{{ uf }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="pais">País *</label>
              <input 
                type="text" 
                id="pais" 
                v-model="formCliente.pais" 
                required 
                placeholder="Brasil"
              />
            </div>
            <div class="form-actions">
              <button type="button" @click="cancelarFormulario" class="btn-cancel">
                Cancelar
              </button>
              <button type="submit" :disabled="!isFormValid" class="btn-save">
                {{ editingIndex === null ? 'Salvar Cliente' : 'Atualizar Cliente' }}
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
  name: 'Clientes',
  props: {
    clientes: { 
      type: Array, 
      default: () => [] 
    },
    filtroCliente: { 
      type: String, 
      default: '' 
    },
    showCadastroCliente: { 
      type: Boolean, 
      default: false 
    },
    formCliente: { 
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
    'update:filtroCliente',
    'save-cliente',
    'edit-cliente',
    'delete-cliente',
    'cancel-cliente',
  ],
  data() {
    return {
      localFiltro: this.filtroCliente,
      estados: [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
        'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
        'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
      ],
    };
  },
  watch: {
    filtroCliente(newVal) {
      this.localFiltro = newVal;
    },
  },
  computed: {
    clientesFiltrados() {
      if (!this.localFiltro) return this.clientes;
      
      const termo = this.localFiltro.toLowerCase();
      return this.clientes.filter((cliente) => {
        const nome = cliente.nome || '';
        const sobrenome = cliente.sobrenome || '';
        const cpf = cliente.cpf || '';
        const email = cliente.email || '';
        const cidade = cliente.cidade || '';
        
        return (
          nome.toLowerCase().includes(termo) ||
          sobrenome.toLowerCase().includes(termo) ||
          cpf.includes(this.localFiltro) ||
          email.toLowerCase().includes(termo) ||
          cidade.toLowerCase().includes(termo)
        );
      });
    },
    
    isFormValid() {
      return !!(
        this.formCliente.nome &&
        this.formCliente.sobrenome &&
        this.formCliente.cpf &&
        this.formCliente.rg &&
        this.formCliente.celular &&
        this.formCliente.rua &&
        this.formCliente.bairro &&
        this.formCliente.numero_residencia &&
        this.formCliente.cidade &&
        this.formCliente.estado &&
        this.formCliente.pais
      );
    },
  },
  methods: {
    updateFiltro() {
      this.$emit('update:filtroCliente', this.localFiltro);
    },

    getNomeCompleto(cliente) {
      const nome = cliente.nome || '';
      const sobrenome = cliente.sobrenome || '';
      return `${nome} ${sobrenome}`.trim();
    },

    editarCliente(index) {
      this.$emit('edit-cliente', index);
    },

    excluirCliente(index) {
      this.$emit('delete-cliente', index);
    },

    salvarCliente() {
      if (this.isFormValid) {
        this.$emit('save-cliente');
      }
    },

    cancelarFormulario() {
      this.$emit('cancel-cliente');
    },

    mascararCPF() {
      if (!this.formCliente.cpf) return;
      
      let v = this.formCliente.cpf.replace(/\D/g, '').slice(0, 11);
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      this.formCliente.cpf = v;
    },

    mascararTelefone(campo) {
      if (!this.formCliente[campo]) return;
      
      let v = this.formCliente[campo].replace(/\D/g, '').slice(0, 11);
      if (v.length <= 10) {
        v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      } else {
        v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
      }
      this.formCliente[campo] = v.trim().replace(/[- ]+$/, '');
    },

    formatarCPF(cpf) {
      if (!cpf) return '';
      const numericCpf = cpf.replace(/\D/g, '');
      if (numericCpf.length === 11) {
        return numericCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      }
      return cpf;
    },

    calcularIdade() {
      if (this.formCliente.data_nascimento) {
        const hoje = new Date();
        const nasc = new Date(this.formCliente.data_nascimento);
        let idadeCalc = hoje.getFullYear() - nasc.getFullYear();
        const mes = hoje.getMonth() - nasc.getMonth();
        
        if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) {
          idadeCalc--;
        }
        
        this.formCliente.idade = idadeCalc;
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

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 5px;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
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

.btn-save:disabled,
.btn-cancel:disabled {
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
  .form-actions {
    flex-direction: column;
  }
  
  .table-container {
    overflow-x: auto;
  }
}
</style>