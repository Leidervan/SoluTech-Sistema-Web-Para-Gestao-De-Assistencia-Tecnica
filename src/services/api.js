// =============================================================================
// src/services/api.js - URL CORRIGIDA
// =============================================================================

class ApiService {
  constructor(baseURL = 'http://localhost:5112/api') { // ✅ URL correta
    this.baseURL = baseURL;
  }

  async request(url, options = {}) {
    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${this.baseURL}${url}`);
      
      const response = await fetch(`${this.baseURL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log(`📡 Response Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      // Para DELETE, não há corpo de resposta
      if (response.status === 204) {
        console.log('✅ DELETE Success - No Content');
        return true;
      }

      const data = await response.json();
      console.log('✅ API Response Data:', data);
      return data;
      
    } catch (error) {
      console.error('🚨 API Error:', error);
      
      // Erro de rede/conexão
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Erro de conexão: Verifique se a API está rodando em http://localhost:5112');
      }
      
      // Erro de CORS
      if (error.message.includes('CORS')) {
        throw new Error('Erro de CORS: Configure CORS na API para permitir http://localhost:3000');
      }
      
      throw error;
    }
  }

  // ========== TESTE DE CONEXÃO ==========
  async testConnection() {
    try {
      console.log('🔍 Testando conexão com:', this.baseURL);
      
      // Primeiro tenta acessar o endpoint de clientes
      const response = await fetch(`${this.baseURL}/cliente`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log(`🏥 Health Check Status: ${response.status}`);
      return response.ok;
    } catch (error) {
      console.error('❌ Teste de conexão falhou:', error);
      return false;
    }
  }

  // ========== CLIENTES ==========
  async getClientes() {
    return this.request('/cliente');
  }

  async getCliente(id) {
    return this.request(`/cliente/${id}`);
  }

  async createCliente(cliente) {
    return this.request('/cliente', {
      method: 'POST',
      body: JSON.stringify(cliente),
    });
  }

  async updateCliente(id, cliente) {
    return this.request(`/cliente/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cliente),
    });
  }

  async deleteCliente(id) {
    return this.request(`/cliente/${id}`, {
      method: 'DELETE',
    });
  }

  // ========== PEÇAS ==========
  async getPecas() {
    return this.request('/peca');
  }

  async createPeca(peca) {
    return this.request('/peca', {
      method: 'POST',
      body: JSON.stringify(peca),
    });
  }

  async updatePeca(id, peca) {
    return this.request(`/peca/${id}`, {
      method: 'PUT',
      body: JSON.stringify(peca),
    });
  }

  async deletePeca(id) {
    return this.request(`/peca/${id}`, {
      method: 'DELETE',
    });
  }

  // ========== EQUIPAMENTOS ==========
  async getEquipamentos() {
    return this.request('/equipamento');
  }

  async createEquipamento(equipamento) {
    return this.request('/equipamento', {
      method: 'POST',
      body: JSON.stringify(equipamento),
    });
  }

  async updateEquipamento(id, equipamento) {
    return this.request(`/equipamento/${id}`, {
      method: 'PUT',
      body: JSON.stringify(equipamento),
    });
  }

  async deleteEquipamento(id) {
    return this.request(`/equipamento/${id}`, {
      method: 'DELETE',
    });
  }

  // ========== FORNECEDORES ==========
  async getFornecedores() {
    return this.request('/fornecedor');
  }

  async createFornecedor(fornecedor) {
    return this.request('/fornecedor', {
      method: 'POST',
      body: JSON.stringify(fornecedor),
    });
  }

  async updateFornecedor(id, fornecedor) {
    return this.request(`/fornecedor/${id}`, {
      method: 'PUT',
      body: JSON.stringify(fornecedor),
    });
  }

  async deleteFornecedor(id) {
    return this.request(`/fornecedor/${id}`, {
      method: 'DELETE',
    });
  }

  // ========== ORÇAMENTOS ==========
  async getOrcamentos() {
    return this.request('/orcamento');
  }

  async createOrcamento(orcamento) {
    return this.request('/orcamento', {
      method: 'POST',
      body: JSON.stringify(orcamento),
    });
  }

  async updateOrcamento(id, orcamento) {
    return this.request(`/orcamento/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orcamento),
    });
  }

  async deleteOrcamento(id) {
    return this.request(`/orcamento/${id}`, {
      method: 'DELETE',
    });
  }

  // ========== REPAROS ==========
  async getReparos() {
    return this.request('/reparo');
  }

  async createReparo(reparo) {
    return this.request('/reparo', {
      method: 'POST',
      body: JSON.stringify(reparo),
    });
  }

  async updateReparo(id, reparo) {
    return this.request(`/reparo/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reparo),
    });
  }

  async deleteReparo(id) {
    return this.request(`/reparo/${id}`, {
      method: 'DELETE',
    });
  }
}

// Instância global da API
export const api = new ApiService();
export default api;