import express from 'express';
import { addCall } from '../controllers/callController.js';

const router = express.Router();

router.post('/add', addCall);

export default router;