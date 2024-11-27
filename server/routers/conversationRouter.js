import express from "express";
import { getConversation, getAllConversations, findConversation } from "../controllers/conversationController.js";

const router = express.Router();

router.get("/get-conversation", getConversation)
router.get("/get-all-conversation", getAllConversations)
router.get("/find-conversation", findConversation)


export default router;