export interface Employee {
  uuid: string;
  name: string;
  address: string;
  neighborhood?: string;
  zipcode?: string;
  phone?: string;
  salary: number;
  contract_date: string;
  role: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEmployeeDTO {
  name: string;
  address: string;
  neighborhood?: string;
  zipcode?: string;
  phone?: string;
  salary: number;
  contract_date: string;
  role: string;
  status: string;
}

export interface ListQuery {
  page?: number;
  limit?: number;
  name?: string;
  role?: string;
  status?: string;
  sort?: string;
}

export interface PaginatedResult {
  data: Employee[];
  meta: { total: number; page: number; totalPages: number };
}

export interface ImportSummary {
  total: number;
  inseridos: number;
  rejeitados: number;
}