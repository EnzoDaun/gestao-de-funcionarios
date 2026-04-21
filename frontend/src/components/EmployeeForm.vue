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
                  maxlength="255"
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
                  maxlength="255"
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
                  maxlength="255"
                />
                <div class="invalid-feedback">Campo obrigatório</div>
              </div>

              <div class="col-md-6">
                <label class="form-label">Bairro</label>
                  <input v-model="form.neighborhood" class="form-control" placeholder="Bairro" maxlength="255" />
              </div>

              <div class="col-md-3">
                <label class="form-label">CEP</label>
                <input
                  :value="form.zipcode"
                  @input="onCepInput"
                  class="form-control"
                  :class="{ 'is-invalid': submitted && form.zipcode && !isCepValid }"
                  placeholder="00000-000"
                  inputmode="numeric"
                />
                <div class="invalid-feedback">CEP inválido — use o formato 00000-000</div>
              </div>

              <div class="col-md-3">
                <label class="form-label">Telefone</label>
                <input
                  :value="form.phone"
                  @input="onPhoneInput"
                  class="form-control"
                  :class="{ 'is-invalid': submitted && form.phone && !isPhoneValid }"
                  placeholder="(00) 00000-0000"
                  inputmode="numeric"
                />
                <div class="invalid-feedback">Telefone inválido — use (XX) XXXX-XXXX ou (XX) XXXXX-XXXX</div>
              </div>

              <div class="col-md-4">
                <label class="form-label">Salário (R$) <span class="text-danger">*</span></label>
                <input
                  v-model="form.salary"
                  @input="onSalaryInput"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  :class="{ 'is-invalid': submitted && isSalaryInvalid }"
                  placeholder="0,00"
                />
                <div class="invalid-feedback">
                  {{ Number(form.salary) < 0 ? 'Salário não pode ser negativo' : 'Campo obrigatório' }}
                </div>
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

  if (!isCepValid.value || !isPhoneValid.value || isSalaryInvalid.value) {
    apiError.value = 'Corrija os campos destacados antes de salvar.';
    return;
  }

  saving.value   = true;
  apiError.value = '';
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

const isCepValid = computed(() =>
  form.value.zipcode === '' || /^\d{5}-\d{3}$/.test(form.value.zipcode)
);

const isPhoneValid = computed(() =>
  form.value.phone === '' ||
  /^\(\d{2}\) \d{4}-\d{4}$/.test(form.value.phone) ||
  /^\(\d{2}\) \d{5}-\d{4}$/.test(form.value.phone)
);

const isSalaryInvalid = computed(() => {
  const val = Number(form.value.salary);
  return form.value.salary === null || isNaN(val) || val < 0;
});

function onCepInput(e: Event) {
  const input = e.target as HTMLInputElement;
  const digits = input.value.replace(/\D/g, '').slice(0, 8);
  const formatted = digits.length > 5
    ? `${digits.slice(0, 5)}-${digits.slice(5)}`
    : digits;
    
  input.value = formatted;
  form.value.zipcode = formatted;
}

function onPhoneInput(e: Event) {
  const input = e.target as HTMLInputElement;
  const digits = input.value.replace(/\D/g, '').slice(0, 11);

  let formatted = '';
  if (digits.length === 0)        formatted = '';
  else if (digits.length <= 2)    formatted = `(${digits}`;
  else if (digits.length <= 6)    formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  else if (digits.length <= 10)   formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  else                            formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;

  input.value = formatted;
  form.value.phone = formatted;
}

function onSalaryInput(e: Event) {
  const val = parseFloat((e.target as HTMLInputElement).value);
  if (!isNaN(val) && val < 0) form.value.salary = 0;
}
</script>
