import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(
  err: Error, _req: Request, res: Response, _next: NextFunction
): void {
  console.error('[ERRO]', err.message);
  res.status(400).json({ error: err.message || 'Erro interno no servidor' });
}