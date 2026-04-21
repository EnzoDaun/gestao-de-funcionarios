import express from 'express';
import cors from 'cors';
import employeeRoutes from './routes/employee.routes';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.use('/funcionarios', employeeRoutes);
app.use(errorMiddleware);

export default app;
