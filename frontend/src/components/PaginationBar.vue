<template>
  <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 py-2">

    <small class="text-muted">
      {{ total }} registro(s) encontrado(s)
    </small>

    <nav aria-label="Navegação de páginas">
      <ul class="pagination pagination-sm mb-0">
        <li class="page-item" :class="{ disabled: page <= 1 }">
          <button class="page-link" @click="emit('go-to', 1)" :disabled="page <= 1">«</button>
        </li>
        <li class="page-item" :class="{ disabled: page <= 1 }">
          <button class="page-link" @click="emit('go-to', page - 1)" :disabled="page <= 1">‹</button>
        </li>
        <li class="page-item disabled">
          <span class="page-link">{{ page }} / {{ totalPages }}</span>
        </li>
        <li class="page-item" :class="{ disabled: page >= totalPages }">
          <button class="page-link" @click="emit('go-to', page + 1)" :disabled="page >= totalPages">›</button>
        </li>
        <li class="page-item" :class="{ disabled: page >= totalPages }">
          <button class="page-link" @click="emit('go-to', totalPages)" :disabled="page >= totalPages">»</button>
        </li>
      </ul>
    </nav>

    <select
      class="form-select form-select-sm w-auto"
      :value="limit"
      @change="emit('update:limit', Number(($event.target as HTMLSelectElement).value))"
    >
      <option :value="5">5 por página</option>
      <option :value="10">10 por página</option>
      <option :value="20">20 por página</option>
      <option :value="50">50 por página</option>
    </select>

  </div>
</template>

<script setup lang="ts">
defineProps<{
  page:       number;
  totalPages: number;
  total:      number;
  limit:      number;
}>();

const emit = defineEmits<{
  'go-to':        [number];
  'update:limit': [number];
}>();
</script>
