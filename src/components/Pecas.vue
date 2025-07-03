<template>
  <div class="section-content">
    <div class="filter-row">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="text"
          placeholder="Buscar peça..."
          v-model="localFiltro"
          @input="$emit('update:filtroPeca', localFiltro)"
        />
      </div>
      <button class="btn-success" @click="$emit('edit-peca', null)">
        <i class="fas fa-plus"></i> Nova Peça
      </button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Fabricante</th>
            <th>Quantidade</th>
            <th>Preço</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(p, idx) in pecasFiltradas" :key="idx">
            <td>{{ p.peca }}</td>
            <td>{{ p.fabricante }}</td>
            <td>{{ p.quantidade }}</td>
            <td>R$ {{ p.preco.toFixed(2) }}</td>
            <td class="actions">
              <button class="edit" @click="abrirModalAutenticacao('edit', idx)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="delete" @click="abrirModalAutenticacao('delete', idx)">
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de Autenticação -->
    <div class="modal-overlay" v-if="mostrarModal">
      <div class="modal">
        <h3>Autenticação de Administrador</h3>
        <label>Usuário</label>
        <input type="text" v-model="usuario" placeholder="Usuário" />
        <label>Senha</label>
        <input type="password" v-model="senha" placeholder="Senha" />
        <div class="modal-actions">
          <button @click="cancelarModal" class="btn-cancelar">Cancelar</button>
          <button @click="confirmarAutenticacao" class="btn-confirmar">Confirmar</button>
        </div>
      </div>
    </div>

    <!-- Formulário de Cadastro -->
    <transition name="fade">
      <div v-if="showCadastroPeca" class="cadastro-bloco">
        <h3>{{ editingIndex === null ? 'Nova Peça' : 'Editar Peça' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="peca">Nome da Peça</label>
            <input type="text" id="peca" v-model="formPeca.peca" required />
          </div>
          <div class="form-group">
            <label for="fabricante">Fabricante</label>
            <input type="text" id="fabricante" v-model="formPeca.fabricante" required />
          </div>
          <div class="form-group">
            <label for="local_fabricacao">Local de Fabricação</label>
            <input type="text" id="local_fabricacao" v-model="formPeca.local_fabricacao" required />
          </div>
          <div class="form-group">
            <label for="peso">Peso da Peça (kg)</label>
            <input type="number" id="peso" v-model="formPeca.peso" required step="0.01" />
          </div>
          <div class="form-group">
            <label for="quantidade">Quantidade</label>
            <input type="number" id="quantidade" v-model="formPeca.quantidade" required min="1" />
          </div>
          <div class="form-group">
            <label for="preco">Preço</label>
            <input type="number" id="preco" v-model="formPeca.preco" required step="0.01" />
          </div>
          <div
            class="form-group"
            style="grid-column: 1 / -1; display: flex; gap: 10px; justify-content: flex-end;"
          >
            <button type="button" @click="$emit('cancel-peca')" style="background: #95a5a6;">
              Cancelar
            </button>
            <button type="submit">
              {{ editingIndex === null ? 'Salvar Peça' : 'Atualizar Peça' }}
            </button>
          </div>
        </form>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'Pecas',
  props: {
    pecas: { type: Array, default: () => [] },
    filtroPeca: { type: String, default: '' },
    showCadastroPeca: { type: Boolean, default: false },
    formPeca: { type: Object, required: true },
    editingIndex: { type: [Number, null], default: null },
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
      return this.pecas.filter((p) => {
        const termo = this.localFiltro.toLowerCase();
        return (
          p.peca.toLowerCase().includes(termo) ||
          p.fabricante.toLowerCase().includes(termo)
        );
      });
    },
  },
  methods: {
    handleSubmit() {
      this.$emit('save-peca');
    },
    abrirModalAutenticacao(acao, index) {
      this.acaoSolicitada = acao;
      this.indexAlvo = index;
      this.usuario = '';
      this.senha = '';
      this.mostrarModal = true;
    },
    cancelarModal() {
      this.mostrarModal = false;
    },
    confirmarAutenticacao() {
      if (this.usuario === 'admin' && this.senha === '1234') {
        if (this.acaoSolicitada === 'edit') {
          this.$emit('edit-peca', this.indexAlvo);
        } else if (this.acaoSolicitada === 'delete') {
          this.$emit('delete-peca', this.indexAlvo);
        }
        this.cancelarModal();
      } else {
        alert('Usuário ou senha incorretos.');
      }
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 25px;
  border-radius: 10px;
  width: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.modal h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
}

.modal input {
  width: 100%;
  padding: 8px;
  margin-bottom: 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancelar {
  background: #ccc;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
}

.btn-confirmar {
  background: #2ecc71;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
}
</style>
