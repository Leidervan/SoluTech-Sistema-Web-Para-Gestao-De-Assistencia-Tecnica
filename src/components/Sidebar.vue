<template>
  <aside class="sidebar" :class="{ 'sidebar-collapsed': collapsed }">
    <div class="sidebar-header">
      <h2 v-show="!collapsed">SoluTech</h2>
      <button class="toggle-btn" @click="$emit('toggle-sidebar')">
        <i class="fas" :class="collapsed ? 'fa-bars' : 'fa-times'"></i>
      </button>
    </div>
    <ul class="sidebar-menu">
      <li v-for="item in menuItems" :key="item.page">
        <a
          href="#"
          @click.prevent="$emit('change-page', item.page)"
          :class="{ active: currentPage === item.page }"
        >
          <span class="icon"><i :class="item.icon"></i></span>
          <span class="menu-text" v-show="!collapsed">{{ item.label }}</span>
        </a>
      </li>
    </ul>
  </aside>
</template>

<script>
export default {
  name: 'Sidebar',
  props: {
    collapsed: { type: Boolean, required: true },
    currentPage: { type: String, required: true },
  },
  data() {
    return {
      menuItems: [
        { page: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line' },
        { page: 'clientes', label: 'Clientes', icon: 'fas fa-users' },
        { page: 'equipamentos', label: 'Equipamentos', icon: 'fas fa-laptop' },
        { page: 'pecas', label: 'Peças', icon: 'fas fa-cogs' },
        { page: 'fornecedores', label: 'Fornecedores', icon: 'fas fa-truck' },
        { page: 'orcamento', label: 'Orçamentos', icon: 'fas fa-file-invoice-dollar' },
        { page: 'lancamento', label: 'Reparos', icon: 'fas fa-tools' },
        { page: 'estoque', label: 'Estoque', icon: 'fas fa-boxes' },
        { page: 'relatorios', label: 'Relatórios', icon: 'fas fa-chart-bar' },
        { page: 'config', label: 'Configurações', icon: 'fas fa-cog' },
      ],
    };
  },
};
</script>

<style scoped>
/* Estilos da sidebar definidos em styles.css global */
</style>
