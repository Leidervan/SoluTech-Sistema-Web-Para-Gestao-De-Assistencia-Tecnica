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
        @save-cliente="salvarCliente"
        @edit-cliente="editarCliente"
        @delete-cliente="excluirCliente"
        @cancel-cliente="resetFormCliente"
        @save-peca="salvarPeca"
        @edit-peca="editarPeca"
        @delete-peca="excluirPeca"
        @cancel-peca="resetFormPeca"
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
    const showAlert = ref(false);
    const alertType = ref('success');
    const alertMessage = ref('');
    const alertIcon = ref('fa-check-circle');
    const showCadastroCliente = ref(false);
    const showCadastroPeca = ref(false);
    const editingClienteIndex = ref(null);
    const editingPecaIndex = ref(null);
    const filtroCliente = ref('');
    const filtroPeca = ref('');

    const formCliente = reactive({
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
    });

    const formPeca = reactive({
      peca: '',
      fabricante: '',
      local_fabricacao: '',
      peso: '',
      quantidade: '',
      preco: '',
    });

    const clientes = ref([]);
    const pecas = ref([]);
    const fornecedores = ref([]);
    const equipamentos = ref([]);
    const orcamentos = ref([]);
    const reparos = ref([]);
    const estoque = ref([]);

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
            clientes: clientes.value,
            pecas: pecas.value,
            reparos: reparos.value,
            orcamentos: orcamentos.value,
          };
        case 'clientes':
          return {
            clientes: clientes.value,
            filtroCliente: filtroCliente.value,
            showCadastroCliente: showCadastroCliente.value,
            formCliente,
            editingIndex: editingClienteIndex.value,
          };
        case 'pecas':
          return {
            pecas: pecas.value,
            filtroPeca: filtroPeca.value,
            showCadastroPeca: showCadastroPeca.value,
            formPeca,
            editingIndex: editingPecaIndex.value,
          };
        case 'fornecedores':
          return {
            fornecedores: fornecedores.value,
          };
        case 'equipamentos':
          return {
            equipamentos: equipamentos.value,
          };
        case 'orcamento':
          return {
            orcamentos: orcamentos.value,
          };
        case 'lancamento':
          return {
            reparos: reparos.value,
          };
        case 'estoque':
          return {
            pecas: pecas.value,
          };
        case 'relatorios':
          return {};
        case 'config':
          return {};
        default:
          return {};
      }
    });

    function toggleSidebar() {
      isSidebarCollapsed.value = !isSidebarCollapsed.value;
    }
    function changePage(page) {
      currentPage.value = page;
      resetForms();
    }
    function showAlertMessage(type, message) {
      alertType.value = type;
      alertMessage.value = message;
      alertIcon.value =
        type === 'success' ? 'fa-check-circle'
        : type === 'danger' ? 'fa-exclamation-circle'
        : 'fa-info-circle';
      showAlert.value = true;
      setTimeout(() => {
        showAlert.value = false;
      }, 3000);
    }

    function formatarCPF(cpf) {
      if (!cpf) return '';
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    function formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    }
    function calcularIdade() {
      if (formCliente.data_nascimento) {
        const hoje = new Date();
        const nascimento = new Date(formCliente.data_nascimento);
        let idadeCalc = hoje.getFullYear() - nascimento.getFullYear();
        const mes = hoje.getMonth() - nascimento.getMonth();
        if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
          idadeCalc--;
        }
        formCliente.idade = idadeCalc;
      }
    }
    function getStatusClass(status) {
      switch (status?.toLowerCase()) {
        case 'concluído': return 'success';
        case 'em andamento': return 'warning';
        case 'cancelado': return 'danger';
        default: return 'warning';
      }
    }

    function salvarCliente() {
      if (editingClienteIndex.value === null) {
        clientes.value.push({ ...formCliente });
        showAlertMessage('success', 'Cliente cadastrado com sucesso!');
      } else {
        clientes.value[editingClienteIndex.value] = { ...formCliente };
        showAlertMessage('success', 'Cliente atualizado com sucesso!');
      }
      resetFormCliente();
    }
    function editarCliente(idx) {
      editingClienteIndex.value = idx;
      Object.assign(formCliente, clientes.value[idx]);
      showCadastroCliente.value = true;
    }
    function excluirCliente(idx) {
      if (confirm('Tem certeza que deseja excluir este cliente?')) {
        clientes.value.splice(idx, 1);
        showAlertMessage('success', 'Cliente excluído com sucesso!');
      }
    }
    function resetFormCliente() {
      Object.assign(formCliente, {
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
      });
      showCadastroCliente.value = false;
      editingClienteIndex.value = null;
      filtroCliente.value = '';
    }

    function salvarPeca() {
      const nova = {
        ...formPeca,
        preco: parseFloat(formPeca.preco),
        quantidade: parseInt(formPeca.quantidade),
        peso: parseFloat(formPeca.peso),
      };
      if (editingPecaIndex.value === null) {
        pecas.value.push(nova);
        showAlertMessage('success', 'Peça cadastrada com sucesso!');
      } else {
        pecas.value[editingPecaIndex.value] = nova;
        showAlertMessage('success', 'Peça atualizada com sucesso!');
      }
      resetFormPeca();
    }
    function editarPeca(idx) {
      editingPecaIndex.value = idx;
      Object.assign(formPeca, pecas.value[idx]);
      showCadastroPeca.value = true;
    }
    function excluirPeca(idx) {
      if (confirm('Tem certeza que deseja excluir esta peça?')) {
        pecas.value.splice(idx, 1);
        showAlertMessage('success', 'Peça excluída com sucesso!');
      }
    }
    function resetFormPeca() {
      Object.assign(formPeca, {
        peca: '',
        fabricante: '',
        local_fabricacao: '',
        peso: '',
        quantidade: '',
        preco: '',
      });
      showCadastroPeca.value = false;
      editingPecaIndex.value = null;
      filtroPeca.value = '';
    }

    function updateClock() {
      const now = new Date();
      currentTime.value = now.toLocaleString('pt-BR');
    }

    onMounted(() => {
      updateClock();
      setInterval(updateClock, 1000);

      clientes.value = [
        {
          nome: 'João',
          sobrenome: 'Silva',
          cpf: '12345678901',
          rg: '1234567',
          sexo: 'Masculino',
          telefone: '1133334444',
          celular: '11999887766',
          data_nascimento: '1990-05-15',
          idade: 33,
          rua: 'Rua das Flores',
          bairro: 'Centro',
          numero_residencia: '123',
          cidade: 'São Paulo',
          estado: 'SP',
          pais: 'Brasil',
        },
      ];
      pecas.value = [
        {
          peca: 'Tela LCD 15.6"',
          fabricante: 'Samsung',
          local_fabricacao: 'Coreia do Sul',
          peso: 0.5,
          quantidade: 10,
          preco: 250.0,
        },
        {
          peca: 'Memória RAM 8GB DDR4',
          fabricante: 'Kingston',
          local_fabricacao: 'Taiwan',
          peso: 0.02,
          quantidade: 15,
          preco: 180.0,
        },
      ];
      reparos.value = [
        {
          cliente: 'João Silva',
          equipamento: 'Notebook Dell',
          data_reparo: '2024-01-15',
          status: 'Concluído',
        },
        {
          cliente: 'Maria Santos',
          equipamento: 'Desktop HP',
          data_reparo: '2024-01-14',
          status: 'Em andamento',
        },
      ];
      orcamentos.value = [
        { id: 1, cliente: 'João Silva', valor: 350.0, status: 'Aprovado' },
        { id: 2, cliente: 'Maria Santos', valor: 180.0, status: 'Pendente' },
      ];

      fornecedores.value = [];
      equipamentos.value = [];
      estoque.value = [];
    });

    function resetForms() {
      resetFormCliente();
      resetFormPeca();
    }

    return {
      isSidebarCollapsed,
      currentPage,
      currentTime,
      showAlert,
      alertType,
      alertMessage,
      alertIcon,
      showCadastroCliente,
      showCadastroPeca,
      editingClienteIndex,
      editingPecaIndex,
      filtroCliente,
      filtroPeca,
      formCliente,
      formPeca,
      clientes,
      pecas,
      fornecedores,
      equipamentos,
      orcamentos,
      reparos,
      estoque,
      pageTitle,
      currentComponent,
      componentProps,
      toggleSidebar,
      changePage,
      showAlertMessage,
      formatarCPF,
      formatDate,
      calcularIdade,
      getStatusClass,
      salvarCliente,
      editarCliente,
      excluirCliente,
      resetFormCliente,
      salvarPeca,
      editarPeca,
      excluirPeca,
      resetFormPeca,
    };
  },
};
</script>

<style>
/* Estilos específicos no App.vue podem ser adicionados aqui, mas a maior parte está em styles.css */
</style>
