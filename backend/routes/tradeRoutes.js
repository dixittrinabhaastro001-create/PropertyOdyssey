import express from 'express';
import { tradeProperty } from '../controllers/tradeController.js';
import verifyToken from '../middleware/verifyToken.js';
const router = express.Router();

router.post('/property', verifyToken, tradeProperty);

export default router;
