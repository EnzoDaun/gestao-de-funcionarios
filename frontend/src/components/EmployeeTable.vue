<template>
  <div class="card mb-3">

    <div v-if="loading" class="d-flex justify-content-center align-items-center py-5 gap-2">
      <div class="spinner-border spinner-border-sm text-primary" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
      <span class="text-muted">Carregando funcionários...</span>
    </div>

    <div v-else class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th>Nome</th>
            <th>Cargo</th>
            <th>Status</th>
            <th>Salário</th>
            <th>Dt. Contrato</th>
            <th>Telefone</th>
            <th class="text-end">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="employees.length === 0">
            <td colspan="7" class="text-center text-muted py-4 fst-italic">
              Nenhum funcionário encontrado para os filtros aplicados.
            </td>
          </tr>
          <tr v-for="emp in employees" :key="emp.uuid">
            <td class="fw-medium">{{ emp.name }}</td>
            <td>{{ emp.role }}</td>
            <td>
              <span class="badge" :class="statusBadge(emp.status)">{{ emp.status }}</span>
            </td>
            <td class="font-monospace small">{{ formatSalary(emp.salary) }}</td>
            <td>{{ formatDate(emp.contract_date) }}</td>
            <td class="text-muted small">{{ emp.phone || '—' }}</td>
            <td class="text-end">
              <button class="btn btn-warning btn-sm me-1" @click="emit('edit', emp)">
                <i class="bi bi-pencil me-1"></i>Editar
              </button>
              <button class="btn btn-danger btn-sm" @click="emit('delete', emp)">
                <i class="bi bi-trash me-1"></i>Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { Employee } from '../types/employee';

defineProps<{ employees: Employee[]; loading: boolean }>();

const emit = defineEmits<{ edit: [Employee]; delete: [Employee] }>();

const STATUS_BADGES: Record<string, string> = {
  Ativo:    'bg-success',
  Inativo:  'bg-danger',
  Férias:   'bg-warning text-dark',
  Afastado: 'bg-secondary',
};

function statusBadge(status: string): string {
  return STATUS_BADGES[status] ?? 'bg-secondary';
}

function formatSalary(value: number | string): string {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value: string): string {
  if (!value) return '—';
  const [year, month, day] = String(value).substring(0, 10).split('-').map(Number);
  if (!year || !month || !day) return '—';
  return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
}
</script>
