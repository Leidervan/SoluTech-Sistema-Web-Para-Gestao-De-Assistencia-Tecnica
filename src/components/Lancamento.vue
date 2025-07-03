<template>
  <div class="section-content">
    <div class="filter-row">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="text"
          placeholder="Buscar reparo..."
          v-model="localFiltro"
        />
      </div>
      <button class="btn-success" @click="abrirFormulario(null)">
        <i class="fas fa-plus"></i> Novo Reparo
      </button>
    </div>

    <div class="table-container" v-if="reparosFiltrados.length > 0">
      <table class="data-table">
        <thead>
          <tr>
            <th>OS</th>
            <th>Cliente</th>
            <th>Equipamento</th>
            <th>Início</th>
            <th>Fim</th>
            <th>Responsável</th>
            <th>Situação</th>
            <th>Valor Final</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, idx) in reparosFiltrados" :key="idx">
            <td>{{ r.ordem_servico }}</td>
            <td>{{ r.nome_cliente }}</td>
            <td>{{ r.nome_equipamento }}</td>
            <td>{{ r.data_hora_inicio }}</td>
            <td>{{ r.data_hora_fim }}</td>
            <td>{{ r.responsavel }}</td>
            <td>{{ r.situacao }}</td>
            <td>R$ {{ parseFloat(r.valor_final).toFixed(2) }}</td>
            <td class="actions">
              <button class="view" @click="visualizarReparo(idx)">
                <i class="fas fa-eye"></i>
              </button>
              <button class="edit" @click="abrirFormulario(idx)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="delete" @click="deletarReparo(idx)">
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Formulário de Cadastro -->
    <transition name="fade">
      <div v-if="mostrarFormulario" class="cadastro-bloco">
        <h3>{{ indexEditando === null ? 'Novo Reparo' : 'Editar Reparo' }}</h3>
        <form @submit.prevent="salvarReparo">
          <div class="form-group">
            <label>Número da OS</label>
            <input type="text" v-model="formReparo.ordem_servico" required />
          </div>
          <div class="form-group">
            <label>Data e Hora de Início</label>
            <input type="datetime-local" v-model="formReparo.data_hora_inicio" required />
          </div>
          <div class="form-group">
            <label>Nome do Cliente</label>
            <input type="text" v-model="formReparo.nome_cliente" required />
          </div>
          <div class="form-group">
            <label>Nome do Equipamento</label>
            <input type="text" v-model="formReparo.nome_equipamento" required />
          </div>
          <div class="form-group">
            <label>Peças Usadas</label>
            <input type="text" v-model="formReparo.pecas_utilizadas" placeholder="Ex: Placa Mãe, Fonte..." />
          </div>
          <div class="form-group">
            <label>Quantidade de Peças</label>
            <input type="number" min="0" v-model="formReparo.quantidade" />
          </div>
          <div class="form-group">
            <label>Valor Final (R$)</label>
            <input type="number" min="0" step="0.01" v-model="formReparo.valor_final" />
          </div>
          <div class="form-group">
            <label>Responsável</label>
            <input type="text" v-model="formReparo.responsavel" required />
          </div>
          <div class="form-group">
            <label>Data e Hora de Término</label>
            <input type="datetime-local" v-model="formReparo.data_hora_fim" />
          </div>
          <div class="form-group">
            <label>Situação Atual</label>
            <select v-model="formReparo.situacao" required>
              <option value="">Selecione</option>
              <option>Em andamento</option>
              <option>Finalizado</option>
              <option>Cancelado</option>
            </select>
          </div>
          <div class="form-group" style="grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 10px;">
            <button type="button" @click="cancelarFormulario" style="background: #95a5a6;">Cancelar</button>
            <button type="submit">{{ indexEditando === null ? 'Salvar' : 'Atualizar' }}</button>
          </div>
        </form>
      </div>
    </transition>

    <!-- Visualização de Reparo -->
    <transition name="fade">
      <div v-if="reparoVisualizando !== null" class="cadastro-bloco">
        <h3>Detalhes do Reparo</h3>
        <div class="form-view">
          <p><strong>OS:</strong> {{ reparoVisualizando.ordem_servico }}</p>
          <p><strong>Início:</strong> {{ reparoVisualizando.data_hora_inicio }}</p>
          <p><strong>Fim:</strong> {{ reparoVisualizando.data_hora_fim }}</p>
          <p><strong>Cliente:</strong> {{ reparoVisualizando.nome_cliente }}</p>
          <p><strong>Equipamento:</strong> {{ reparoVisualizando.nome_equipamento }}</p>
          <p><strong>Peças Usadas:</strong> {{ reparoVisualizando.pecas_utilizadas }}</p>
          <p><strong>Quantidade:</strong> {{ reparoVisualizando.quantidade }}</p>
          <p><strong>Valor Final:</strong> R$ {{ parseFloat(reparoVisualizando.valor_final).toFixed(2) }}</p>
          <p><strong>Responsável:</strong> {{ reparoVisualizando.responsavel }}</p>
          <p><strong>Situação:</strong> {{ reparoVisualizando.situacao }}</p>
          <div style="text-align: right;">
            <button @click="reparoVisualizando = null" style="background: #95a5a6;">Fechar</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'Reparos',
  data() {
    return {
      reparos: [],
      localFiltro: '',
      mostrarFormulario: false,
      reparoVisualizando: null,
      indexEditando: null,
      formReparo: {
        ordem_servico: '',
        data_hora_inicio: '',
        nome_cliente: '',
        nome_equipamento: '',
        pecas_utilizadas: '',
        quantidade: 0,
        valor_final: 0,
        responsavel: '',
        data_hora_fim: '',
        situacao: ''
      }
    };
  },
  computed: {
    reparosFiltrados() {
      const termo = this.localFiltro.toLowerCase();
      return this.reparos.filter(r =>
        r.ordem_servico.toLowerCase().includes(termo) ||
        r.nome_cliente.toLowerCase().includes(termo) ||
        r.nome_equipamento.toLowerCase().includes(termo) ||
        r.situacao.toLowerCase().includes(termo)
      );
    }
  },
  methods: {
    abrirFormulario(index) {
      this.indexEditando = index;
      this.reparoVisualizando = null;
      if (index === null) {
        this.formReparo = {
          ordem_servico: '',
          data_hora_inicio: '',
          nome_cliente: '',
          nome_equipamento: '',
          pecas_utilizadas: '',
          quantidade: 0,
          valor_final: 0,
          responsavel: '',
          data_hora_fim: '',
          situacao: ''
        };
      } else {
        this.formReparo = { ...this.reparos[index] };
      }
      this.mostrarFormulario = true;
    },
    cancelarFormulario() {
      this.mostrarFormulario = false;
    },
    salvarReparo() {
      if (this.indexEditando === null) {
        this.reparos.push({ ...this.formReparo });
      } else {
        this.reparos[this.indexEditando] = { ...this.formReparo };
      }
      this.cancelarFormulario();
    },
    deletarReparo(index) {
      if (confirm('Deseja realmente excluir este reparo?')) {
        this.reparos.splice(index, 1);
      }
    },
    visualizarReparo(index) {
      this.reparoVisualizando = { ...this.reparos[index] };
      this.mostrarFormulario = false;
    }
  }
};
</script>

<style scoped>
/* Aproveite os estilos existentes */
</style>
