import * as XLSX from 'xlsx';
import { EmployeeRepository } from '../repositories/employee.repository';
import {
  Employee,
  CreateEmployeeDTO,
  ListQuery,
  PaginatedResult,
  ImportSummary,
} from '../types/employee';

export function validateEmployee(data: Partial<CreateEmployeeDTO>): string[] {
  const errors: string[] = [];

  if (!data.name || String(data.name).trim() === '') {
    errors.push('Nome é obrigatório');
  } else if (String(data.name).length > 255) {
    errors.push('Nome não pode ter mais de 255 caracteres');
  }

  if (!data.address || String(data.address).trim() === '') {
    errors.push('Endereço é obrigatório');
  } else if (String(data.address).length > 255) {
    errors.push('Endereço não pode ter mais de 255 caracteres');
  }

  if (data.salary === undefined || data.salary === null || isNaN(Number(data.salary))) {
    errors.push('Salário é obrigatório e deve ser um número');
  } else if (Number(data.salary) < 0) {
    errors.push('Salário não pode ser negativo');
  }
  if (!data.contract_date) {
    errors.push('Data de Contrato é obrigatório');
  }
    if (!data.role || String(data.role).trim() === '') {
    errors.push('Cargo é obrigatório');
  } else if (String(data.role).length > 255) {
    errors.push('Cargo não pode ter mais de 255 caracteres');
  }
  if (!data.status || String(data.status).trim() === '') {
    errors.push('Status é obrigatório');
  }

  return errors;
}

export class EmployeeService {
  constructor(private readonly repository: EmployeeRepository) {}

  // Lista funcionários com paginação, filtros e metadados p/ frontend.
  async listEmployees(query: ListQuery): Promise<PaginatedResult> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const { data, total } = await this.repository.findAll({ ...query, page, limit });
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: { total, page, totalPages },
    };
  }

  // Busca um único funcionário.
  async getEmployee(uuid: string): Promise<Employee> {
    const employee = await this.repository.findById(uuid);
    if (!employee) {
      throw new Error('Funcionário não encontrado');
    }
    return employee;
  }

  // Cria novo funcionário após validação
  async createEmployee(data: CreateEmployeeDTO): Promise<Employee> {
    const errors = validateEmployee(data);
    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }

    const sanitized: CreateEmployeeDTO = {
      ...data,
      salary: Number(data.salary),
    };

    return this.repository.create(sanitized);
  }

  // Atualiza funcionário existente. Valida os campos enviados.
  async updateEmployee(uuid: string, data: Partial<CreateEmployeeDTO>): Promise<Employee> {
    const existing = await this.repository.findById(uuid);
    if (!existing) {
      throw new Error('Funcionário não encontrado');
    }

    // Merge dos dados existentes com os novos para validar o conjunto
    const merged = { ...existing, ...data };
    const errors = validateEmployee(merged);
    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }

    const updated = await this.repository.update(uuid, data);
    return updated as Employee;
  }

  // Remove um funcionário.
  async deleteEmployee(uuid: string): Promise<void> {
    const existing = await this.repository.findById(uuid);
    if (!existing) {
      throw new Error('Funcionário não encontrado');
    }
    await this.repository.remove(uuid);
  }

  // Importa funcionários a partir de um buffer de arquivo .xlsx.
  // Cada linha da planilha representa um funcionário.
  async importFromXlsx(buffer: Buffer): Promise<ImportSummary> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // sheet_to_json converte as linhas da planilha em objetos JavaScript.
    // A primeira linha da planilha é usada como chave (header).
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

    const valid: CreateEmployeeDTO[] = [];
    let rejeitados = 0;

    for (const row of rows) {
      const candidate: Partial<CreateEmployeeDTO> = {
        name: String(row['name'] ?? '').trim() || undefined,
        address: String(row['address'] ?? '').trim() || undefined,
        neighborhood: row['neighborhood'] ? String(row['neighborhood']) : undefined,
        zipcode: row['zipcode'] ? String(row['zipcode']) : undefined,
        phone: row['phone'] ? String(row['phone']) : undefined,
        salary: row['salary'] !== undefined ? Number(row['salary']) : undefined,
        contract_date: row['contract_date'] ? String(row['contract_date']) : undefined,
        role: String(row['role'] ?? '').trim() || undefined,
        status: String(row['status'] ?? '').trim() || undefined,
      };

      const errors = validateEmployee(candidate);
      if (errors.length === 0) {
        valid.push(candidate as CreateEmployeeDTO);
      } else {
        rejeitados++;
      }
    }

    const inseridos = await this.repository.bulkCreate(valid);

    return {
      total: rows.length,
      inseridos,
      rejeitados,
    };
  }

  // Gera um buffer .xlsx com todos os funcionários (respeitando filtros aplicados).
  async exportToXlsx(query: ListQuery): Promise<Buffer> {
    const employees = await this.repository.findAllForExport(query);

    const rows = employees.map((emp) => ({
      uuid: emp.uuid,
      name: emp.name,
      address: emp.address,
      neighborhood: emp.neighborhood ?? '',
      zipcode: emp.zipcode ?? '',
      phone: emp.phone ?? '',
      salary: Number(emp.salary),
      contract_date: emp.contract_date,
      role: emp.role,
      status: emp.status,
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Funcionários');

    // Retorna um Buffer (dados do arquivo .xlsx) para enviar na resposta HTTP
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
