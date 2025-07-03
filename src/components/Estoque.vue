<template>
  <div class="section-content">
    <div class="filter-row">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="text"
          placeholder="Buscar peça no estoque..."
          v-model="localFiltro"
        />
      </div>
      <button class="btn-success" @click="abrirFormulario(null)">
        <i class="fas fa-plus"></i> Nova Peça
      </button>
    </div>

    <div class="table-container" v-if="estoqueFiltrado.length > 0">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Quantidade</th>
            <th>Valor Unitário</th>
            <th>Fornecedor</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(p, idx) in estoqueFiltrado" :key="idx">
            <td>{{ p.nome }}</td>
            <td>{{ p.categoria }}</td>
            <td>{{ p.quantidade }}</td>
            <td>R$ {{ parseFloat(p.valor_unitario).toFixed(2) }}</td>
            <td>{{ p.fornecedor }}</td>
            <td class="actions">
              <button class="edit" @click="abrirFormulario(idx)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="delete" @click="deletarPeca(idx)">
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <transition name="fade">
      <div v-if="mostrarFormulario" class="cadastro-bloco">
        <h3>{{ indexEditando === null ? 'Nova Peça' : 'Editar Peça' }}</h3>
        <form @submit.prevent="salvarPeca">
          <div class="form-group">
            <label>Nome da Peça</label>
            <input type="text" v-model="formPeca.nome" required />
          </div>
          <div class="form-group">
            <label>Categoria</label>
            <input type="text" v-model="formPeca.categoria" required />
          </div>
          <div class="form-group">
            <label>Quantidade</label>
            <input type="number" min="0" v-model="formPeca.quantidade" required />
          </div>
          <div class="form-group">
            <label>Valor Unitário (R$)</label>
            <input type="number" min="0" step="0.01" v-model="formPeca.valor_unitario" required />
          </div>
          <div class="form-group">
            <label>Fornecedor</label>
            <input type="text" v-model="formPeca.fornecedor" />
          </div>
          <div class="form-group" style="grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 10px;">
            <button type="button" @click="cancelarFormulario" style="background: #95a5a6;">Cancelar</button>
            <button type="submit">{{ indexEditando === null ? 'Salvar' : 'Atualizar' }}</button>
          </div>
        </form>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'Estoque',
  data() {
    return {
      pecas: [],
      localFiltro: '',
      mostrarFormulario: false,
      indexEditando: null,
      formPeca: {
        nome: '',
        categoria: '',
        quantidade: 0,
        valor_unitario: 0,
        fornecedor: ''
      }
    };
  },
  computed: {
    estoqueFiltrado() {
      const termo = this.localFiltro.toLowerCase();
      return this.pecas.filter(p =>
        p.nome.toLowerCase().includes(termo) ||
        p.categoria.toLowerCase().includes(termo) ||
        p.fornecedor.toLowerCase().includes(termo)
      );
    }
  },
  methods: {
    abrirFormulario(index) {
      this.indexEditando = index;
      if (index === null) {
        this.formPeca = {
          nome: '',
          categoria: '',
          quantidade: 0,
          valor_unitario: 0,
          fornecedor: ''
        };
      } else {
        this.formPeca = { ...this.pecas[index] };
      }
      this.mostrarFormulario = true;
    },
    cancelarFormulario() {
      this.mostrarFormulario = false;
    },
    salvarPeca() {
      if (this.indexEditando === null) {
        this.pecas.push({ ...this.formPeca });
      } else {
        this.pecas[this.indexEditando] = { ...this.formPeca };
      }
      this.cancelarFormulario();
    },
    deletarPeca(index) {
      if (confirm('Deseja excluir esta peça do estoque?')) {
        this.pecas.splice(index, 1);
      }
    }
  }
};
</script>

<style scoped>
/* Herda os estilos globais do sistema para manter consistência visual */
</style>
