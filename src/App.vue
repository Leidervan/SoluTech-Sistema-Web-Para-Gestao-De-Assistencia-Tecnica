<template>
  <div class="app-container">
    <Sidebar
      :collapsed="isSidebarCollapsed"
      :current-page="currentPage"
      @toggle-sidebar="toggleSidebar"
      @change-page="changePage"
    />
    <div class="content-container" :class="{ 'content-expanded': isSidebarCollapsed }">
      <ContentHeader :title="pageTitle" :current-time="currentTime" />
      <AlertMessage
        v-if="showAlert"
        :type="alertType"
        :icon="alertIcon"
        :message="alertMessage"
      />
      <component
        :is="currentComponent"
        v-bind="componentProps"
        @update:filtroCliente="filtroCliente = $event"
        @update:filtroPeca="filtroPeca = $event"
        @update:filtroEquipamento="filtroEquipamento = $event"
        @update:filtroFornecedor="filtroFornecedor = $event"
        @update:filtroReparo="filtroReparo = $event"
        @update:filtroOrcamento="filtroOrcamento = $event"
        @save-cliente="salvarCliente"
        @edit-cliente="editarCliente"
        @delete-cliente="excluirCliente"
        @cancel-cliente="resetFormCliente"
        @save-peca="salvarPeca"
        @edit-peca="editarPeca"
        @delete-peca="excluirPeca"
        @cancel-peca="resetFormPeca"
        @save-equipamento="salvarEquipamento"
        @edit-equipamento="editarEquipamento"
        @delete-equipamento="excluirEquipamento"
        @cancel-equipamento="resetFormEquipamento"
        @save-fornecedor="salvarFornecedor"
        @edit-fornecedor="editarFornecedor"
        @delete-fornecedor="excluirFornecedor"
        @cancel-fornecedor="resetFormFornecedor"
        @save-orcamento="salvarOrcamento"
        @edit-orcamento="editarOrcamento"
        @delete-orcamento="excluirOrcamento"
        @cancel-orcamento="resetFormOrcamento"
        @save-reparo="salvarReparo"
        @edit-reparo="editarReparo"
        @delete-reparo="excluirReparo"
        @cancel-reparo="resetFormReparo"
        @update-peca-estoque="atualizarEstoquePeca"
      />
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import Sidebar from './components/Sidebar.vue';
import ContentHeader from './components/ContentHeader.vue';
import AlertMessage from './components/AlertMessage.vue';

import Dashboard from './components/Dashboard.vue';
import Clientes from './components/Clientes.vue';
import Pecas from './components/Pecas.vue';
import Fornecedores from './components/Fornecedores.vue';
import Equipamentos from './components/Equipamentos.vue';
import Orcamento from './components/Orcamento.vue';
import Lancamento from './components/Lancamento.vue';
import Estoque from './components/Estoque.vue';
import Relatorios from './components/Relatorios.vue';
import Config from './components/Config.vue';

// Importar API e composable
import { apiStore } from './stores/apiStore.js';
import { useApi } from './composables/useApi.js';

export default {
  name: 'App',
  components: {
    Sidebar,
    ContentHeader,
    AlertMessage,
    Dashboard,
    Clientes,
    Pecas,
    Fornecedores,
    Equipamentos,
    Orcamento,
    Lancamento,
    Estoque,
    Relatorios,
    Config,
  },
  setup() {
    const isSidebarCollapsed = ref(false);
    const currentPage = ref('dashboard');
    const currentTime = ref('');
    
    // API utilities
    const {
      showAlert,
      alertType,
      alertMessage,
      alertIcon,
      showAlertMessage,
      loadAllData,
      saveCliente,
      deleteCliente,
      savePeca,
      deletePeca,
      saveEquipamento,
      deleteEquipamento,
      saveFornecedor,
      deleteFornecedor,
      saveOrcamento,
      deleteOrcamento,
      saveReparo,
      deleteReparo,
    } = useApi();
    
    // Form states
    const showCadastroCliente = ref(false);
    const showCadastroPeca = ref(false);
    const showCadastroEquipamento = ref(false);
    const showCadastroFornecedor = ref(false);
    const showCadastroOrcamento = ref(false);
    const showCadastroReparo = ref(false);
    
    const editingClienteIndex = ref(null);
    const editingPecaIndex = ref(null);
    const editingEquipamentoIndex = ref(null);
    const editingFornecedorIndex = ref(null);
    const editingOrcamentoIndex = ref(null);
    const editingReparoIndex = ref(null);
    
    const filtroCliente = ref('');
    const filtroPeca = ref('');
    const filtroEquipamento = ref('');
    const filtroFornecedor = ref('');
    const filtroOrcamento = ref('');
    const filtroReparo = ref('');

    // Form data
    const formCliente = reactive({
      id: null,
      nome: '',
      sobrenome: '',
      cpf: '',
      rg: '',
      sexo: '',
      telefone: '',
      celular: '',
      data_nascimento: '',
      idade: '',
      rua: '',
      bairro: '',
      numero_residencia: '',
      cidade: '',
      estado: '',
      pais: '',
      email: '',
    });

    const formPeca = reactive({
      id: null,
      peca: '',
      fabricante: '',
      local_fabricacao: '',
      peso: '',
      quantidade: '',
      numero_serie: '',
      codigo_producao: '',
      preco: '',
      observacao: '',
    });

    const formEquipamento = reactive({
      id: null,
      tipo: '',
      marca: '',
      modelo: '',
      numero_serie: '',
      codigo_fabricacao: '',
      ano_fabricacao: new Date().getFullYear(),
      voltagem: '',
      amperagem: '',
    });

    const formFornecedor = reactive({
      id: null,
      nome: '',
      cnpj: '',
      inscricao_estadual: '',
      telefone: '',
      celular: '',
      email: '',
      numero: '',
      cep: '',
      bairro: '',
      cidade: '',
      estado: '',
      site: '',
      representante: '',
    });

    const formOrcamento = reactive({
      id: null,
      cliente: '',
      documento: '',
      telefone: '',
      email: '',
      rua: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      nome_equipamento: '',
      modelo: '',
      fabricante: '',
      ano_fabricacao: new Date().getFullYear(),
      itens: [{ descricao: '', quantidade: 1, valorUnitario: 0 }],
      desconto: 0,
      valor_sem_desconto: 0,
      valor_com_desconto: 0,
      forma_pagamento: '',
      prazo_entrega: '',
      validade: '',
      observacao: '',
      status: 'Pendente',
      data_emissao: new Date().toISOString().slice(0, 10),
    });

    const formReparo = reactive({
      id: null,
      ordem_servico: '',
      data_hora_inicio: '',
      nome_cliente: '',
      nome_equipamento: '',
      modelo: '',
      fabricante: '',
      pecas_utilizadas: '',
      quantidade: 0,
      valor_final: 0,
      responsavel: '',
      data_hora_fim: '',
      situacao: '',
    });

    // Page titles
    const titles = {
      dashboard: 'Dashboard',
      clientes: 'Clientes',
      equipamentos: 'Equipamentos',
      pecas: 'Peças',
      fornecedores: 'Fornecedores',
      orcamento: 'Orçamentos',
      lancamento: 'Reparos',
      estoque: 'Estoque',
      relatorios: 'Relatórios',
      config: 'Configurações',
    };
    const pageTitle = computed(() => titles[currentPage.value] || 'Sistema');

    const currentComponent = computed(() => {
      switch (currentPage.value) {
        case 'dashboard': return 'Dashboard';
        case 'clientes': return 'Clientes';
        case 'equipamentos': return 'Equipamentos';
        case 'pecas': return 'Pecas';
        case 'fornecedores': return 'Fornecedores';
        case 'orcamento': return 'Orcamento';
        case 'lancamento': return 'Lancamento';
        case 'estoque': return 'Estoque';
        case 'relatorios': return 'Relatorios';
        case 'config': return 'Config';
        default: return 'Dashboard';
      }
    });

    const componentProps = computed(() => {
      switch (currentPage.value) {
        case 'dashboard':
          return {
            clientes: apiStore.data.clientes,
            pecas: apiStore.data.pecas,
            reparos: apiStore.data.reparos,
            orcamentos: apiStore.data.orcamentos,
            equipamentos: apiStore.data.equipamentos,
            fornecedores: apiStore.data.fornecedores,
            loading: Object.values(apiStore.loading).some(l => l),
          };
        case 'clientes':
          return {
            clientes: apiStore.data.clientes,
            filtroCliente: filtroCliente.value,
            showCadastroCliente: showCadastroCliente.value,
            formCliente,
            editingIndex: editingClienteIndex.value,
            loading: apiStore.loading.clientes,
          };
        case 'pecas':
          return {
            pecas: apiStore.data.pecas,
            filtroPeca: filtroPeca.value,
            showCadastroPeca: showCadastroPeca.value,
            formPeca,
            editingIndex: editingPecaIndex.value,
            loading: apiStore.loading.pecas,
          };
        case 'equipamentos':
          return {
            equipamentos: apiStore.data.equipamentos,
            filtroEquipamento: filtroEquipamento.value,
            showCadastroEquipamento: showCadastroEquipamento.value,
            formEquipamento,
            editingIndex: editingEquipamentoIndex.value,
            loading: apiStore.loading.equipamentos,
          };
        case 'fornecedores':
          return {
            fornecedores: apiStore.data.fornecedores,
            filtroFornecedor: filtroFornecedor.value,
            showCadastroFornecedor: showCadastroFornecedor.value,
            formFornecedor,
            editingIndex: editingFornecedorIndex.value,
            loading: apiStore.loading.fornecedores,
          };
        case 'orcamento':
          return {
            orcamentos: apiStore.data.orcamentos,
            filtroOrcamento: filtroOrcamento.value,
            showCadastroOrcamento: showCadastroOrcamento.value,
            formOrcamento,
            editingIndex: editingOrcamentoIndex.value,
            loading: apiStore.loading.orcamentos,
          };
        case 'lancamento':
          return {
            reparos: apiStore.data.reparos,
            filtroReparo: filtroReparo.value,
            showCadastroReparo: showCadastroReparo.value,
            formReparo,
            editingIndex: editingReparoIndex.value,
            loading: apiStore.loading.reparos,
          };
        case 'estoque':
          return {
            pecas: apiStore.data.pecas,
            loading: apiStore.loading.pecas,
          };
        case 'relatorios':
          return {
            clientes: apiStore.data.clientes,
            equipamentos: apiStore.data.equipamentos,
            reparos: apiStore.data.reparos,
            orcamentos: apiStore.data.orcamentos,
            pecas: apiStore.data.pecas,
            fornecedores: apiStore.data.fornecedores,
          };
        case 'config':
          return {};
        default:
          return {};
      }
    });

    // ========== MÉTODOS ==========
    function toggleSidebar() {
      isSidebarCollapsed.value = !isSidebarCollapsed.value;
    }

    function changePage(page) {
      currentPage.value = page;
      resetForms();
    }

    function updateClock() {
      const now = new Date();
      currentTime.value = now.toLocaleString('pt-BR');
    }

    // ========== CLIENTES ==========
    async function salvarCliente() {
      try {
        await saveCliente(formCliente);
        resetFormCliente();
      } catch (error) {
        console.error('Erro ao salvar cliente:', error);
      }
    }

    function editarCliente(idx) {
      if (idx === null) {
        resetFormCliente();
        showCadastroCliente.value = true;
        editingClienteIndex.value = null;
      } else {
        const cliente = apiStore.data.clientes[idx];
        editingClienteIndex.value = idx;
        Object.assign(formCliente, cliente);
        showCadastroCliente.value = true;
      }
    }

    async function excluirCliente(idx) {
      const cliente = apiStore.data.clientes[idx];
      if (confirm('Tem certeza que deseja excluir este cliente?')) {
        try {
          await deleteCliente(cliente.id);
        } catch (error) {
          console.error('Erro ao excluir cliente:', error);
        }
      }
    }

    function resetFormCliente() {
      Object.assign(formCliente, {
        id: null,
        nome: '',
        sobrenome: '',
        cpf: '',
        rg: '',
        sexo: '',
        telefone: '',
        celular: '',
        data_nascimento: '',
        idade: '',
        rua: '',
        bairro: '',
        numero_residencia: '',
        cidade: '',
        estado: '',
        pais: '',
        email: '',
      });
      showCadastroCliente.value = false;
      editingClienteIndex.value = null;
    }

    // ========== PEÇAS ==========
    async function salvarPeca() {
      try {
        await savePeca(formPeca);
        resetFormPeca();
      } catch (error) {
        console.error('Erro ao salvar peça:', error);
      }
    }

    function editarPeca(idx) {
      if (idx === null) {
        resetFormPeca();
        showCadastroPeca.value = true;
        editingPecaIndex.value = null;
      } else {
        const peca = apiStore.data.pecas[idx];
        editingPecaIndex.value = idx;
        Object.assign(formPeca, peca);
        showCadastroPeca.value = true;
      }
    }

    async function excluirPeca(idx) {
      const peca = apiStore.data.pecas[idx];
      if (confirm('Tem certeza que deseja excluir esta peça?')) {
        try {
          await deletePeca(peca.id);
        } catch (error) {
          console.error('Erro ao excluir peça:', error);
        }
      }
    }

    function resetFormPeca() {
      Object.assign(formPeca, {
        id: null,
        peca: '',
        fabricante: '',
        local_fabricacao: '',
        peso: '',
        quantidade: '',
        numero_serie: '',
        codigo_producao: '',
        preco: '',
        observacao: '',
      });
      showCadastroPeca.value = false;
      editingPecaIndex.value = null;
    }

    // ========== EQUIPAMENTOS ==========
    async function salvarEquipamento() {
      try {
        await saveEquipamento(formEquipamento);
        resetFormEquipamento();
      } catch (error) {
        console.error('Erro ao salvar equipamento:', error);
      }
    }

    function editarEquipamento(idx) {
      if (idx === null) {
        resetFormEquipamento();
        showCadastroEquipamento.value = true;
        editingEquipamentoIndex.value = null;
      } else {
        const equipamento = apiStore.data.equipamentos[idx];
        editingEquipamentoIndex.value = idx;
        Object.assign(formEquipamento, {
          id: equipamento.id,
          tipo: equipamento.tipo || equipamento.nome_equipamento || '',
          marca: equipamento.marca || equipamento.fabricante || '',
          modelo: equipamento.modelo || '',
          numero_serie: equipamento.numero_serie || '',
          codigo_fabricacao: equipamento.codigo_fabricacao || '',
          ano_fabricacao: equipamento.ano_fabricacao || new Date().getFullYear(),
          voltagem: equipamento.voltagem || '',
          amperagem: equipamento.amperagem || '',
        });
        showCadastroEquipamento.value = true;
      }
    }

    async function excluirEquipamento(idx) {
      const equipamento = apiStore.data.equipamentos[idx];
      if (confirm('Tem certeza que deseja excluir este equipamento?')) {
        try {
          await deleteEquipamento(equipamento.id);
        } catch (error) {
          console.error('Erro ao excluir equipamento:', error);
        }
      }
    }

    function resetFormEquipamento() {
      Object.assign(formEquipamento, {
        id: null,
        tipo: '',
        marca: '',
        modelo: '',
        numero_serie: '',
        codigo_fabricacao: '',
        ano_fabricacao: new Date().getFullYear(),
        voltagem: '',
        amperagem: '',
      });
      showCadastroEquipamento.value = false;
      editingEquipamentoIndex.value = null;
    }

    // ========== FORNECEDORES ==========
    async function salvarFornecedor() {
      try {
        await saveFornecedor(formFornecedor);
        resetFormFornecedor();
      } catch (error) {
        console.error('Erro ao salvar fornecedor:', error);
      }
    }

    function editarFornecedor(idx) {
      if (idx === null) {
        resetFormFornecedor();
        showCadastroFornecedor.value = true;
        editingFornecedorIndex.value = null;
      } else {
        const fornecedor = apiStore.data.fornecedores[idx];
        editingFornecedorIndex.value = idx;
        Object.assign(formFornecedor, fornecedor);
        showCadastroFornecedor.value = true;
      }
    }

    async function excluirFornecedor(idx) {
      const fornecedor = apiStore.data.fornecedores[idx];
      if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
        try {
          await deleteFornecedor(fornecedor.id);
        } catch (error) {
          console.error('Erro ao excluir fornecedor:', error);
        }
      }
    }

    function resetFormFornecedor() {
      Object.assign(formFornecedor, {
        id: null,
        nome: '',
        cnpj: '',
        inscricao_estadual: '',
        telefone: '',
        celular: '',
        email: '',
        numero: '',
        cep: '',
        bairro: '',
        cidade: '',
        estado: '',
        site: '',
        representante: '',
      });
      showCadastroFornecedor.value = false;
      editingFornecedorIndex.value = null;
    }

    // ========== ORÇAMENTOS ==========
    async function salvarOrcamento() {
      try {
        await saveOrcamento(formOrcamento);
        resetFormOrcamento();
      } catch (error) {
        console.error('Erro ao salvar orçamento:', error);
      }
    }

    function editarOrcamento(idx) {
      if (idx === null) {
        resetFormOrcamento();
        showCadastroOrcamento.value = true;
        editingOrcamentoIndex.value = null;
      } else {
        const orcamento = apiStore.data.orcamentos[idx];
        editingOrcamentoIndex.value = idx;
        Object.assign(formOrcamento, {
          id: orcamento.id,
          cliente: orcamento.cliente || orcamento.nomeCliente || '',
          documento: orcamento.documento || orcamento.cpf || '',
          telefone: orcamento.telefone || '',
          email: orcamento.email || '',
          rua: orcamento.rua || '',
          bairro: orcamento.bairro || '',
          cidade: orcamento.cidade || '',
          estado: orcamento.estado || '',
          cep: orcamento.cep || '',
          nome_equipamento: orcamento.nome_equipamento || orcamento.nomeEquipamento || '',
          modelo: orcamento.modelo || '',
          fabricante: orcamento.fabricante || '',
          ano_fabricacao: orcamento.ano_fabricacao || orcamento.anoFabricacao || new Date().getFullYear(),
          itens: orcamento.itens || [{ descricao: '', quantidade: 1, valorUnitario: 0 }],
          desconto: orcamento.desconto || 0,
          valor_sem_desconto: orcamento.valor_sem_desconto || orcamento.valorSemDesconto || 0,
          valor_com_desconto: orcamento.valor_com_desconto || orcamento.valorComDesconto || 0,
          forma_pagamento: orcamento.forma_pagamento || orcamento.formaDePagamento || '',
          prazo_entrega: orcamento.prazo_entrega || orcamento.prazoDeEntrega || '',
          validade: orcamento.validade || '',
          observacao: orcamento.observacao || '',
          status: orcamento.status || 'Pendente',
          data_emissao: orcamento.data_emissao || orcamento.emissao || new Date().toISOString().slice(0, 10),
        });
        showCadastroOrcamento.value = true;
      }
    }

    async function excluirOrcamento(idx) {
      const orcamento = apiStore.data.orcamentos[idx];
      if (confirm('Tem certeza que deseja excluir este orçamento?')) {
        try {
          await deleteOrcamento(orcamento.id);
        } catch (error) {
          console.error('Erro ao excluir orçamento:', error);
        }
      }
    }

    function resetFormOrcamento() {
      Object.assign(formOrcamento, {
        id: null,
        cliente: '',
        documento: '',
        telefone: '',
        email: '',
        rua: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        nome_equipamento: '',
        modelo: '',
        fabricante: '',
        ano_fabricacao: new Date().getFullYear(),
        itens: [{ descricao: '', quantidade: 1, valorUnitario: 0 }],
        desconto: 0,
        valor_sem_desconto: 0,
        valor_com_desconto: 0,
        forma_pagamento: '',
        prazo_entrega: '',
        validade: '',
        observacao: '',
        status: 'Pendente',
        data_emissao: new Date().toISOString().slice(0, 10),
      });
      showCadastroOrcamento.value = false;
      editingOrcamentoIndex.value = null;
    }

    // ========== REPAROS ==========
    async function salvarReparo() {
      try {
        await saveReparo(formReparo);
        resetFormReparo();
      } catch (error) {
        console.error('Erro ao salvar reparo:', error);
      }
    }

    function editarReparo(idx) {
      if (idx === null) {
        resetFormReparo();
        showCadastroReparo.value = true;
        editingReparoIndex.value = null;
      } else {
        const reparo = apiStore.data.reparos[idx];
        editingReparoIndex.value = idx;
        Object.assign(formReparo, {
          id: reparo.id,
          ordem_servico: reparo.ordem_servico || '',
          data_hora_inicio: reparo.data_hora_inicio || '',
          nome_cliente: reparo.nome_cliente || reparo.cliente || '',
          nome_equipamento: reparo.nome_equipamento || reparo.equipamento || '',
          modelo: reparo.modelo || '',
          fabricante: reparo.fabricante || '',
          pecas_utilizadas: reparo.pecas_utilizadas || reparo.pecas || '',
          quantidade: reparo.quantidade || 0,
          valor_final: reparo.valor_final || 0,
          responsavel: reparo.responsavel || '',
          data_hora_fim: reparo.data_hora_fim || '',
          situacao: reparo.situacao || reparo.status || '',
        });
        showCadastroReparo.value = true;
      }
    }

    async function excluirReparo(idx) {
      const reparo = apiStore.data.reparos[idx];
      if (confirm('Tem certeza que deseja excluir este reparo?')) {
        try {
          await deleteReparo(reparo.id);
        } catch (error) {
          console.error('Erro ao excluir reparo:', error);
        }
      }
    }

    function resetFormReparo() {
      Object.assign(formReparo, {
        id: null,
        ordem_servico: '',
        data_hora_inicio: '',
        nome_cliente: '',
        nome_equipamento: '',
        modelo: '',
        fabricante: '',
        pecas_utilizadas: '',
        quantidade: 0,
        valor_final: 0,
        responsavel: '',
        data_hora_fim: '',
        situacao: '',
      });
      showCadastroReparo.value = false;
      editingReparoIndex.value = null;
    }

    // ========== ESTOQUE ==========
    async function atualizarEstoquePeca(pecaAtualizada) {
      try {
        await savePeca(pecaAtualizada);
        showAlertMessage('success', 'Estoque atualizado com sucesso!');
      } catch (error) {
        console.error('Erro ao atualizar estoque:', error);
        showAlertMessage('danger', 'Erro ao atualizar estoque da peça');
      }
    }

    function resetForms() {
      resetFormCliente();
      resetFormPeca();
      resetFormEquipamento();
      resetFormFornecedor();
      resetFormOrcamento();
      resetFormReparo();
    }

    // ========== LIFECYCLE ==========
    onMounted(async () => {
      updateClock();
      setInterval(updateClock, 1000);
      
      // Carregar todos os dados da API
      try {
        await loadAllData();
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showAlertMessage('danger', 'Erro ao conectar com a API. Verifique se o servidor está rodando.');
      }
    });

    return {
      // Estados
      isSidebarCollapsed,
      currentPage,
      currentTime,
      showAlert,
      alertType,
      alertMessage,
      alertIcon,
      showCadastroCliente,
      showCadastroPeca,
      showCadastroEquipamento,
      showCadastroFornecedor,
      showCadastroOrcamento,
      showCadastroReparo,
      editingClienteIndex,
      editingPecaIndex,
      editingEquipamentoIndex,
      editingFornecedorIndex,
      editingOrcamentoIndex,
      editingReparoIndex,
      filtroCliente,
      filtroPeca,
      filtroEquipamento,
      filtroFornecedor,
      filtroOrcamento,
      filtroReparo,
      formCliente,
      formPeca,
      formEquipamento,
      formFornecedor,
      formOrcamento,
      formReparo,
      pageTitle,
      currentComponent,
      componentProps,

      // Métodos
      toggleSidebar,
      changePage,
      salvarCliente,
      editarCliente,
      excluirCliente,
      resetFormCliente,
      salvarPeca,
      editarPeca,
      excluirPeca,
      resetFormPeca,
      salvarEquipamento,
      editarEquipamento,
      excluirEquipamento,
      resetFormEquipamento,
      salvarFornecedor,
      editarFornecedor,
      excluirFornecedor,
      resetFormFornecedor,
      salvarOrcamento,
      editarOrcamento,
      excluirOrcamento,
      resetFormOrcamento,
      salvarReparo,
      editarReparo,
      excluirReparo,
      resetFormReparo,
      atualizarEstoquePeca,
    };
  },
};
</script>

<style>
/* Estilos específicos no App.vue podem ser adicionados aqui, mas a maior parte está em styles.css */
</style>