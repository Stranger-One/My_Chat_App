import express from 'express'
import { addStatus, getAllStatus } from '../controllers/statusController.js'

const router = express.Router()

router.post("/add", addStatus)
router.get("/get", getAllStatus)

export default router;