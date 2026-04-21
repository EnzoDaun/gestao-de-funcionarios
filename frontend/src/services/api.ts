import axios from 'axios';
import type { Employee, PaginatedResult, ImportSummary } from '../types/employee';

const api = axios.create({
  baseURL: '/api',
});

export const employeeApi = {
  // Lista funcionários
  list: (params: Record<string, unknown>) =>
    api.get<PaginatedResult>('/funcionarios', { params }),

  // Busca um funcionário pelo UUID
  getOne: (uuid: string) =>
    api.get<Employee>(`/funcionarios/${uuid}`),

  // Cria um novo funcionário
  create: (data: Partial<Employee>) =>
    api.post<Employee>('/funcionarios', data),

  // Atualiza um funcionário
  update: (uuid: string, data: Partial<Employee>) =>
    api.put<Employee>(`/funcionarios/${uuid}`, data),

  // Remove um funcionário
  remove: (uuid: string) =>
    api.delete(`/funcionarios/${uuid}`),

  // Importa funcionários de um arquivo .xlsx
  import: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ImportSummary>('/funcionarios/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Exporta funcionários para .xlsx
  export: (params: Record<string, unknown>) =>
    api.get('/funcionarios/export', {
      params,
      responseType: 'blob',
    }),
};
