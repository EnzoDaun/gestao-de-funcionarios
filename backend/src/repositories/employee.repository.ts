import { v4 as uuidv4 } from 'uuid';
import db from '../db/knex';
import {
  Employee,
  CreateEmployeeDTO,
  ListQuery,
} from '../types/employee';

// O Repository é a camada responsável por conversar com o bd.
export class EmployeeRepository {
  // Busca todos os funcionários com filtros, ordenação e paginação.
  async findAll(query: ListQuery): Promise<{ data: Employee[]; total: number }> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const offset = (page - 1) * limit;

    let baseQuery = db('employees');

    if (query.name) {
      baseQuery = baseQuery.where('name', 'like', `%${query.name}%`);
    }
    if (query.role) {
      baseQuery = baseQuery.where('role', 'like', `%${query.role}%`);
    }
    if (query.status) {
      baseQuery = baseQuery.where('status', query.status);
    }

    // .clone() cria uma cópia da query para contar o total sem afetar a query principal.
    const countResult = await baseQuery.clone().count('* as total').first();
    const total = Number(countResult?.total ?? 0);

    // Aplica ordenação somente se o campo for um dos permitidos.
    const allowedSorts = ['name', 'role', 'salary', 'contract_date', 'status'];
    if (query.sort && allowedSorts.includes(query.sort)) {
      baseQuery = baseQuery.orderBy(query.sort, 'asc');
    } else {
      baseQuery = baseQuery.orderBy('name', 'asc');
    }

    const data = await baseQuery.select('*').limit(limit).offset(offset);

    return { data: data as Employee[], total };
  }

  // Busca um funcionário pelo UUID. Retorna null se não encontrado.
  async findById(uuid: string): Promise<Employee | null> {
    const employee = await db('employees').where({ uuid }).first();
    return employee as Employee | null;
  }

  // Cria um novo funcionário.
  async create(data: CreateEmployeeDTO): Promise<Employee> {
    const uuid = uuidv4();
    const now = new Date();

    await db('employees').insert({
      uuid,
      ...data,
      created_at: now,
      updated_at: now,
    });

    const created = await this.findById(uuid);
    return created as Employee;
  }

  // Atualiza um funcionário existente
  async update(uuid: string, data: Partial<CreateEmployeeDTO>): Promise<Employee | null> {
    await db('employees')
      .where({ uuid })
      .update({
        ...data,
        updated_at: new Date(),
      });

    return this.findById(uuid);
  }

  // Remove um funcionário
  async remove(uuid: string): Promise<void> {
    await db('employees').where({ uuid }).delete();
  }

  // Insere múltiplos funcionários e retorna quantos foram inseridos com sucesso.
  async bulkCreate(employees: CreateEmployeeDTO[]): Promise<number> {
    if (employees.length === 0) return 0;

    const now = new Date();
    const rows = employees.map((emp) => ({
      uuid: uuidv4(),
      ...emp,
      created_at: now,
      updated_at: now,
    }));

    await db('employees').insert(rows);
    return rows.length;
  }

  // Busca todos os funcionários sem paginação (p/ exportar).
  async findAllForExport(query: Omit<ListQuery, 'page' | 'limit'>): Promise<Employee[]> {
    let baseQuery = db('employees');

    if (query.name) baseQuery = baseQuery.where('name', 'like', `%${query.name}%`);
    if (query.role) baseQuery = baseQuery.where('role', 'like', `%${query.role}%`);
    if (query.status) baseQuery = baseQuery.where('status', query.status);

    const data = await baseQuery.select('*').orderBy('name', 'asc');
    return data as Employee[];
  }
}