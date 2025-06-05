<template>
  <div class="section-content">
    <div class="filter-row">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="text"
          placeholder="Buscar cliente..."
          v-model="localFiltro"
          @input="$emit('update:filtroCliente', localFiltro)"
        />
      </div>
      <button class="btn-success" @click="$emit('edit-cliente', null)">
        <i class="fas fa-plus"></i> Novo Cliente
      </button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>Telefone</th>
            <th>Cidade</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(c, idx) in clientesFiltrados" :key="idx">
            <td>{{ c.nome }} {{ c.sobrenome }}</td>
            <td>{{ formatarCPF(c.cpf) }}</td>
            <td>{{ c.celular }}</td>
            <td>{{ c.cidade }}/{{ c.estado }}</td>
            <td class="actions">
              <button class="edit" @click="$emit('edit-cliente', idx)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="delete" @click="$emit('delete-cliente', idx)">
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <transition name="fade">
      <div v-if="showCadastroCliente" class="cadastro-bloco">
        <h3>{{ editingIndex === null ? 'Novo Cliente' : 'Editar Cliente' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="nome">Nome</label>
            <input type="text" id="nome" v-model="formCliente.nome" required />
          </div>
          <div class="form-group">
            <label for="sobrenome">Sobrenome</label>
            <input type="text" id="sobrenome" v-model="formCliente.sobrenome" required />
          </div>
          <div class="form-group">
            <label for="cpf">CPF</label>
            <input
              type="text"
              id="cpf"
              v-model="formCliente.cpf"
              @input="mascararCPF"
              maxlength="14"
              placeholder="000.000.000-00"
              required
              pattern="\d{3}\.\d{3}\.\d{3}-\d{2}"
              title="Digite um CPF no formato 000.000.000-00"
            />
          </div>
          <div class="form-group">
            <label for="rg">RG</label>
            <input type="text" id="rg" v-model="formCliente.rg" required />
          </div>
          <div class="form-group">
            <label for="sexo">Sexo</label>
            <select id="sexo" v-model="formCliente.sexo" required>
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
              pattern="\(\d{2}\)\s?\d{4}-\d{4}"
              title="Formato esperado: (99) 9999-9999"
            />
          </div>
          <div class="form-group">
            <label for="celular">Telefone Celular</label>
            <input
              type="text"
              id="celular"
              v-model="formCliente.celular"
              @input="mascararTelefone('celular')"
              placeholder="(11) 91234-5678"
              required
              pattern="\(\d{2}\)\s?9\d{4}-\d{4}"
              title="Formato esperado: (99) 91234-5678"
            />
          </div>
          <div class="form-group">
            <label for="data_nascimento">Data de Nascimento</label>
            <input
              type="date"
              id="data_nascimento"
              v-model="formCliente.data_nascimento"
              @change="calcularIdade"
              required
            />
          </div>
          <div class="form-group">
            <label for="idade">Idade</label>
            <input type="number" id="idade" v-model="formCliente.idade" readonly />
          </div>
          <div class="form-group">
            <label for="rua">Rua</label>
            <input type="text" id="rua" v-model="formCliente.rua" required />
          </div>
          <div class="form-group">
            <label for="bairro">Bairro</label>
            <input type="text" id="bairro" v-model="formCliente.bairro" required />
          </div>
          <div class="form-group">
            <label for="numero_residencia">Número</label>
            <input type="text" id="numero_residencia" v-model="formCliente.numero_residencia" required />
          </div>
          <div class="form-group">
            <label for="cidade">Cidade</label>
            <input type="text" id="cidade" v-model="formCliente.cidade" required />
          </div>
          <div class="form-group">
            <label for="estado">Estado</label>
            <input type="text" id="estado" v-model="formCliente.estado" required />
          </div>
          <div class="form-group">
            <label for="pais">País</label>
            <input type="text" id="pais" v-model="formCliente.pais" required />
          </div>
          <div
            class="form-group"
            style="grid-column: 1 / -1; display: flex; gap: 10px; justify-content: flex-end;"
          >
            <button type="button" @click="$emit('cancel-cliente')" style="background: #95a5a6;">
              Cancelar
            </button>
            <button type="submit">
              {{ editingIndex === null ? 'Salvar Cliente' : 'Atualizar Cliente' }}
            </button>
          </div>
        </form>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'Clientes',
  props: {
    clientes: { type: Array, default: () => [] },
    filtroCliente: { type: String, default: '' },
    showCadastroCliente: { type: Boolean, default: false },
    formCliente: { type: Object, required: true },
    editingIndex: { type: [Number, null], default: null },
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
      return this.clientes.filter((c) => {
        const termo = this.localFiltro.toLowerCase();
        return (
          c.nome.toLowerCase().includes(termo) ||
          c.sobrenome.toLowerCase().includes(termo) ||
          c.cpf.includes(this.localFiltro)
        );
      });
    },
  },
  methods: {
    mascararCPF(e) {
      let v = this.formCliente.cpf.replace(/\D/g, '').slice(0, 11);
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      this.formCliente.cpf = v;
    },
    mascararTelefone(campo) {
      let v = this.formCliente[campo].replace(/\D/g, '').slice(0, 11);
      if (v.length <= 10) {
        v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      } else {
        v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
      }
      this.formCliente[campo] = v.trim().replace(/[- ]+$/, '');
    },
    formatarCPF(cpf) {
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
    handleSubmit() {
      this.$emit('save-cliente');
    },
  },
};
</script>

<style scoped>
/* A maior parte do CSS permanece em styles.css global */
</style>
