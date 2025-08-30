import express from 'express';
import { bankOperation } from '../controllers/bankController.js';
import verifyToken from '../middleware/verifyToken.js';
const router = express.Router();

router.post('/', verifyToken, bankOperation);

export default router;
