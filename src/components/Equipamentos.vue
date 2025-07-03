<template>
  <div class="section-content">
    <div class="filter-row">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="text"
          placeholder="Buscar equipamento..."
          v-model="localFiltro"
        />
      </div>
      <button class="btn-success" @click="abrirCadastro(null)">
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
            <th>Cliente</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(e, idx) in equipamentosFiltrados" :key="idx">
            <td>{{ e.tipo }}</td>
            <td>{{ e.marca }}</td>
            <td>{{ e.modelo }}</td>
            <td>{{ e.numero_serie }}</td>
            <td>{{ e.nome_cliente }}</td>
            <td class="actions">
              <button class="edit" @click="abrirCadastro(idx)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="delete" @click="deletarEquipamento(idx)">
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <transition name="fade">
      <div v-if="mostrarFormulario" class="cadastro-bloco">
        <h3>{{ indexEditando === null ? 'Novo Equipamento' : 'Editar Equipamento' }}</h3>
        <form @submit.prevent="salvarEquipamento">
          <div class="form-group">
            <label for="tipo">Tipo</label>
            <input type="text" id="tipo" v-model="formEquipamento.tipo" required />
          </div>
          <div class="form-group">
            <label for="marca">Marca</label>
            <input type="text" id="marca" v-model="formEquipamento.marca" required />
          </div>
          <div class="form-group">
            <label for="modelo">Modelo</label>
            <input type="text" id="modelo" v-model="formEquipamento.modelo" required />
          </div>
          <div class="form-group">
            <label for="numero_serie">Número de Série</label>
            <input type="text" id="numero_serie" v-model="formEquipamento.numero_serie" required />
          </div>
          <div class="form-group">
            <label for="nome_cliente">Nome do Cliente</label>
            <input type="text" id="nome_cliente" v-model="formEquipamento.nome_cliente" required />
          </div>
          <div class="form-group" style="grid-column: 1 / -1; display: flex; gap: 10px; justify-content: flex-end;">
            <button type="button" @click="cancelarFormulario" style="background: #95a5a6;">
              Cancelar
            </button>
            <button type="submit">
              {{ indexEditando === null ? 'Salvar' : 'Atualizar' }}
            </button>
          </div>
        </form>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'Equipamentos',
  data() {
    return {
      equipamentos: [],
      localFiltro: '',
      mostrarFormulario: false,
      indexEditando: null,
      formEquipamento: {
        tipo: '',
        marca: '',
        modelo: '',
        numero_serie: '',
        nome_cliente: ''
      }
    };
  },
  computed: {
    equipamentosFiltrados() {
      const termo = this.localFiltro.toLowerCase();
      return this.equipamentos.filter(e =>
        e.tipo.toLowerCase().includes(termo) ||
        e.marca.toLowerCase().includes(termo) ||
        e.modelo.toLowerCase().includes(termo) ||
        e.numero_serie.toLowerCase().includes(termo) ||
        e.nome_cliente.toLowerCase().includes(termo)
      );
    }
  },
  methods: {
    abrirCadastro(index) {
      this.indexEditando = index;
      if (index === null) {
        this.formEquipamento = {
          tipo: '',
          marca: '',
          modelo: '',
          numero_serie: '',
          nome_cliente: ''
        };
      } else {
        this.formEquipamento = { ...this.equipamentos[index] };
      }
      this.mostrarFormulario = true;
    },
    cancelarFormulario() {
      this.mostrarFormulario = false;
    },
    salvarEquipamento() {
      if (this.indexEditando === null) {
        this.equipamentos.push({ ...this.formEquipamento });
      } else {
        this.equipamentos[this.indexEditando] = { ...this.formEquipamento };
      }
      this.cancelarFormulario();
    },
    deletarEquipamento(index) {
      if (confirm('Deseja realmente excluir este equipamento?')) {
        this.equipamentos.splice(index, 1);
      }
    }
  }
};
</script>

<style scoped>
/* Use as mesmas classes visuais da tela Clientes.vue */
</style>
