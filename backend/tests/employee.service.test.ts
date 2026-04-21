import { EmployeeService, validateEmployee } from '../src/services/employee.service';
import { EmployeeRepository } from '../src/repositories/employee.repository';
import { CreateEmployeeDTO, Employee } from '../src/types/employee';

const mockRepository: jest.Mocked<EmployeeRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  bulkCreate: jest.fn(),
  findAllForExport: jest.fn(),
} as unknown as jest.Mocked<EmployeeRepository>;

// funcionário mockado p/ testes
const fakEmployee: Employee = {
  uuid: 'test-uuid-1234',
  name: 'João Silva',
  address: 'Rua A, 123',
  salary: 3000,
  contract_date: '2024-01-15',
  role: 'Desenvolvedor',
  status: 'Ativo',
  created_at: '2024-01-15T00:00:00.000Z',
  updated_at: '2024-01-15T00:00:00.000Z',
};

describe('validateEmployee', () => {
  it('deve retornar erros quando todos os campos obrigatórios estão ausentes', () => {
    const errors = validateEmployee({});

    expect(errors).toContain('name é obrigatório');
    expect(errors).toContain('address é obrigatório');
    expect(errors).toContain('salary é obrigatório e deve ser um número');
    expect(errors).toContain('contract_date é obrigatório');
    expect(errors).toContain('role é obrigatório');
    expect(errors).toContain('status é obrigatório');
    expect(errors.length).toBe(6);
  });

  it('deve retornar array vazio quando todos os campos obrigatórios são válidos', () => {
    const validData: Partial<CreateEmployeeDTO> = {
      name: 'Maria Souza',
      address: 'Av. Paulista, 1000',
      salary: 5000,
      contract_date: '2024-03-01',
      role: 'Analista',
      status: 'Ativo',
    };

    const errors = validateEmployee(validData);

    expect(errors).toHaveLength(0);
  });

  it('deve retornar erro quando salary não é um número', () => {
    const errors = validateEmployee({ salary: NaN });
    expect(errors).toContain('salary é obrigatório e deve ser um número');
  });

  it('deve aceitar campos opcionais como ausentes sem gerar erro', () => {
    const errors = validateEmployee({
      name: 'João',
      address: 'Rua B',
      salary: 2000,
      contract_date: '2024-01-01',
      role: 'Dev',
      status: 'Ativo',
    });
    expect(errors).toHaveLength(0);
  });
});

describe('EmployeeService', () => {
  let service: EmployeeService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EmployeeService(mockRepository);
  });

  it('deve criar um funcionário com dados válidos e chamar o repository', async () => {
    const input: CreateEmployeeDTO = {
      name: 'João Silva',
      address: 'Rua A, 123',
      salary: 3000,
      contract_date: '2024-01-15',
      role: 'Desenvolvedor',
      status: 'Ativo',
    };

    mockRepository.create.mockResolvedValue(fakEmployee);

    const result = await service.createEmployee(input);

    expect(mockRepository.create).toHaveBeenCalledTimes(1);
    expect(result.name).toBe('João Silva');
    expect(result).toHaveProperty('uuid');
  });

  it('deve lançar erro ao criar funcionário sem campos obrigatórios', async () => {
    await expect(service.createEmployee({} as CreateEmployeeDTO)).rejects.toThrow();

    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('deve lançar erro quando funcionário não é encontrado', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(service.getEmployee('uuid-inexistente')).rejects.toThrow(
      'Funcionário não encontrado'
    );
  });

  it('deve retornar a estrutura paginada corretamente', async () => {
    mockRepository.findAll.mockResolvedValue({
      data: [fakEmployee],
      total: 1,
    });

    const result = await service.listEmployees({ page: 1, limit: 10 });

    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('meta');
    expect(result.meta.total).toBe(1);
    expect(result.meta.page).toBe(1);
    expect(result.meta.totalPages).toBe(1);
  });
});
