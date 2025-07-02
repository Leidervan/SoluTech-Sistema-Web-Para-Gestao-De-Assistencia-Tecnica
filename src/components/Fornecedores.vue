<template>
  <div class="section-content">
    <div class="filter-row">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="text"
          placeholder="Buscar fornecedor..."
          v-model="localFiltro"
        />
      </div>
      <button class="btn-success" @click="abrirFormulario(null)">
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
            <th>Cidade</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(f, idx) in fornecedoresFiltrados" :key="idx">
            <td>{{ f.nome }}</td>
            <td>{{ f.cnpj }}</td>
            <td>{{ f.telefone }}</td>
            <td>{{ f.cidade }}</td>
            <td class="actions">
              <button class="edit" @click="abrirFormulario(idx)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="delete" @click="deletarFornecedor(idx)">
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <transition name="fade">
      <div v-if="mostrarFormulario" class="cadastro-bloco">
        <h3>{{ indexEditando === null ? 'Novo Fornecedor' : 'Editar Fornecedor' }}</h3>
        <form @submit.prevent="salvarFornecedor">
          <div class="form-group">
            <label>Nome</label>
            <input type="text" v-model="formFornecedor.nome" required />
          </div>
          <div class="form-group">
            <label>CNPJ</label>
            <input type="text" v-model="formFornecedor.cnpj" placeholder="00.000.000/0000-00" required />
          </div>
          <div class="form-group">
            <label>Telefone</label>
            <input type="text" v-model="formFornecedor.telefone" placeholder="(00) 0000-0000" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="formFornecedor.email" />
          </div>
          <div class="form-group">
            <label>Cidade</label>
            <input type="text" v-model="formFornecedor.cidade" required />
          </div>
          <div class="form-group">
            <label>Estado</label>
            <input type="text" v-model="formFornecedor.estado" required />
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
  name: 'Fornecedores',
  data() {
    return {
      fornecedores: [],
      localFiltro: '',
      mostrarFormulario: false,
      indexEditando: null,
      formFornecedor: {
        nome: '',
        cnpj: '',
        telefone: '',
        email: '',
        cidade: '',
        estado: ''
      }
    };
  },
  computed: {
    fornecedoresFiltrados() {
      const termo = this.localFiltro.toLowerCase();
      return this.fornecedores.filter(f =>
        f.nome.toLowerCase().includes(termo) ||
        f.cnpj.includes(termo) ||
        f.cidade.toLowerCase().includes(termo)
      );
    }
  },
  methods: {
    abrirFormulario(index) {
      this.indexEditando = index;
      if (index === null) {
        this.formFornecedor = {
          nome: '',
          cnpj: '',
          telefone: '',
          email: '',
          cidade: '',
          estado: ''
        };
      } else {
        this.formFornecedor = { ...this.fornecedores[index] };
      }
      this.mostrarFormulario = true;
    },
    cancelarFormulario() {
      this.mostrarFormulario = false;
    },
    salvarFornecedor() {
      if (this.indexEditando === null) {
        this.fornecedores.push({ ...this.formFornecedor });
      } else {
        this.fornecedores[this.indexEditando] = { ...this.formFornecedor };
      }
      this.cancelarFormulario();
    },
    deletarFornecedor(index) {
      if (confirm('Deseja excluir este fornecedor?')) {
        this.fornecedores.splice(index, 1);
      }
    }
  }
};
</script>

<style scoped>
/* Utilize seu CSS global para manter a consistência visual */
</style>