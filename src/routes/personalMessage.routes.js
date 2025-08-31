import { Router } from "express";
import {
  sendPersonalMessage,
  getPersonalMessages,
  getLastMessage,
  deletePersonalMessage,
  deleteConversation
} from "../controllers/personalMessage.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

// -------------------------
// Send a personal message
// POST /api/messages/:receiverId
// -------------------------
router.post("/:receiverId", verifyJwt, sendPersonalMessage);

// -------------------------
// Get all messages with a specific receiver
// GET /api/messages/:receiverId
// -------------------------
router.get("/:receiverId", verifyJwt, getPersonalMessages);

// -------------------------
// Get last message with a specific receiver
// GET /api/messages/:receiverId/last
// -------------------------
router.get("/:receiverId/last", verifyJwt, getLastMessage);

// -------------------------
// Delete a single message
// DELETE /api/messages/message/:messageId
// -------------------------
router.delete("/message/:messageId", verifyJwt, deletePersonalMessage);

// -------------------------
// Delete entire conversation
// DELETE /api/messages/conversation/:receiverId
// -------------------------
router.delete("/conversation/:receiverId", verifyJwt, deleteConversation);

export default router;
