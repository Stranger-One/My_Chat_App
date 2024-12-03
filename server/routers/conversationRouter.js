import express from "express";
import { getConversation, getAllConversations, findConversation, deleteConversation } from "../controllers/conversationController.js";

const router = express.Router();

router.get("/get-conversation", getConversation)
router.get("/get-all-conversation", getAllConversations)
router.get("/find-conversation", findConversation)
router.delete("/delete-conversation/:conversationId", deleteConversation)


export default router;