<template>
  <div class="orcamento-container">
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar Orçamento"
        @keyup.enter="buscarOrcamento"
      />
      <button class="btn-search" @click="buscarOrcamento">Buscar</button>
    </div>

    <!-- Preview de Orçamento Encontrado -->
    <div v-if="orcamentoEncontrado" class="card preview-card">
      <h2>Orçamento Encontrado</h2>
      <p><strong>Cliente:</strong> {{ orcamentoEncontrado.cliente }}</p>
      <p><strong>Documento:</strong> {{ orcamentoEncontrado.documento }}</p>
      <p><strong>Endereço:</strong> {{ orcamentoEncontrado.rua }}, {{ orcamentoEncontrado.bairro }}, {{ orcamentoEncontrado.cidade }} - {{ orcamentoEncontrado.estado }}, {{ orcamentoEncontrado.cep }}</p>
      <p><strong>Telefone:</strong> {{ orcamentoEncontrado.telefone }}</p>
      <p><strong>Email:</strong> {{ orcamentoEncontrado.email }}</p>
      <p><strong>Itens:</strong></p>
      <ul>
        <li v-for="(item, idx) in orcamentoEncontrado.itens" :key="idx">
          {{ item.descricao }} - {{ item.quantidade }} x {{ formatCurrency(item.valorUnitario) }} = {{ formatCurrency(item.quantidade * item.valorUnitario) }}
        </li>
      </ul>
      <p><strong>Total:</strong> {{ formatCurrency(totalPreview) }}</p>
      <p><strong>Validade:</strong> {{ orcamentoEncontrado.validade }}</p>
      <p><strong>Prazo de Reparo:</strong> {{ orcamentoEncontrado.prazoReparo }} dias úteis</p>
      <p><strong>Prazo de Entrega:</strong> {{ orcamentoEncontrado.prazoEntrega }} dias úteis</p>
      <p><strong>Data de Emissão:</strong> {{ orcamentoEncontrado.emissao }}</p>
      <button class="btn-edit" @click="editarOrcamento">Editar</button>
    </div>

    <h1>Orçamento</h1>
    <div class="card cliente-card">
      <h2>Dados do Cliente</h2>
      <div class="form-grid">
        <div class="form-group">
          <label for="cliente">Cliente</label>
          <input id="cliente" v-model="form.cliente" type="text" placeholder="Nome do cliente" required />
        </div>
        <div class="form-group">
          <label for="documento">CNPJ ou CPF</label>
          <input
            id="documento"
            v-model="form.documento"
            @input="validateDocumento"
            type="text"
            placeholder="00.000.000/0000-00 ou 000.000.000-00"
            required
          />
        </div>
        <div class="form-group full-width">
          <label>Endereço Completo</label>
          <div class="address-group">
            <input v-model="form.rua" type="text" placeholder="Rua" />
            <input v-model="form.bairro" type="text" placeholder="Bairro" />
            <input v-model="form.cidade" type="text" placeholder="Cidade" />
            <select v-model="form.estado">
              <option disabled value="">Estado</option>
              <option v-for="uf in estados" :key="uf" :value="uf">{{ uf }}</option>
            </select>
            <input v-model="form.cep" type="text" placeholder="CEP" />
          </div>
        </div>
        <div class="form-group">
          <label for="telefone">Telefone</label>
          <input id="telefone" v-model="form.telefone" type="text" placeholder="(00) 00000-0000" />
        </div>
        <div class="form-group">
          <label for="email">E-mail</label>
          <input id="email" v-model="form.email" type="email" placeholder="email@exemplo.com" />
        </div>
      </div>
    </div>

    <div class="card itens-card">
      <h2>Itens de Orçamento</h2>
      <table>
        <thead>
          <tr>
            <th>Descrição do serviço</th>
            <th>Quantidade</th>
            <th>Valor unitário</th>
            <th>Valor total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in form.itens" :key="idx">
            <td><input v-model="item.descricao" type="text" /></td>
            <td><input v-model.number="item.quantidade" type="number" min="1" /></td>
            <td><input v-model.number="item.valorUnitario" type="number" step="0.01" /></td>
            <td>{{ formatCurrency(item.quantidade * item.valorUnitario) }}</td>
            <td><button class="btn-remove" @click="removeItem(idx)">✕</button></td>
          </tr>
        </tbody>
      </table>
      <button class="btn-add" @click="addItem">+ Adicionar Item</button>
      <div class="total-geral">
        <span>Total Geral:</span>
        <strong>{{ formatCurrency(totalGeral) }}</strong>
      </div>
    </div>

    <div class="card info-card">
      <h2>Informações Adicionais</h2>
      <div class="form-grid">
        <div class="form-group">
          <label for="validade">Validade da Proposta</label>
          <input id="validade" v-model="form.validade" type="date" />
        </div>
        <div class="form-group">
          <label for="prazoReparo">Prazo para reparo (dias úteis)</label>
          <input id="prazoReparo" v-model.number="form.prazoReparo" type="number" min="1" />
        </div>
        <div class="form-group">
          <label for="prazoEntrega">Prazo de entrega (dias úteis)</label>
          <input id="prazoEntrega" v-model.number="form.prazoEntrega" type="number" min="1" />
        </div>
        <div class="form-group">
          <label for="emissao">Data de emissão do Orçamento</label>
          <input id="emissao" v-model="form.emissao" type="date" disabled />
        </div>
      </div>
    </div>

    <button class="btn-submit" @click="salvarOrcamento">Salvar</button>
  </div>
</template>

<script>
export default {
  name: 'Orcamento',
  data() {
    return {
      estados: ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'],
      searchQuery: '',
      orcamentoEncontrado: null,
      form: {
        cliente: '',
        documento: '',
        rua: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        telefone: '',
        email: '',
        itens: [{ descricao: '', quantidade: 1, valorUnitario: 0 }],
        validade: '',
        prazoReparo: 1,
        prazoEntrega: 1,
        emissao: new Date().toISOString().substr(0, 10)
      }
    }
  },
  computed: {
    totalGeral() {
      return this.form.itens.reduce((sum, item) => sum + (item.quantidade * item.valorUnitario), 0)
    },
    totalPreview() {
      if (!this.orcamentoEncontrado) return 0;
      return this.orcamentoEncontrado.itens.reduce((sum, item) => sum + (item.quantidade * item.valorUnitario), 0)
    }
  },
  methods: {
    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    },
    addItem() {
      this.form.itens.push({ descricao: '', quantidade: 1, valorUnitario: 0 })
    },
    removeItem(idx) {
      this.form.itens.splice(idx, 1)
    },
    validateDocumento() {
      // Implementar validação de CNPJ/CPF
    },
    salvarOrcamento() {
      if (!this.form.cliente || !this.form.documento) {
        alert('Preencha os campos obrigatórios: Cliente e Documento.');
        return;
      }
      this.$emit('save-orcamento', { ...this.form });
      this.resetForm();
      alert('Orçamento salvo com sucesso!');
    },
    resetForm() {
      this.form = {
        cliente: '',
        documento: '',
        rua: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        telefone: '',
        email: '',
        itens: [{ descricao: '', quantidade: 1, valorUnitario: 0 }],
        validade: '',
        prazoReparo: 1,
        prazoEntrega: 1,
        emissao: new Date().toISOString().substr(0, 10)
      };
    },
    buscarOrcamento() {
      // Exemplo: busca via API retorna objeto
      // Aqui usamos mockup de retorno
      const mock = {
        cliente: 'Empresa Exemplo',
        documento: '12.345.678/0001-99',
        rua: 'Rua A',
        bairro: 'Bairro B',
        cidade: 'Cidade C',
        estado: 'SP',
        cep: '12345-678',
        telefone: '(11) 99999-0000',
        email: 'contato@exemplo.com',
        itens: [
          { descricao: 'Serviço 1', quantidade: 2, valorUnitario: 150.0 },
          { descricao: 'Serviço 2', quantidade: 1, valorUnitario: 300.0 }
        ],
        validade: '2025-07-10',
        prazoReparo: 5,
        prazoEntrega: 7,
        emissao: '2025-07-03'
      };
      this.orcamentoEncontrado = mock;
    },
    editarOrcamento() {
      if (!this.orcamentoEncontrado) return;
      this.form = JSON.parse(JSON.stringify(this.orcamentoEncontrado));
    }
  }
}
</script>

<style scoped>
.orcamento-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: Arial, sans-serif;
  color: #333;
}
.search-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}
.search-bar input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px 0 0 4px;
  flex: 1;
}
.btn-search, .btn-edit {
  background: #1e3a8a;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  margin-left: 0.5rem;
}
.btn-search:hover, .btn-edit:hover {
  background: #162a6b;
}
.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}
.preview-card {
  border-left: 4px solid #1e3a8a;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group.full-width {
  grid-column: span 2;
}
.address-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
}
input, select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}
th, td {
  border-bottom: 1px solid #eee;
  padding: 0.75rem;
  text-align: left;
}
th {
  background: #f9f9f9;
}
.btn-add, .btn-submit {
  background: #1e3a8a;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 1rem;
}
.btn-add:hover, .btn-submit:hover {
  background: #162a6b;
}
.btn-remove {
  background: transparent;
  border: none;
  color: #e11d48;
  cursor: pointer;
  font-size: 1.2rem;
}
.total-geral {
  display: flex;
  justify-content: flex-end;
  font-size: 1.2rem;
  margin-top: 0.5rem;
}
</style>
