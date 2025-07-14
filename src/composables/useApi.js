// =============================================================================
// src/composables/useApi.js - VERSÃO ATUALIZADA COM EQUIPAMENTOS
// =============================================================================
import { ref } from 'vue';
import { api } from '../services/api.js';
import { DataMappers } from '../utils/mappers.js';
import { apiStore } from '../stores/apiStore.js';

export function useApi() {
  const showAlert = ref(false);
  const alertType = ref('success');
  const alertMessage = ref('');
  const alertIcon = ref('fa-check-circle');

  function showAlertMessage(type, message) {
    console.log(`🔔 Alert: ${type} - ${message}`);
    alertType.value = type;
    alertMessage.value = message;
    alertIcon.value =
      type === 'success' ? 'fa-check-circle'
      : type === 'danger' ? 'fa-exclamation-circle'
      : 'fa-info-circle';
    showAlert.value = true;
    setTimeout(() => {
      showAlert.value = false;
    }, 5000);
  }

  // ========== CLIENTES ==========
  async function loadClientes() {
    console.log('📥 Carregando clientes...');
    apiStore.setLoading('clientes', true);
    
    try {
      const clientesApi = await api.getClientes();
      console.log('📦 Clientes recebidos da API:', clientesApi);
      
      const clientesVue = clientesApi.map(DataMappers.clienteApiToVue);
      console.log('🔄 Clientes mapeados para Vue:', clientesVue);
      
      apiStore.setData('clientes', clientesVue);
      console.log('✅ Clientes salvos no store');
      showAlertMessage('success', `${clientesVue.length} clientes carregados`);
      
    } catch (error) {
      console.error('❌ Erro ao carregar clientes:', error);
      apiStore.setError('clientes', error);
      showAlertMessage('danger', `Erro ao carregar clientes: ${error.message}`);
    } finally {
      apiStore.setLoading('clientes', false);
    }
  }

  async function saveCliente(clienteVue) {
    console.log('💾 Salvando cliente:', clienteVue);
    
    try {
      const clienteApi = DataMappers.clienteVueToApi(clienteVue);
      
      if (clienteVue.id) {
        console.log('📝 Atualizando cliente existente...');
        const updated = await api.updateCliente(clienteVue.id, clienteApi);
        const updatedVue = DataMappers.clienteApiToVue(updated);
        apiStore.updateItem('clientes', clienteVue.id, updatedVue);
        showAlertMessage('success', 'Cliente atualizado com sucesso!');
        return updatedVue;
      } else {
        console.log('➕ Criando novo cliente...');
        const created = await api.createCliente(clienteApi);
        const createdVue = DataMappers.clienteApiToVue(created);
        apiStore.addItem('clientes', createdVue);
        showAlertMessage('success', 'Cliente cadastrado com sucesso!');
        return createdVue;
      }
    } catch (error) {
      console.error('❌ Erro ao salvar cliente:', error);
      showAlertMessage('danger', `Erro ao salvar cliente: ${error.message}`);
      throw error;
    }
  }

  async function deleteCliente(id) {
    console.log('🗑️ Excluindo cliente ID:', id);
    try {
      await api.deleteCliente(id);
      apiStore.removeItem('clientes', id);
      showAlertMessage('success', 'Cliente excluído com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao excluir cliente:', error);
      showAlertMessage('danger', `Erro ao excluir cliente: ${error.message}`);
      throw error;
    }
  }

  // ========== PEÇAS ==========
  async function loadPecas() {
    console.log('📥 Carregando peças...');
    apiStore.setLoading('pecas', true);
    
    try {
      const pecasApi = await api.getPecas();
      console.log('📦 Peças recebidas da API:', pecasApi);
      
      const pecasVue = pecasApi.map(DataMappers.pecaApiToVue);
      console.log('🔄 Peças mapeadas para Vue:', pecasVue);
      
      apiStore.setData('pecas', pecasVue);
      console.log('✅ Peças salvas no store');
      showAlertMessage('success', `${pecasVue.length} peças carregadas`);
      
    } catch (error) {
      console.error('❌ Erro ao carregar peças:', error);
      apiStore.setError('pecas', error);
      showAlertMessage('danger', `Erro ao carregar peças: ${error.message}`);
    } finally {
      apiStore.setLoading('pecas', false);
    }
  }

  async function savePeca(pecaVue) {
    console.log('💾 Salvando peça:', pecaVue);
    
    try {
      const pecaApi = DataMappers.pecaVueToApi(pecaVue);
      
      if (pecaVue.id) {
        const updated = await api.updatePeca(pecaVue.id, pecaApi);
        const updatedVue = DataMappers.pecaApiToVue(updated);
        apiStore.updateItem('pecas', pecaVue.id, updatedVue);
        showAlertMessage('success', 'Peça atualizada com sucesso!');
        return updatedVue;
      } else {
        const created = await api.createPeca(pecaApi);
        const createdVue = DataMappers.pecaApiToVue(created);
        apiStore.addItem('pecas', createdVue);
        showAlertMessage('success', 'Peça cadastrada com sucesso!');
        return createdVue;
      }
    } catch (error) {
      console.error('❌ Erro ao salvar peça:', error);
      showAlertMessage('danger', `Erro ao salvar peça: ${error.message}`);
      throw error;
    }
  }

  async function deletePeca(id) {
    try {
      await api.deletePeca(id);
      apiStore.removeItem('pecas', id);
      showAlertMessage('success', 'Peça excluída com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao excluir peça:', error);
      showAlertMessage('danger', `Erro ao excluir peça: ${error.message}`);
      throw error;
    }
  }

  // ========== EQUIPAMENTOS ========== 
  async function loadEquipamentos() {
    console.log('📥 Carregando equipamentos...');
    apiStore.setLoading('equipamentos', true);
    
    try {
      const equipamentosApi = await api.getEquipamentos();
      console.log('📦 Equipamentos recebidos da API:', equipamentosApi);
      
      const equipamentosVue = equipamentosApi.map(DataMappers.equipamentoApiToVue);
      console.log('🔄 Equipamentos mapeados para Vue:', equipamentosVue);
      
      apiStore.setData('equipamentos', equipamentosVue);
      console.log('✅ Equipamentos salvos no store');
      showAlertMessage('success', `${equipamentosVue.length} equipamentos carregados`);
      
    } catch (error) {
      console.error('❌ Erro ao carregar equipamentos:', error);
      apiStore.setError('equipamentos', error);
      showAlertMessage('danger', `Erro ao carregar equipamentos: ${error.message}`);
    } finally {
      apiStore.setLoading('equipamentos', false);
    }
  }

  async function saveEquipamento(equipamentoVue) {
    console.log('💾 Salvando equipamento:', equipamentoVue);
    
    try {
      const equipamentoApi = DataMappers.equipamentoVueToApi(equipamentoVue);
      
      if (equipamentoVue.id) {
        console.log('📝 Atualizando equipamento existente...');
        const updated = await api.updateEquipamento(equipamentoVue.id, equipamentoApi);
        const updatedVue = DataMappers.equipamentoApiToVue(updated);
        apiStore.updateItem('equipamentos', equipamentoVue.id, updatedVue);
        showAlertMessage('success', 'Equipamento atualizado com sucesso!');
        return updatedVue;
      } else {
        console.log('➕ Criando novo equipamento...');
        const created = await api.createEquipamento(equipamentoApi);
        const createdVue = DataMappers.equipamentoApiToVue(created);
        apiStore.addItem('equipamentos', createdVue);
        showAlertMessage('success', 'Equipamento cadastrado com sucesso!');
        return createdVue;
      }
    } catch (error) {
      console.error('❌ Erro ao salvar equipamento:', error);
      showAlertMessage('danger', `Erro ao salvar equipamento: ${error.message}`);
      throw error;
    }
  }

  async function deleteEquipamento(id) {
    console.log('🗑️ Excluindo equipamento ID:', id);
    try {
      await api.deleteEquipamento(id);
      apiStore.removeItem('equipamentos', id);
      showAlertMessage('success', 'Equipamento excluído com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao excluir equipamento:', error);
      showAlertMessage('danger', `Erro ao excluir equipamento: ${error.message}`);
      throw error;
    }
  }

  // ========== FORNECEDORES ==========
  async function loadFornecedores() {
    console.log('📥 Carregando fornecedores...');
    apiStore.setLoading('fornecedores', true);
    
    try {
      const fornecedoresApi = await api.getFornecedores();
      const fornecedoresVue = fornecedoresApi.map(DataMappers.fornecedorApiToVue);
      apiStore.setData('fornecedores', fornecedoresVue);
      showAlertMessage('success', `${fornecedoresVue.length} fornecedores carregados`);
    } catch (error) {
      console.error('❌ Erro ao carregar fornecedores:', error);
      apiStore.setError('fornecedores', error);
      showAlertMessage('danger', `Erro ao carregar fornecedores: ${error.message}`);
    } finally {
      apiStore.setLoading('fornecedores', false);
    }
  }

  async function saveFornecedor(fornecedorVue) {
    console.log('💾 Salvando fornecedor:', fornecedorVue);
    
    try {
      const fornecedorApi = DataMappers.fornecedorVueToApi(fornecedorVue);
      
      if (fornecedorVue.id) {
        const updated = await api.updateFornecedor(fornecedorVue.id, fornecedorApi);
        const updatedVue = DataMappers.fornecedorApiToVue(updated);
        apiStore.updateItem('fornecedores', fornecedorVue.id, updatedVue);
        showAlertMessage('success', 'Fornecedor atualizado com sucesso!');
        return updatedVue;
      } else {
        const created = await api.createFornecedor(fornecedorApi);
        const createdVue = DataMappers.fornecedorApiToVue(created);
        apiStore.addItem('fornecedores', createdVue);
        showAlertMessage('success', 'Fornecedor cadastrado com sucesso!');
        return createdVue;
      }
    } catch (error) {
      console.error('❌ Erro ao salvar fornecedor:', error);
      showAlertMessage('danger', `Erro ao salvar fornecedor: ${error.message}`);
      throw error;
    }
  }

  async function deleteFornecedor(id) {
    try {
      await api.deleteFornecedor(id);
      apiStore.removeItem('fornecedores', id);
      showAlertMessage('success', 'Fornecedor excluído com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao excluir fornecedor:', error);
      showAlertMessage('danger', `Erro ao excluir fornecedor: ${error.message}`);
      throw error;
    }
  }

  // ========== ORÇAMENTOS ==========
  async function loadOrcamentos() {
    console.log('📥 Carregando orçamentos...');
    apiStore.setLoading('orcamentos', true);
    
    try {
      const orcamentosApi = await api.getOrcamentos();
      const orcamentosVue = orcamentosApi.map(DataMappers.orcamentoApiToVue);
      apiStore.setData('orcamentos', orcamentosVue);
      showAlertMessage('success', `${orcamentosVue.length} orçamentos carregados`);
    } catch (error) {
      console.error('❌ Erro ao carregar orçamentos:', error);
      apiStore.setError('orcamentos', error);
      showAlertMessage('danger', `Erro ao carregar orçamentos: ${error.message}`);
    } finally {
      apiStore.setLoading('orcamentos', false);
    }
  }

  async function saveOrcamento(orcamentoVue) {
    console.log('💾 Salvando orçamento:', orcamentoVue);
    
    try {
      const orcamentoApi = DataMappers.orcamentoVueToApi(orcamentoVue);
      
      if (orcamentoVue.id) {
        const updated = await api.updateOrcamento(orcamentoVue.id, orcamentoApi);
        const updatedVue = DataMappers.orcamentoApiToVue(updated);
        apiStore.updateItem('orcamentos', orcamentoVue.id, updatedVue);
        showAlertMessage('success', 'Orçamento atualizado com sucesso!');
        return updatedVue;
      } else {
        const created = await api.createOrcamento(orcamentoApi);
        const createdVue = DataMappers.orcamentoApiToVue(created);
        apiStore.addItem('orcamentos', createdVue);
        showAlertMessage('success', 'Orçamento cadastrado com sucesso!');
        return createdVue;
      }
    } catch (error) {
      console.error('❌ Erro ao salvar orçamento:', error);
      showAlertMessage('danger', `Erro ao salvar orçamento: ${error.message}`);
      throw error;
    }
  }

  async function deleteOrcamento(id) {
    try {
      await api.deleteOrcamento(id);
      apiStore.removeItem('orcamentos', id);
      showAlertMessage('success', 'Orçamento excluído com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao excluir orçamento:', error);
      showAlertMessage('danger', `Erro ao excluir orçamento: ${error.message}`);
      throw error;
    }
  }

  // ========== REPAROS ==========
  async function loadReparos() {
    console.log('📥 Carregando reparos...');
    apiStore.setLoading('reparos', true);
    
    try {
      const reparosApi = await api.getReparos();
      const reparosVue = reparosApi.map(DataMappers.reparoApiToVue);
      apiStore.setData('reparos', reparosVue);
      showAlertMessage('success', `${reparosVue.length} reparos carregados`);
    } catch (error) {
      console.error('❌ Erro ao carregar reparos:', error);
      apiStore.setError('reparos', error);
      showAlertMessage('danger', `Erro ao carregar reparos: ${error.message}`);
    } finally {
      apiStore.setLoading('reparos', false);
    }
  }

  async function saveReparo(reparoVue) {
    console.log('💾 Salvando reparo:', reparoVue);
    
    try {
      const reparoApi = DataMappers.reparoVueToApi(reparoVue);
      
      if (reparoVue.id) {
        const updated = await api.updateReparo(reparoVue.id, reparoApi);
        const updatedVue = DataMappers.reparoApiToVue(updated);
        apiStore.updateItem('reparos', reparoVue.id, updatedVue);
        showAlertMessage('success', 'Reparo atualizado com sucesso!');
        return updatedVue;
      } else {
        const created = await api.createReparo(reparoApi);
        const createdVue = DataMappers.reparoApiToVue(created);
        apiStore.addItem('reparos', createdVue);
        showAlertMessage('success', 'Reparo cadastrado com sucesso!');
        return createdVue;
      }
    } catch (error) {
      console.error('❌ Erro ao salvar reparo:', error);
      showAlertMessage('danger', `Erro ao salvar reparo: ${error.message}`);
      throw error;
    }
  }

  async function deleteReparo(id) {
    try {
      await api.deleteReparo(id);
      apiStore.removeItem('reparos', id);
      showAlertMessage('success', 'Reparo excluído com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao excluir reparo:', error);
      showAlertMessage('danger', `Erro ao excluir reparo: ${error.message}`);
      throw error;
    }
  }

  // ========== FUNÇÃO PARA CARREGAR TODOS OS DADOS ==========
  async function loadAllData() {
    console.log('🔄 Carregando todos os dados...');
    
    // Carrega em paralelo mas com tratamento individual de erros
    await Promise.allSettled([
      loadClientes(),
      loadPecas(),
      loadEquipamentos(),
      loadFornecedores(),
      loadOrcamentos(),
      loadReparos(),
    ]);
    
    console.log('✅ Carregamento de dados finalizado');
  }

  return {
    // Estados de alerta
    showAlert,
    alertType,
    alertMessage,
    alertIcon,
    showAlertMessage,

    // Funções de carregamento
    loadClientes,
    loadPecas,
    loadEquipamentos,
    loadFornecedores,
    loadOrcamentos,
    loadReparos,
    loadAllData,

    // Funções CRUD - Clientes
    saveCliente,
    deleteCliente,

    // Funções CRUD - Peças
    savePeca,
    deletePeca,

    // Funções CRUD - Equipamentos
    saveEquipamento,
    deleteEquipamento,

    // Funções CRUD - Fornecedores
    saveFornecedor,
    deleteFornecedor,

    // Funções CRUD - Orçamentos
    saveOrcamento,
    deleteOrcamento,

    // Funções CRUD - Reparos
    saveReparo,
    deleteReparo,
  };
}