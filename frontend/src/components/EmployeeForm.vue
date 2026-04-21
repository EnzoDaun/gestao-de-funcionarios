<template>
  <Teleport to="body">
    <div class="modal fade show d-block" @click.self="emit('close')">
      <div class="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
        <div class="modal-content shadow">

          <div class="modal-header">
            <h5 class="modal-title">
              <i :class="['bi', 'me-2', isEditing ? 'bi-pencil-square' : 'bi-person-plus']"></i>
              {{ isEditing ? 'Editar Funcionário' : 'Novo Funcionário' }}
            </h5>
            <button type="button" class="btn-close" @click="emit('close')"></button>
          </div>

          <div class="modal-body">
            <div v-if="apiError" class="alert alert-danger py-2 small">{{ apiError }}</div>

            <div class="row g-3">

              <div class="col-md-6">
                <label class="form-label">Nome <span class="text-danger">*</span></label>
                <input
                  v-model="form.name"
                  class="form-control"
                  :class="{ 'is-invalid': submitted && !form.name }"
                  placeholder="Nome completo"
                />
                <div class="invalid-feedback">Campo obrigatório</div>
              </div>

              <div class="col-md-6">
                <label class="form-label">Cargo <span class="text-danger">*</span></label>
                <input
                  v-model="form.role"
                  class="form-control"
                  :class="{ 'is-invalid': submitted && !form.role }"
                  placeholder="Ex: Desenvolvedor, Analista..."
                />
                <div class="invalid-feedback">Campo obrigatório</div>
              </div>

              <div class="col-12">
                <label class="form-label">Endereço <span class="text-danger">*</span></label>
                <input
                  v-model="form.address"
                  class="form-control"
                  :class="{ 'is-invalid': submitted && !form.address }"
                  placeholder="Rua, número, complemento"
                />
                <div class="invalid-feedback">Campo obrigatório</div>
              </div>

              <div class="col-md-6">
                <label class="form-label">Bairro</label>
                <input v-model="form.neighborhood" class="form-control" placeholder="Bairro" />
              </div>

              <div class="col-md-3">
                <label class="form-label">CEP</label>
                <input v-model="form.zipcode" class="form-control" placeholder="00000-000" maxlength="9" />
              </div>

              <div class="col-md-3">
                <label class="form-label">Telefone</label>
                <input v-model="form.phone" class="form-control" placeholder="(00) 00000-0000" maxlength="20" />
              </div>

              <div class="col-md-4">
                <label class="form-label">Salário (R$) <span class="text-danger">*</span></label>
                <input
                  v-model="form.salary"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  :class="{ 'is-invalid': submitted && !form.salary }"
                  placeholder="0,00"
                />
                <div class="invalid-feedback">Campo obrigatório</div>
              </div>

              <div class="col-md-4">
                <label class="form-label">Data de Contrato <span class="text-danger">*</span></label>
                <input
                  v-model="form.contract_date"
                  type="date"
                  class="form-control"
                  :class="{ 'is-invalid': submitted && !form.contract_date }"
                />
                <div class="invalid-feedback">Campo obrigatório</div>
              </div>

              <div class="col-md-4">
                <label class="form-label">Status <span class="text-danger">*</span></label>
                <select
                  v-model="form.status"
                  class="form-select"
                  :class="{ 'is-invalid': submitted && !form.status }"
                >
                  <option value="">Selecione...</option>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                  <option value="Férias">Férias</option>
                  <option value="Afastado">Afastado</option>
                </select>
                <div class="invalid-feedback">Campo obrigatório</div>
              </div>

            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="emit('close')">Cancelar</button>
            <button type="button" class="btn btn-primary" :disabled="saving" @click="handleSubmit">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1" role="status"></span>
              <i v-else :class="['bi', 'me-1', isEditing ? 'bi-check-lg' : 'bi-plus-lg']"></i>
              {{ saving ? 'Salvando...' : (isEditing ? 'Salvar alterações' : 'Criar funcionário') }}
            </button>
          </div>

        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show"></div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Employee } from '../types/employee';
import { employeeApi } from '../services/api';

const props = defineProps<{ employee?: Employee | null }>();
const emit  = defineEmits<{ saved: []; close: [] }>();

const isEditing = computed(() => Boolean(props.employee?.uuid));
const saving    = ref(false);
const submitted = ref(false);
const apiError  = ref('');

const form = ref({
  name: '', address: '', neighborhood: '', zipcode: '',
  phone: '', salary: 0, contract_date: '', role: '', status: '',
});

onMounted(() => {
  if (props.employee) {
    form.value = {
      name:          props.employee.name,
      address:       props.employee.address,
      neighborhood:  props.employee.neighborhood  ?? '',
      zipcode:       props.employee.zipcode        ?? '',
      phone:         props.employee.phone          ?? '',
      salary:        Number(props.employee.salary),
      contract_date: props.employee.contract_date,
      role:          props.employee.role,
      status:        props.employee.status,
    };
  }
});

async function handleSubmit() {
  submitted.value = true;
  saving.value    = true;
  apiError.value  = '';
  try {
    const payload = { ...form.value, salary: Number(form.value.salary) };
    if (isEditing.value && props.employee?.uuid) {
      await employeeApi.update(props.employee.uuid, payload);
    } else {
      await employeeApi.create(payload);
    }
    emit('saved');
  } catch (err: unknown) {
    const e        = err as { response?: { data?: { error?: string } } };
    apiError.value = e.response?.data?.error ?? 'Erro ao salvar. Verifique os dados e tente novamente.';
  } finally {
    saving.value = false;
  }
}
</script>
