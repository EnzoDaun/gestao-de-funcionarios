import { Router } from 'express';
import multer from 'multer';
import { EmployeeController } from '../controllers/employee.controller';
import { EmployeeService } from '../services/employee.service';
import { EmployeeRepository } from '../repositories/employee.repository';

const router = Router();
const repository = new EmployeeRepository();
const service = new EmployeeService(repository);
const controller = new EmployeeController(service);
const upload = multer({ storage: multer.memoryStorage() });
router.post('/import', upload.single('file'), controller.importFile);
router.get('/export', controller.exportFile);
router.post('/', controller.create);
router.get('/', controller.list);
router.get('/:uuid', controller.getOne);
router.put('/:uuid', controller.update);
router.delete('/:uuid', controller.remove);

export default router;
