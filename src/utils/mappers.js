// =============================================================================
// src/utils/mappers.js - Funções para mapear dados entre Vue e API
// =============================================================================

export class DataMappers {
  // ========== CLIENTE ==========
  static clienteVueToApi(clienteVue) {
    return {
      id: clienteVue.id || 0,
      nomeCliente: `${clienteVue.nome} ${clienteVue.sobrenome}`,
      cpfCliente: clienteVue.cpf,
      rgCliente: clienteVue.rg,
      telefoneCliente: clienteVue.celular,
      emailCliente: clienteVue.email || '',
      ruaCliente: clienteVue.rua,
      bairroCliente: clienteVue.bairro,
      cidadeCliente: clienteVue.cidade,
    };
  }

  static clienteApiToVue(clienteApi) {
    const nomes = clienteApi.nomeCliente.split(' ');
    return {
      id: clienteApi.id,
      nome: nomes[0] || '',
      sobrenome: nomes.slice(1).join(' ') || '',
      cpf: clienteApi.cpfCliente,
      rg: clienteApi.rgCliente,
      sexo: '',
      telefone: '',
      celular: clienteApi.telefoneCliente,
      data_nascimento: '',
      idade: '',
      rua: clienteApi.ruaCliente,
      bairro: clienteApi.bairroCliente,
      numero_residencia: '',
      cidade: clienteApi.cidadeCliente,
      estado: '',
      pais: '',
      email: clienteApi.emailCliente,
    };
  }

  // ========== EQUIPAMENTO ==========
  static equipamentoVueToApi(equipamentoVue) {
    return {
      id: equipamentoVue.id || 0,
      nomeEquipamento: equipamentoVue.tipo || equipamentoVue.nome_equipamento,
      fabricante: equipamentoVue.marca || equipamentoVue.fabricante,
      modelo: equipamentoVue.modelo,
      numeroDeSerie: equipamentoVue.numero_serie,
      codigoDeFabricacao: equipamentoVue.codigo_fabricacao || 'N/A',
      anoDeFabricacao: equipamentoVue.ano_fabricacao || new Date().getFullYear(),
      voltagem: equipamentoVue.voltagem || '110V',
      amperagem: equipamentoVue.amperagem || '1A',
    };
  }

  static equipamentoApiToVue(equipamentoApi) {
    return {
      id: equipamentoApi.id,
      tipo: equipamentoApi.nomeEquipamento,
      marca: equipamentoApi.fabricante,
      modelo: equipamentoApi.modelo,
      numero_serie: equipamentoApi.numeroDeSerie,
      nome_cliente: '', // Este campo virá de outro relacionamento
      codigo_fabricacao: equipamentoApi.codigoDeFabricacao,
      ano_fabricacao: equipamentoApi.anoDeFabricacao,
      voltagem: equipamentoApi.voltagem,
      amperagem: equipamentoApi.amperagem,
    };
  }

  // ========== FORNECEDOR ==========
  static fornecedorVueToApi(fornecedorVue) {
    return {
      id: fornecedorVue.id || 0,
      nomeFornecedor: fornecedorVue.nome,
      cnpjCpf: fornecedorVue.cnpj,
      inscricaoEstadual: fornecedorVue.inscricao_estadual || 'N/A',
      email: fornecedorVue.email,
      telefone: fornecedorVue.telefone,
      telefoneCelular: fornecedorVue.celular || fornecedorVue.telefone,
      numeroDoImovel: fornecedorVue.numero || 'S/N',
      cep: fornecedorVue.cep || '00000-000',
      bairro: fornecedorVue.bairro || '',
      cidade: fornecedorVue.cidade,
      estado: fornecedorVue.estado,
      pais: 'Brasil',
      site: fornecedorVue.site || '',
      representante: fornecedorVue.representante || 'N/A',
    };
  }

  static fornecedorApiToVue(fornecedorApi) {
    return {
      id: fornecedorApi.id,
      nome: fornecedorApi.nomeFornecedor,
      cnpj: fornecedorApi.cnpjCpf,
      telefone: fornecedorApi.telefone,
      email: fornecedorApi.email,
      cidade: fornecedorApi.cidade,
      estado: fornecedorApi.estado,
      bairro: fornecedorApi.bairro,
      cep: fornecedorApi.cep,
      site: fornecedorApi.site,
      representante: fornecedorApi.representante,
    };
  }

  // ========== PEÇA ==========
  static pecaVueToApi(pecaVue) {
    return {
      id: pecaVue.id || 0,
      nomePeca: pecaVue.peca || pecaVue.nome,
      fabricante: pecaVue.fabricante,
      localDeFabricacao: pecaVue.local_fabricacao || 'N/A',
      pesoKg: parseFloat(pecaVue.peso) || 0,
      quantidade: parseInt(pecaVue.quantidade) || 0,
      numeroDeSerie: pecaVue.numero_serie || 'N/A',
      codigoDeProducao: pecaVue.codigo_producao || 'N/A',
      preco: parseFloat(pecaVue.preco) || 0,
      observacao: pecaVue.observacao || 'Nenhuma observação',
    };
  }

  static pecaApiToVue(pecaApi) {
    return {
      id: pecaApi.id,
      peca: pecaApi.nomePeca,
      fabricante: pecaApi.fabricante,
      local_fabricacao: pecaApi.localDeFabricacao,
      peso: pecaApi.pesoKg,
      quantidade: pecaApi.quantidade,
      numero_serie: pecaApi.numeroDeSerie,
      codigo_producao: pecaApi.codigoDeProducao,
      preco: pecaApi.preco,
      observacao: pecaApi.observacao,
      // Para compatibilidade com estoque
      nome: pecaApi.nomePeca,
      categoria: 'Geral',
      valor_unitario: pecaApi.preco,
      fornecedor: 'N/A',
    };
  }

  // ========== ORÇAMENTO ==========
  static orcamentoVueToApi(orcamentoVue) {
    return {
      id: orcamentoVue.id || 0,
      nomeCliente: orcamentoVue.cliente || orcamentoVue.nome_cliente,
      cpf: orcamentoVue.documento || orcamentoVue.cpf,
      rg: orcamentoVue.rg || 'N/A',
      telefone: orcamentoVue.telefone,
      rua: orcamentoVue.rua,
      bairro: orcamentoVue.bairro,
      cidade: orcamentoVue.cidade,
      cep: orcamentoVue.cep,
      nomeEquipamento: orcamentoVue.nome_equipamento || 'Equipamento',
      modelo: orcamentoVue.modelo || 'N/A',
      fabricante: orcamentoVue.fabricante || 'N/A',
      anoFabricacao: orcamentoVue.ano_fabricacao || new Date().getFullYear(),
      voltagem: orcamentoVue.voltagem || '110V',
      amperagem: orcamentoVue.amperagem || '1A',
      pecas: orcamentoVue.pecas || JSON.stringify(orcamentoVue.itens || []),
      formaDePagamento: orcamentoVue.forma_pagamento || 'A definir',
      prazoDeEntrega: orcamentoVue.prazoEntrega + ' dias úteis' || '7 dias úteis',
      observacao: orcamentoVue.observacao || '',
      valorSemDesconto: parseFloat(orcamentoVue.valor_sem_desconto) || 0,
      valorComDesconto: parseFloat(orcamentoVue.valor_com_desconto) || 0,
    };
  }

  static orcamentoApiToVue(orcamentoApi) {
    return {
      id: orcamentoApi.id,
      cliente: orcamentoApi.nomeCliente,
      documento: orcamentoApi.cpf,
      telefone: orcamentoApi.telefone,
      rua: orcamentoApi.rua,
      bairro: orcamentoApi.bairro,
      cidade: orcamentoApi.cidade,
      estado: '', // Não existe na API
      cep: orcamentoApi.cep,
      email: '', // Não existe na API
      nome_equipamento: orcamentoApi.nomeEquipamento,
      modelo: orcamentoApi.modelo,
      fabricante: orcamentoApi.fabricante,
      ano_fabricacao: orcamentoApi.anoFabricacao,
      voltagem: orcamentoApi.voltagem,
      amperagem: orcamentoApi.amperagem,
      pecas: orcamentoApi.pecas,
      forma_pagamento: orcamentoApi.formaDePagamento,
      prazo_entrega: orcamentoApi.prazoDeEntrega,
      observacao: orcamentoApi.observacao,
      valor_sem_desconto: orcamentoApi.valorSemDesconto,
      valor_com_desconto: orcamentoApi.valorComDesconto,
      // Para compatibilidade
      valor: orcamentoApi.valorComDesconto,
      status: 'Pendente', // Status padrão
    };
  }

  // ========== REPARO ==========
  static reparoVueToApi(reparoVue) {
    return {
      id: reparoVue.id || 0,
      nomeCliente: reparoVue.nome_cliente,
      cpf: reparoVue.cpf || 'N/A',
      rg: reparoVue.rg || 'N/A',
      telefone: reparoVue.telefone || 'N/A',
      rua: reparoVue.rua || 'N/A',
      bairro: reparoVue.bairro || 'N/A',
      cidade: reparoVue.cidade || 'N/A',
      cep: reparoVue.cep || 'N/A',
      nomeEquipamento: reparoVue.nome_equipamento,
      modelo: reparoVue.modelo || 'N/A',
      fabricante: reparoVue.fabricante || 'N/A',
      anoFabricacao: reparoVue.ano_fabricacao || new Date().getFullYear(),
      voltagem: reparoVue.voltagem || '110V',
      amperagem: reparoVue.amperagem || '1A',
      pecas: reparoVue.pecas_utilizadas || 'N/A',
      formaDePagamento: reparoVue.forma_pagamento || 'A definir',
      prazoDeEntrega: reparoVue.prazo_entrega || '7 dias úteis',
      observacao: reparoVue.observacao || '',
      valorSemDesconto: parseFloat(reparoVue.valor_final) || 0,
      valorComDesconto: parseFloat(reparoVue.valor_final) || 0,
    };
  }

  static reparoApiToVue(reparoApi) {
    return {
      id: reparoApi.id,
      ordem_servico: `OS-${reparoApi.id.toString().padStart(3, '0')}`,
      nome_cliente: reparoApi.nomeCliente,
      nome_equipamento: reparoApi.nomeEquipamento,
      modelo: reparoApi.modelo,
      fabricante: reparoApi.fabricante,
      pecas_utilizadas: reparoApi.pecas,
      quantidade: 1, // Valor padrão
      valor_final: reparoApi.valorComDesconto,
      responsavel: 'Técnico', // Valor padrão
      situacao: 'Finalizado', // Status padrão
      data_hora_inicio: new Date().toISOString().slice(0, 16),
      data_hora_fim: new Date().toISOString().slice(0, 16),
      // Para compatibilidade com Dashboard
      cliente: reparoApi.nomeCliente,
      equipamento: reparoApi.nomeEquipamento,
      data_reparo: new Date().toISOString().slice(0, 10),
      status: 'Concluído',
    };
  }
}