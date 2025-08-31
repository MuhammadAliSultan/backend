// import { Router } from "express";
// import {
//     createGroupChat,
//     getGroupChats,
//     updateGroupChat,
//     deleteGroupChat,
//     addGroupMember,
//     removeGroupMember,
//     promoteToAdmin,
//     demoteAdmin
// } from "../controllers/groupChat.controller.js";
// import { verifyJwt } from "../middlewares/auth.middleware.js";

// const router = Router();

// // Create group chat
// router.post("/", verifyJwt, createGroupChat);

// // Get all group chats for the logged-in user
// router.get("/", verifyJwt, getGroupChats);

// // Update group chat (name, settings, etc.)
// router.put("/:groupId", verifyJwt, updateGroupChat);

// // Delete group chat
// router.delete("/:groupId", verifyJwt, deleteGroupChat);

// // Add a member
// router.post("/:groupId/members", verifyJwt, addGroupMember);

// // Remove a member
// router.post("/:groupId/members", verifyJwt, removeGroupMember);

// // Promote a member to admin
// router.post("/:groupId/admins", verifyJwt, promoteToAdmin);

// // Demote an admin
// router.post("/:groupId/admins", verifyJwt, demoteAdmin);

// export default router;
