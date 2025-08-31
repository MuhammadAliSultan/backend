import { PersonalMessage } from "./models/personalMessage.model.js";

const onlineUsers = {}; // { socketId: { userId, status, lastActive } }
const rooms = {};       // { roomId: { socketId: userId } }
const IDLE_TIMEOUT = 60 * 1000; // 60 seconds

export const socketHandler = (io, socket) => {
  console.log("🔥 New client connected:", socket.id);

  const updateActivity = () => {
    if (onlineUsers[socket.id]) {
      onlineUsers[socket.id].lastActive = Date.now();
      if (onlineUsers[socket.id].status === "away") {
        onlineUsers[socket.id].status = "online";
        emitPresenceUpdate();
      }
    }
  };

  const emitPresenceUpdate = () => {
    for (const roomId in rooms) {
      if (rooms[roomId][socket.id]) {
        const presenceList = Object.values(rooms[roomId]).map((id) => {
          const entry = Object.values(onlineUsers).find(u => u.userId === id);
          return { userId: id, status: entry?.status || "offline" };
        });
        io.to(roomId).emit("user_presence", presenceList);
      }
    }
  };

  // ===============================
  // JOIN ROOM
  // ===============================
  socket.on("join_room", ({ roomId, userId }) => {
    socket.join(roomId);
    onlineUsers[socket.id] = { userId, status: "online", lastActive: Date.now() };

    if (!rooms[roomId]) rooms[roomId] = {};
    rooms[roomId][socket.id] = userId;

    emitPresenceUpdate();

    // Emit user_connected event to notify other users in the room
    socket.to(roomId).emit("user_connected", userId);
  });

  // ===============================
  // PRIVATE MESSAGE
  // ===============================
socket.on("private_message", async ({ roomId, senderId, receiverId, content }) => {
  const hasContent = typeof content === 'string' && content.trim().length > 0;
  if (!receiverId || !hasContent) {
    console.warn("⚠️ Ignoring invalid private_message payload:", { receiverId, content });
    return;
  }

  const message = await PersonalMessage.create({
    sender: senderId,
    receiver: receiverId,
    content,
  });

  // Populate for consistency
  await message.populate([
    { path: "sender", select: "username fullName avatar" },
    { path: "receiver", select: "username fullName avatar" },
  ]);

  io.to(roomId).emit("receive_message", message);  // Broadcast to the shared room
  
  // Emit update_sidebar event to both users
  const sidebarUpdateData = {
    userId: receiverId,
    lastMessage: {
      content: message.content,
      createdAt: message.createdAt,
    }
  };
  
  // Emit to sender's room (for their sidebar)
  const senderRoomId = [senderId, receiverId].sort().join('_');
  io.to(senderRoomId).emit("update_sidebar", sidebarUpdateData);
  
  // Emit to receiver's room (for their sidebar)
  const receiverRoomId = [receiverId, senderId].sort().join('_');
  io.to(receiverRoomId).emit("update_sidebar", sidebarUpdateData);
});

  // ===============================
  // TYPING INDICATORS
  // ===============================
  socket.on("typing", ({ roomId, userId, content }) => {
    updateActivity();
    socket.to(roomId).emit("user_typing", { userId, content });
  });
  socket.on("stop_typing", ({ roomId, userId }) => {
    updateActivity();
    socket.to(roomId).emit("user_stop_typing", { userId });
  });

  // ===============================
  // MESSAGE READ
  // ===============================
  socket.on("message_read", async ({ messageId, userId }) => {
    updateActivity();

    const message = await PersonalMessage.findById(messageId);
    if (message && !message.seen) {
      message.seen = true;
      await message.save();
    }

    io.to(Object.keys(socket.rooms)).emit("message_read_update", { messageId, userId });
  });

  // ===============================
  // IDLE DETECTION
  // ===============================
  const idleInterval = setInterval(() => {
    const user = onlineUsers[socket.id];
    if (user && user.status === "online" && Date.now() - user.lastActive > IDLE_TIMEOUT) {
      user.status = "away";
      emitPresenceUpdate();
    }
  }, 10000);

  // ===============================
  // DELETE MESSAGE
  // ===============================
  socket.on("delete_message", async ({ roomId, messageId, deletedBy }) => {
    try {
      const message = await PersonalMessage.findById(messageId);
      if (!message) {
        console.warn("⚠️ Message not found for deletion:", messageId);
        return;
      }

      // Only sender can delete their own message
      if (message.sender.toString() !== deletedBy.toString()) {
        console.warn("⚠️ Unauthorized delete attempt:", { messageId, deletedBy, sender: message.sender });
        return;
      }

      // Mark message as deleted for everyone
      message.deletedForEveryone = true;
      message.content = "This message was deleted";
      message.attachments = [];
      await message.save();

      // Emit socket event to notify other users about the deleted message
      io.to(roomId).emit("message_deleted", {
        messageId: messageId,
        deletedBy: deletedBy,
        deletedForEveryone: true
      });

      console.log("✅ Message deleted via socket:", messageId);
    } catch (error) {
      console.error("❌ Error deleting message via socket:", error);
    }
  });

  // ===============================
  // RESET UNREAD COUNT
  // ===============================
  socket.on("reset_unread", (userId) => {
    // Broadcast to all connected clients to reset unread count for this user
    io.emit("reset_unread", userId);
  });

  // ===============================
  // CLEAR CONVERSATION
  // ===============================
  socket.on("conversation_cleared", ({ roomId, userId, clearedBy }) => {
    // Broadcast to all users in the room except the one who cleared it
    socket.to(roomId).emit("conversation_cleared", {
      userId,
      clearedBy
    });
  });

  // ===============================
  // USER BLOCKED
  // ===============================
  socket.on("user_blocked", ({ roomId, blockedUserId, blockedBy }) => {
    // Notify the blocked user
    socket.to(roomId).emit("user_blocked_notification", {
      blockedBy: blockedBy,
      message: "You have been blocked by this user. You cannot send messages."
    });
  });

  // ===============================
  // DISCONNECT
  // ===============================
  socket.on("disconnect", () => {
    clearInterval(idleInterval);

    const user = onlineUsers[socket.id];
    if (user) {
      const { userId } = user;
      delete onlineUsers[socket.id];

      for (const roomId in rooms) {
        if (rooms[roomId][socket.id]) {
          delete rooms[roomId][socket.id];
          emitPresenceUpdate();

          // Emit user_disconnected event to notify other users in the room
          socket.to(roomId).emit("user_disconnected", userId);
        }
      }

      console.log(`❌ Client disconnected: ${socket.id} (user ${userId})`);
    }
  });
};
