import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import verifyToken from '../middleware/verifyToken.js';
const router = express.Router();

router.get('/', verifyToken, getSettings);
router.put('/', verifyToken, updateSettings);

export default router;
