<template>
  <Teleport to="body">
    <div class="modal fade show d-block" @click.self="emit('cancel')">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow">

          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title">
              <i class="bi bi-trash text-danger me-2"></i>Confirmar exclusão
            </h5>
            <button type="button" class="btn-close" @click="emit('cancel')"></button>
          </div>

          <div class="modal-body pt-2">
            <p class="text-muted mb-0">{{ message }}</p>
          </div>

          <div class="modal-footer border-0">
            <button type="button" class="btn btn-secondary btn-sm" @click="emit('cancel')">
              Cancelar
            </button>
            <button type="button" class="btn btn-danger btn-sm" @click="emit('confirm')">
              <i class="bi bi-trash me-1"></i>Confirmar exclusão
            </button>
          </div>

        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show"></div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ message: string }>();

const emit = defineEmits<{ confirm: []; cancel: [] }>();
</script>
