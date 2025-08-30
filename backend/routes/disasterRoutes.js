import express from 'express';
import { triggerDisaster } from '../controllers/disasterController.js';
import verifyToken from '../middleware/verifyToken.js';
const router = express.Router();

router.post('/trigger', verifyToken, triggerDisaster);

export default router;
