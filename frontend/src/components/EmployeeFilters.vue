<template>
  <div class="card card-body mb-3">
    <div class="row g-2 align-items-end">

      <div class="col-md-3">
        <label class="form-label form-label-sm mb-1">Nome</label>
        <div class="input-group input-group-sm">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
          <input
            class="form-control"
            type="text"
            placeholder="Filtrar por nome..."
            :value="name"
            @input="onNameInput"
          />
        </div>
      </div>

      <div class="col-md-3">
        <label class="form-label form-label-sm mb-1">Cargo</label>
        <div class="input-group input-group-sm">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
          <input
            class="form-control"
            type="text"
            placeholder="Filtrar por cargo..."
            :value="role"
            @input="onRoleInput"
          />
        </div>
      </div>

      <div class="col-md-2">
        <label class="form-label form-label-sm mb-1">Status</label>
        <select class="form-select form-select-sm" :value="status" @change="onStatusChange">
          <option value="">Todos os status</option>
          <option value="Ativo">Ativo</option>
          <option value="Inativo">Inativo</option>
          <option value="Férias">Férias</option>
          <option value="Afastado">Afastado</option>
        </select>
      </div>

      <div class="col-md-2">
        <label class="form-label form-label-sm mb-1">Ordenar por</label>
        <select class="form-select form-select-sm" :value="sort" @change="onSortChange">
          <option value="">Padrão</option>
          <option value="name">Nome (A-Z)</option>
          <option value="role">Cargo (A-Z)</option>
          <option value="salary">Salário</option>
          <option value="contract_date">Data de contrato</option>
        </select>
      </div>

      <div class="col-md-2 d-flex align-items-end">
        <button class="btn btn-outline-secondary btn-sm w-100" @click="emit('clear')">
          <i class="bi bi-x-circle me-1"></i>Limpar filtros
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ name: string; role: string; status: string; sort: string }>();

const emit = defineEmits<{
  'update:name':   [string];
  'update:role':   [string];
  'update:status': [string];
  'update:sort':   [string];
  'search': [];
  'filter': [];
  'clear':  [];
}>();

function onNameInput(e: Event) {
  emit('update:name', (e.target as HTMLInputElement).value);
  emit('search');
}

function onRoleInput(e: Event) {
  emit('update:role', (e.target as HTMLInputElement).value);
  emit('search');
}

function onStatusChange(e: Event) {
  emit('update:status', (e.target as HTMLSelectElement).value);
  emit('filter');
}

function onSortChange(e: Event) {
  emit('update:sort', (e.target as HTMLSelectElement).value);
  emit('filter');
}
</script>
