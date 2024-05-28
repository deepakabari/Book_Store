import { Router } from 'express';
import { commonController } from '../../controllers';
import isAuth from '../../middleware/in-auth';

const router = Router();

router.use(isAuth);

router.get('/viewFile/:fileName', commonController.viewFile);

router.get('/downloadFile/:fileName', commonController.downloadFile);

router.get('/exportBooks', commonController.exportBooks);

export default router;
