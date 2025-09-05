import express from 'express';
import { getTeams, createTeam, deleteTeam, endAllRounds, updateTeamWallet } from '../controllers/teamController.js';
import verifyToken from '../middleware/verifyToken.js';
const router = express.Router();

router.get('/:tableId', verifyToken, getTeams);
router.post('/', verifyToken, createTeam);
router.delete('/:id', verifyToken, deleteTeam);
// Admin-only: End all rounds for all tables
router.post('/end-all-rounds', verifyToken, endAllRounds);
router.post('/update-wallet', verifyToken, updateTeamWallet);

export default router;
