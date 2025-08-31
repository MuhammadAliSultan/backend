import { isValidObjectId } from "mongoose";
import { PersonalMessage } from "../models/personalMessage.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { AsyncHandler } from "../utils/asyncHandler.js";
import { getIo } from "../utils/socket.js";

// -------------------------
// Send personal message
// -------------------------
const sendPersonalMessage = AsyncHandler(async (req, res) => {
  const receiverId = req.params?.receiverId || req.query?.receiverId || req.body?.receiverId;
  const { content, attachments } = req.body || {};

  console.log("receiverId param:", receiverId);
  console.log("📥 sendPersonalMessage called:", {
    sender: req.user?._id,
    receiverId,
    content,
    attachments,
  });

  if (!receiverId) throw new ApiError(400, "Receiver ID is required");
  if (!isValidObjectId(receiverId)) throw new ApiError(400, "Invalid receiver ID");

  if (req.user?._id?.toString() === receiverId.toString()) {
    throw new ApiError(400, "You cannot send a message to yourself");
  }

  // Check if either user has blocked the other
  const sender = await User.findById(req.user._id);
  const receiver = await User.findById(receiverId);

  if (!sender || !receiver) {
    throw new ApiError(404, "User not found");
  }

  // Check if sender has blocked receiver
  if (sender.blockedUsers.includes(receiverId)) {
    throw new ApiError(403, "You have blocked this user");
  }

  // Check if receiver has blocked sender
  if (receiver.blockedUsers.includes(req.user._id)) {
    throw new ApiError(403, "You are blocked by this user");
  }

  // More robust check: content must be a non-empty string if no attachments
  const hasContent = typeof content === 'string' && content.trim().length > 0;
  const hasAttachments = Array.isArray(attachments) && attachments.length > 0;

  if (!hasContent && !hasAttachments) {
    throw new ApiError(400, "Message content or attachment is required");
  }

  const message = await PersonalMessage.create({
    sender: req.user._id,
    receiver: receiverId,
    content,
    attachments
  });

  await message.populate([
    { path: "sender", select: "userName fullName avatar" },
    { path: "receiver", select: "userName fullName avatar" },
  ]);

  return res
    .status(201)
    .json(new ApiResponse(201, message, "Message sent successfully"));
});

// -------------------------
// Get all messages in conversation
// -------------------------
const getPersonalMessages = AsyncHandler(async (req, res) => {
  const receiverId =
    req.params?.receiverId || req.query?.receiverId || req.body?.receiverId;
     console.log("receiverId param:", receiverId);

  if (!receiverId) throw new ApiError(400, "Receiver ID is required");
  if (!isValidObjectId(receiverId)) {
    throw new ApiError(400, "Invalid receiver ID");
  }

  const messages = await PersonalMessage.find({
    $or: [
      { sender: req.user._id, receiver: receiverId },
      { sender: receiverId, receiver: req.user._id }
    ]
  })
    .sort({ createdAt: 1 })
    .populate("sender", "userName fullName avatar")
    .populate("receiver", "userName fullName avatar")
    .lean();

  // Modify messages to show "deleted" content for deleted messages
  const processedMessages = messages.map(message => {
    // Check if current user has deleted this message
    const isDeletedByCurrentUser = message.deletedBy && message.deletedBy.includes(req.user._id);
    // Check if the other user has deleted this message
    const isDeletedByOtherUser = message.deletedBy && message.deletedBy.some(userId => userId.toString() !== req.user._id.toString());

    if (isDeletedByCurrentUser) {
      // Sender sees original content (not deleted)
      return message;
    } else if (isDeletedByOtherUser) {
      // Receiver sees "This message was deleted"
      return {
        ...message,
        content: "This message was deleted",
        attachments: [],
        isDeleted: true
      };
    }
    return message;
  });

  return res
    .status(200)
    .json(new ApiResponse(200, processedMessages, "Messages fetched successfully"));
});

// -------------------------
// Delete single message
// -------------------------
const deletePersonalMessage = AsyncHandler(async (req, res) => {
  const { messageId } = req.params;

  if (!isValidObjectId(messageId)) throw new ApiError(400, "Invalid message ID");

  const message = await PersonalMessage.findById(messageId);
  if (!message) throw new ApiError(404, "Message not found");

  // Only sender can delete their own message
  if (message.sender.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own messages");
  }

  // Mark message as deleted for everyone
  message.deletedForEveryone = true;
  message.content = "This message was deleted";
  message.attachments = [];
  await message.save();

  // Emit socket event to notify other users about the deleted message
  const io = getIo();
  if (io) {
    // Emit to the chat room that both users are in
    const roomId = [req.user._id.toString(), message.receiver.toString()].sort().join('_');
    io.to(roomId).emit("message_deleted", {
      messageId: messageId,
      deletedBy: req.user._id,
      deletedForEveryone: true
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Message deleted successfully"));
});

// -------------------------
// Get last message in conversation
// -------------------------
const getLastMessage = AsyncHandler(async (req, res) => {
  const receiverId =
    req.params?.receiverId || req.query?.receiverId || req.body?.receiverId;

  if (!receiverId) throw new ApiError(400, "Receiver ID is required");
  if (!isValidObjectId(receiverId)) {
    throw new ApiError(400, "Invalid receiver ID");
  }

  const lastMessage = await PersonalMessage.findOne({
    $or: [
      { sender: req.user._id, receiver: receiverId },
      { sender: receiverId, receiver: req.user._id }
    ],
    deletedBy: { $ne: req.user._id } // Exclude messages deleted by current user
  })
    .sort({ createdAt: -1 })
    .populate("sender", "userName fullName avatar")
    .populate("receiver", "userName fullName avatar")
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, lastMessage, "Last message fetched successfully"));
});

const deleteConversation = AsyncHandler(async (req, res) => {
  const receiverId =
    req.params?.receiverId || req.query?.receiverId || req.body?.receiverId;

  if (!receiverId) throw new ApiError(400, "Receiver ID is required");
  if (!isValidObjectId(receiverId)) throw new ApiError(400, "Invalid receiver ID");

  // Mark all messages in the conversation as deleted by the current user
  await PersonalMessage.updateMany(
    {
      $or: [
        { sender: req.user._id, receiver: receiverId },
        { sender: receiverId, receiver: req.user._id }
      ],
      deletedBy: { $ne: req.user._id }
    },
    { $push: { deletedBy: req.user._id } }
  );

  // Emit socket event to update sidebar for the user who cleared the chat
  const io = getIo();
  if (io) {
    // Emit to the chat room that both users are in
    const roomId = [req.user._id.toString(), receiverId.toString()].sort().join('_');
    io.to(roomId).emit("conversation_cleared", {
      userId: receiverId,
      clearedBy: req.user._id
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Conversation cleared for current user"));
});

export {
  sendPersonalMessage,
  getPersonalMessages,
  getLastMessage,
  deletePersonalMessage,
  deleteConversation
};
