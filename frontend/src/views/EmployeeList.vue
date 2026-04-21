<template>
  <div class="container-fluid py-4">

    <!-- Cabeçalho -->
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <h1 class="h4 mb-0 fw-bold">
        <i class="bi bi-people-fill me-2 text-primary"></i>Gestão de Funcionários
      </h1>
      <div class="d-flex gap-2 flex-wrap">

        <button class="btn btn-primary btn-sm" @click="openCreate">
          <i class="bi bi-plus-lg me-1"></i>Novo funcionário
        </button>

        <label class="btn btn-outline-secondary btn-sm">
          <span v-if="importing" class="spinner-border spinner-border-sm me-1" role="status"></span>
          <i v-else class="bi bi-upload me-1"></i>
          Importar XLSX
          <input ref="fileInput" type="file" accept=".xlsx" hidden @change="handleImport" />
        </label>

        <button class="btn btn-outline-secondary btn-sm" :disabled="exporting" @click="handleExport">
          <span v-if="exporting" class="spinner-border spinner-border-sm me-1" role="status"></span>
          <i v-else class="bi bi-download me-1"></i>
          {{ exporting ? 'Gerando...' : 'Exportar XLSX' }}
        </button>

      </div>
    </div>

    <!-- alertas -->
    <div v-if="importSummary" class="alert alert-success alert-dismissible d-flex align-items-center py-2 small mb-3">
      <i class="bi bi-check-circle-fill me-2"></i>
      Importação concluída:
      <strong class="mx-1">{{ importSummary.inseridos }}</strong> inseridos,
      <strong class="mx-1">{{ importSummary.rejeitados }}</strong> rejeitados
      (total enviado: {{ importSummary.total }})
      <button type="button" class="btn-close ms-auto" @click="importSummary = null"></button>
    </div>

    <div v-if="error" class="alert alert-danger alert-dismissible d-flex align-items-center py-2 small mb-3">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ error }}
      <button type="button" class="btn-close ms-auto" @click="error = ''"></button>
    </div>

    <EmployeeFilters
      :name="filters.name"
      :role="filters.role"
      :status="filters.status"
      :sort="filters.sort"
      @update:name="filters.name = $event"
      @update:role="filters.role = $event"
      @update:status="filters.status = $event"
      @update:sort="filters.sort = $event"
      @search="debouncedFetch"
      @filter="applyFilters"
      @clear="clearFilters"
    />

    <EmployeeTable
      :employees="employees"
      :loading="loading"
      @edit="openEdit"
      @delete="openDeleteConfirm"
    />

    <PaginationBar
      :page="page"
      :total-pages="totalPages"
      :total="total"
      :limit="limit"
      @go-to="goToPage"
      @update:limit="onLimitChange"
    />

    <EmployeeForm
      v-if="showForm"
      :employee="selectedEmployee"
      @saved="onSaved"
      @close="showForm = false"
    />

    <ConfirmModal
      v-if="showConfirm && employeeToDelete"
      :message="`Deseja excluir o funcionário &quot;${employeeToDelete.name}&quot;? Esta ação não pode ser desfeita.`"
      @confirm="doDelete"
      @cancel="showConfirm = false"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { Employee, ImportSummary } from '../types/employee';
import { employeeApi }  from '../services/api';
import EmployeeFilters  from '../components/EmployeeFilters.vue';
import EmployeeTable    from '../components/EmployeeTable.vue';
import PaginationBar    from '../components/PaginationBar.vue';
import EmployeeForm     from '../components/EmployeeForm.vue';
import ConfirmModal     from '../components/ConfirmModal.vue';

const employees  = ref<Employee[]>([]);
const loading    = ref(false);
const error      = ref('');
const page       = ref(1);
const limit      = ref(10);
const total      = ref(0);
const totalPages = ref(1);

const filters = reactive({ name: '', role: '', status: '', sort: '' });

const importing     = ref(false);
const exporting     = ref(false);
const importSummary = ref<ImportSummary | null>(null);
const fileInput     = ref<HTMLInputElement | null>(null);

const showForm         = ref(false);
const selectedEmployee = ref<Employee | null>(null);
const showConfirm      = ref(false);
const employeeToDelete = ref<Employee | null>(null);

async function fetchEmployees() {
  loading.value = true;
  error.value   = '';
  try {
    const params: Record<string, unknown> = { page: page.value, limit: limit.value };
    if (filters.name)   params.name   = filters.name;
    if (filters.role)   params.role   = filters.role;
    if (filters.status) params.status = filters.status;
    if (filters.sort)   params.sort   = filters.sort;

    const { data }   = await employeeApi.list(params);
    employees.value  = data.data;
    total.value      = data.meta.total;
    totalPages.value = data.meta.totalPages;
  } catch {
    error.value = 'Não foi possível carregar os funcionários. Verifique se a API está disponível.';
  } finally {
    loading.value = false;
  }
}

function goToPage(n: number) {
  if (n < 1 || n > totalPages.value) return;
  page.value = n;
  fetchEmployees();
}

function applyFilters() {
  page.value = 1;
  fetchEmployees();
}

function clearFilters() {
  filters.name   = '';
  filters.role   = '';
  filters.status = '';
  filters.sort   = '';
  page.value     = 1;
  fetchEmployees();
}

// aguarda 400ms dps de digitar para buscar buscar
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
function debouncedFetch() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { page.value = 1; fetchEmployees(); }, 400);
}

// Importar planilha
async function handleImport(event: Event) {
  const input = event.target as HTMLInputElement;
  const file  = input.files?.[0];
  if (!file) return;

  importing.value     = true;
  importSummary.value = null;
  try {
    const { data }      = await employeeApi.import(file);
    importSummary.value = data;
    fetchEmployees();
  } catch {
    error.value = 'Erro ao importar planilha. Verifique se o arquivo é um .xlsx válido com os campos corretos.';
  } finally {
    importing.value = false;
    input.value     = '';
  }
}

// Exportar planilha
async function handleExport() {
  exporting.value = true;
  try {
    const params: Record<string, unknown> = {};
    if (filters.name)   params.name   = filters.name;
    if (filters.role)   params.role   = filters.role;
    if (filters.status) params.status = filters.status;

    const { data } = await employeeApi.export(params);

    // Cria um link temporário e simula um clique para forçar o download
    const url  = URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href     = url;
    link.download = 'funcionarios.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch {
    error.value = 'Erro ao exportar funcionários. Tente novamente.';
  } finally {
    exporting.value = false;
  }
}

// Handlers dos modais 
function openCreate() { selectedEmployee.value = null; showForm.value = true; }
function openEdit(emp: Employee) { selectedEmployee.value = emp; showForm.value = true; }
function onSaved() { showForm.value = false; fetchEmployees(); }

function openDeleteConfirm(emp: Employee) {
  employeeToDelete.value = emp;
  showConfirm.value      = true;
}

async function doDelete() {
  if (!employeeToDelete.value) return;
  try {
    await employeeApi.remove(employeeToDelete.value.uuid);
    showConfirm.value      = false;
    employeeToDelete.value = null;
    if (employees.value.length === 1 && page.value > 1) page.value--;
    fetchEmployees();
  } catch {
    error.value       = 'Erro ao excluir funcionário. Tente novamente.';
    showConfirm.value = false;
  }
}

function onLimitChange(val: number) {
  limit.value = val;
  applyFilters();
}

onMounted(fetchEmployees);
</script>
