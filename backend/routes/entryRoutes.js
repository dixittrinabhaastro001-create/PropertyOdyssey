import express from 'express';
import { createEntry, updateEntry, deleteEntry, getAllEntries, getTeamEntries } from '../controllers/entryController.js';
import verifyToken from '../middleware/verifyToken.js';
const router = express.Router();

router.post('/', verifyToken, createEntry);
router.put('/:id', verifyToken, updateEntry);
router.delete('/:id', verifyToken, deleteEntry);
router.get('/all', verifyToken, getAllEntries);
router.get('/:teamId', verifyToken, getTeamEntries);

export default router;
