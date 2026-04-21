import { Request, Response, NextFunction } from 'express';
import { EmployeeService } from '../services/employee.service';

export class EmployeeController {
  constructor(private readonly service: EmployeeService) {}

  // GET /funcionarios — lista com paginação, filtros e ordenação
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.listEmployees(req.query as Record<string, string>);
      res.json(result);
    } catch (error) {
      next(error); // repassa para o middleware de erro
    }
  };

  // GET /funcionarios/:uuid — busca um funcionário pelo UUID
  getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employee = await this.service.getEmployee(req.params.uuid);
      res.json(employee);
    } catch (error) {
      next(error);
    }
  };

  // POST /funcionarios — cria um novo funcionário
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employee = await this.service.createEmployee(req.body);
      res.status(201).json(employee);
    } catch (error) {
      next(error);
    }
  };

  // PUT /funcionarios/:uuid — atualiza um funcionário existente
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employee = await this.service.updateEmployee(req.params.uuid, req.body);
      res.json(employee);
    } catch (error) {
      next(error);
    }
  };

  // DELETE /funcionarios/:uuid — remove um funcionário
  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteEmployee(req.params.uuid);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  // POST /funcionarios/import — importa funcionários via planilha .xlsx
  importFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'Nenhum arquivo enviado. Use o campo "file" no form-data.' });
        return;
      }

      // Verifica se o arquivo é um .xlsx pelo mimetype
      const allowedMimes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ];
      if (!allowedMimes.includes(req.file.mimetype)) {
        res.status(400).json({ error: 'Apenas arquivos .xlsx são aceitos.' });
        return;
      }

      const summary = await this.service.importFromXlsx(req.file.buffer);
      res.json(summary);
    } catch (error) {
      next(error);
    }
  };

  // GET /funcionarios/export — exporta funcionários como arquivo .xlsx
  exportFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const buffer = await this.service.exportToXlsx(req.query as Record<string, string>);

      // Configura os headers para que o browser entenda que é um download
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', 'attachment; filename="funcionarios.xlsx"');
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  };
}
