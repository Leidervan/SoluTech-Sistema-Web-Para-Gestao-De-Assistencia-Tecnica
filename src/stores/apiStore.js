// =============================================================================
//  src/stores/apiStore.js - Store para gerenciar estado da API
// =============================================================================
import { reactive } from 'vue';

export const apiStore = reactive({
  // Estado de loading
  loading: {
    clientes: false,
    equipamentos: false,
    fornecedores: false,
    pecas: false,
    orcamentos: false,
    reparos: false,
  },

  // Dados
  data: {
    clientes: [],
    equipamentos: [],
    fornecedores: [],
    pecas: [],
    orcamentos: [],
    reparos: [],
  },

  // Erros
  errors: {
    clientes: null,
    equipamentos: null,
    fornecedores: null,
    pecas: null,
    orcamentos: null,
    reparos: null,
  },

  // Métodos para atualizar o estado
  setLoading(entity, status) {
    this.loading[entity] = status;
  },

  setData(entity, data) {
    this.data[entity] = data;
    this.errors[entity] = null;
  },

  setError(entity, error) {
    this.errors[entity] = error;
    this.loading[entity] = false;
  },

  addItem(entity, item) {
    this.data[entity].push(item);
  },

  updateItem(entity, id, updatedItem) {
    const index = this.data[entity].findIndex(item => item.id === id);
    if (index !== -1) {
      this.data[entity][index] = updatedItem;
    }
  },

  removeItem(entity, id) {
    const index = this.data[entity].findIndex(item => item.id === id);
    if (index !== -1) {
      this.data[entity].splice(index, 1);
    }
  },

  // Método para limpar todos os dados
  clearAll() {
    Object.keys(this.data).forEach(key => {
      this.data[key] = [];
      this.errors[key] = null;
      this.loading[key] = false;
    });
  },

  // Método para obter estatísticas
  getStats() {
    return {
      totalClientes: this.data.clientes.length,
      totalEquipamentos: this.data.equipamentos.length,
      totalFornecedores: this.data.fornecedores.length,
      totalPecas: this.data.pecas.length,
      totalOrcamentos: this.data.orcamentos.length,
      totalReparos: this.data.reparos.length,
      estoqueTotal: this.data.pecas.reduce((total, peca) => total + (peca.quantidade || 0), 0),
    };
  },
});