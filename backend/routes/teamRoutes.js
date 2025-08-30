import express from 'express';
import { getTeams, createTeam, deleteTeam, endRound } from '../controllers/teamController.js';
import verifyToken from '../middleware/verifyToken.js';
const router = express.Router();

router.get('/:tableId', verifyToken, getTeams);
router.post('/', verifyToken, createTeam);
router.delete('/:id', verifyToken, deleteTeam);
router.post('/end-round', verifyToken, endRound);

export default router;
