import express from 'express';
import { addCall, getCallLog } from '../controllers/callController.js';

const router = express.Router();

router.post('/add', addCall);
router.get('/get', getCallLog);

export default router;