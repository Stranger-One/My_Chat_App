import express from "express";
import { 
    getConversation, 
    getAllConversations, 
    findConversation, 
    deleteConversation,
    reactToMessage,
    deleteMessage,
    clearChat
} from "../controllers/conversationController.js";

const router = express.Router();

router.get("/get-conversation", getConversation);
router.get("/get-all-conversation", getAllConversations);
router.get("/find-conversation", findConversation);
router.delete("/delete-conversation/:conversationId", deleteConversation);
router.post("/react-message", reactToMessage);
router.post("/delete-message/:messageId", deleteMessage);
router.post("/clear-chat/:conversationId", clearChat);

export default router;