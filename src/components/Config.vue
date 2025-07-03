<template>
  <div class="section-content max-w-3xl mx-auto p-4">
    <!-- Seção de Cabeçalho -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-2">Configurações</h2>
      <p class="text-gray-600">Implementar opções de configuração.</p>
    </div>

    <!-- Seção de Foto de Perfil -->
    <div class="profile-photo mb-6" @click="changeProfilePhoto">
      <img v-if="formData.photoUrl" :src="formData.photoUrl" alt="Foto de perfil" />
      <span v-else class="text-gray-500">Sem foto</span>
    </div>

    <!-- Input oculto para upload de arquivo -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      @change="handleFileChange"
      style="display: none;"
    />

    <!-- Formulário de Configurações -->
    <form @submit.prevent="save">
      <div class="form-group">
        <label>Nome do usuário</label>
        <input v-model="formData.name" type="text" placeholder="Digite seu nome" />
        <p v-if="errors.name" class="form-error">{{ errors.name }}</p>
      </div>

      <div class="form-group">
        <label>Aniversário</label>
        <input v-model="formData.birthday" type="date" />
        <p v-if="errors.birthday" class="form-error">{{ errors.birthday }}</p>
      </div>

      <div class="form-group">
        <label>Sexo</label>
        <select v-model="formData.gender">
          <option value="" disabled>Selecione</option>
          <option>Masculino</option>
          <option>Feminino</option>
          <option>Outro</option>
        </select>
        <p v-if="errors.gender" class="form-error">{{ errors.gender }}</p>
      </div>

      <div class="form-group">
        <label>Idade</label>
        <input v-model.number="formData.age" type="number" placeholder="Digite sua idade" />
        <p v-if="errors.age" class="form-error">{{ errors.age }}</p>
      </div>

      <div class="form-group">
        <label>Cargo</label>
        <input v-model="formData.position" type="text" placeholder="Digite seu cargo" />
        <p v-if="errors.position" class="form-error">{{ errors.position }}</p>
      </div>

      <div class="form-group">
        <label>E-mail</label>
        <input v-model="formData.email" type="email" placeholder="Digite seu e-mail" />
        <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
      </div>

      <div class="form-group">
        <label>Celular</label>
        <input v-model="formData.phone" type="tel" placeholder="(XX) XXXXX-XXXX" />
        <p v-if="errors.phone" class="form-error">{{ errors.phone }}</p>
      </div>

      <div class="form-group">
        <label>Status de relacionamento</label>
        <select v-model="formData.relationshipStatus">
          <option value="" disabled>Selecione</option>
          <option>Solteiro(a)</option>
          <option>Casado(a)</option>
          <option>Divorciado(a)</option>
          <option>Viúvo(a)</option>
        </select>
        <p v-if="errors.relationshipStatus" class="form-error">{{ errors.relationshipStatus }}</p>
      </div>

      <!-- Botões de Ação -->
      <div class="form-buttons">
        <button type="button" @click="cancel">Cancelar</button>
        <button type="submit" :disabled="!isDirty || hasErrors">Salvar</button>
      </div>
    </form>
  </div>
</template>

<script>
import { reactive, computed, ref } from 'vue';

export default {
  name: 'Config',
  setup() {
    const fileInput = ref(null);
    
    const initialData = {
      photoUrl: '',
      name: '',
      birthday: '',
      gender: '',
      age: null,
      position: '',
      email: '',
      phone: '',
      relationshipStatus: ''
    };
    const formData = reactive({ ...initialData });
    const errors = reactive({});

    const changeProfilePhoto = () => {
      const wantsToChange = confirm('Deseja trocar a foto de perfil?');
      if (wantsToChange) {
        fileInput.value.click();
      }
    };

    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          formData.photoUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    };

    const validate = () => {
      Object.assign(errors, {
        name: !formData.name ? 'Campo obrigatório' : '',
        birthday: !formData.birthday ? 'Campo obrigatório' : '',
        gender: !formData.gender ? 'Campo obrigatório' : '',
        age: formData.age === null || formData.age < 0 ? 'Idade inválida' : '',
        position: !formData.position ? 'Campo obrigatório' : '',
        email: !formData.email ? 'Campo obrigatório' : '',
        phone: !formData.phone ? 'Campo obrigatório' : '',
        relationshipStatus: !formData.relationshipStatus ? 'Campo obrigatório' : '',
      });
      return Object.values(errors).every(e => !e);
    };

    const isDirty = computed(() => JSON.stringify(formData) !== JSON.stringify(initialData));
    const hasErrors = computed(() => !validate());

    const save = () => {
      if (!validate()) return;
      Object.assign(initialData, { ...formData });
      alert('Configurações salvas com sucesso!');
    };

    const cancel = () => {
      Object.assign(formData, { ...initialData });
    };

    return { 
      formData, 
      errors, 
      isDirty, 
      hasErrors, 
      fileInput,
      changeProfilePhoto,
      handleFileChange,
      save, 
      cancel 
    };
  }
};
</script>

<style scoped>
.section-content {
  background-color: #ffffff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.section-content h2 {
  font-size: 20px;
  margin-bottom: 8px;
  color: #333;
}

.section-content p {
  color: #555;
  margin-bottom: 16px;
}

.profile-photo {
  width: 128px;
  height: 128px;
  border-radius: 50%;
  background-color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin: 0 auto 24px auto;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.profile-photo:hover {
  background-color: #cbd5e0;
}

.profile-photo img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 4px;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #3182ce;
  outline: none;
}

.form-error {
  color: #e53e3e;
  font-size: 12px;
  margin-top: 4px;
}

.form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.form-buttons button {
  padding: 8px 16px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.form-buttons button[type="submit"] {
  background-color: #3182ce;
  color: white;
}

.form-buttons button[type="submit"]:disabled {
  background-color: #90cdf4;
  cursor: not-allowed;
}

.form-buttons button[type="button"] {
  background-color: #edf2f7;
  color: #333;
}
</style>