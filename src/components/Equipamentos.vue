<template>
  <div class="section-content">
    <!-- Loading indicator -->
    <div v-if="loading" class="loading-container">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Carregando equipamentos...</span>
    </div>

    <div v-else>
      <div class="filter-row">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar equipamento..."
            v-model="localFiltro"
            @input="updateFiltro"
          />
        </div>
        <button class="btn-success" @click="editarEquipamento(null)">
          <i class="fas fa-plus"></i> Novo Equipamento
        </button>
      </div>

      <div class="table-container" v-if="equipamentosFiltrados.length > 0">
        <table class="data-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Nº Série</th>
              <th>Ano Fabricação</th>
              <th>Voltagem</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(equipamento, idx) in equipamentosFiltrados" :key="equipamento.id || idx">
              <td>{{ equipamento.tipo || equipamento.nome_equipamento }}</td>
              <td>{{ equipamento.marca || equipamento.fabricante }}</td>
              <td>{{ equipamento.modelo || '-' }}</td>
              <td>{{ equipamento.numero_serie || '-' }}</td>
              <td>{{ equipamento.ano_fabricacao || '-' }}</td>
              <td>{{ equipamento.voltagem || '-' }}</td>
              <td class="actions">
                <button class="edit" @click="editarEquipamento(idx)" title="Editar">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="delete" @click="excluirEquipamento(idx)" title="Excluir">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="!loading" class="empty-state">
        <i class="fas fa-cogs fa-3x"></i>
        <h3>Nenhum equipamento encontrado</h3>
        <p>{{ localFiltro ? 'Nenhum equipamento encontrado para sua busca.' : 'Cadastre o primeiro equipamento clicando em "Novo Equipamento".' }}</p>
      </div>

      <transition name="fade">
        <div v-if="showCadastroEquipamento" class="cadastro-bloco">
          <h3>{{ editingIndex === null ? 'Novo Equipamento' : 'Editar Equipamento' }}</h3>
          <form @submit.prevent="salvarEquipamento">
            <div class="form-group">
              <label for="tipo">Tipo/Nome do Equipamento *</label>
              <input 
                type="text" 
                id="tipo" 
                v-model="formEquipamento.tipo" 
                required 
                placeholder="Ex: Geladeira, Fogão, Microondas..."
              />
            </div>
            
            <div class="form-group">
              <label for="marca">Marca/Fabricante *</label>
              <input 
                type="text" 
                id="marca" 
                v-model="formEquipamento.marca" 
                required 
                placeholder="Ex: Brastemp, Electrolux, Samsung..."
              />
            </div>
            
            <div class="form-group">
              <label for="modelo">Modelo *</label>
              <input 
                type="text" 
                id="modelo" 
                v-model="formEquipamento.modelo" 
                required 
                placeholder="Digite o modelo do equipamento"
              />
            </div>
            
            <div class="form-group">
              <label for="numero_serie">Número de Série *</label>
              <input 
                type="text" 
                id="numero_serie" 
                v-model="formEquipamento.numero_serie" 
                required 
                placeholder="Digite o número de série"
              />
            </div>
            
            <div class="form-group">
              <label for="codigo_fabricacao">Código de Fabricação</label>
              <input 
                type="text" 
                id="codigo_fabricacao" 
                v-model="formEquipamento.codigo_fabricacao" 
                placeholder="Código do fabricante (opcional)"
              />
            </div>
            
            <div class="form-group">
              <label for="ano_fabricacao">Ano de Fabricação</label>
              <input 
                type="number" 
                id="ano_fabricacao" 
                v-model="formEquipamento.ano_fabricacao" 
                :min="1990"
                :max="new Date().getFullYear()"
                placeholder="Ex: 2023"
              />
            </div>
            
            <div class="form-group">
              <label for="voltagem">Voltagem</label>
              <select id="voltagem" v-model="formEquipamento.voltagem">
                <option value="">Selecione a voltagem</option>
                <option value="110V">110V</option>
                <option value="220V">220V</option>
                <option value="Bivolt">Bivolt (110V/220V)</option>
                <option value="12V">12V</option>
                <option value="24V">24V</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="amperagem">Amperagem</label>
              <input 
                type="text" 
                id="amperagem" 
                v-model="formEquipamento.amperagem" 
                placeholder="Ex: 10A, 15A..."
              />
            </div>

            <div class="form-actions">
              <button type="button" @click="cancelarFormulario" class="btn-cancel">
                Cancelar
              </button>
              <button type="submit" :disabled="!isFormValid" class="btn-save">
                {{ editingIndex === null ? 'Salvar Equipamento' : 'Atualizar Equipamento' }}
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
  name: 'Equipamentos',
  props: {
    equipamentos: { 
      type: Array, 
      default: () => [] 
    },
    filtroEquipamento: { 
      type: String, 
      default: '' 
    },
    showCadastroEquipamento: { 
      type: Boolean, 
      default: false 
    },
    formEquipamento: { 
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
    'update:filtroEquipamento',
    'save-equipamento',
    'edit-equipamento',
    'delete-equipamento',
    'cancel-equipamento',
  ],
  data() {
    return {
      localFiltro: this.filtroEquipamento,
    };
  },
  watch: {
    filtroEquipamento(newVal) {
      this.localFiltro = newVal;
    },
  },
  computed: {
    equipamentosFiltrados() {
      if (!this.localFiltro) return this.equipamentos;
      
      const termo = this.localFiltro.toLowerCase();
      return this.equipamentos.filter((equipamento) => {
        const tipo = (equipamento.tipo || equipamento.nome_equipamento || '').toLowerCase();
        const marca = (equipamento.marca || equipamento.fabricante || '').toLowerCase();
        const modelo = (equipamento.modelo || '').toLowerCase();
        const numeroSerie = (equipamento.numero_serie || '').toLowerCase();
        
        return (
          tipo.includes(termo) ||
          marca.includes(termo) ||
          modelo.includes(termo) ||
          numeroSerie.includes(termo)
        );
      });
    },
    
    isFormValid() {
      return !!(
        this.formEquipamento.tipo &&
        this.formEquipamento.marca &&
        this.formEquipamento.modelo &&
        this.formEquipamento.numero_serie
      );
    },
  },
  methods: {
    updateFiltro() {
      this.$emit('update:filtroEquipamento', this.localFiltro);
    },

    editarEquipamento(index) {
      this.$emit('edit-equipamento', index);
    },

    excluirEquipamento(index) {
      this.$emit('delete-equipamento', index);
    },

    salvarEquipamento() {
      if (this.isFormValid) {
        this.$emit('save-equipamento');
      }
    },

    cancelarFormulario() {
      this.$emit('cancel-equipamento');
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