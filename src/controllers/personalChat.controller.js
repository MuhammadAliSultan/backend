import { PersonalChat } from "../models/personalChat.model.js";
import { PersonalMessage } from "../models/personalMessage.model.js";
import { AsyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

// /**
//  * Create a personal chat between two users
//  */
// const createPersonalChat = AsyncHandler(async (req, res) => {
//     const { participantId } = req.body;

//     if (!participantId) throw new ApiError(400, "participantId is required");

//     // Check if chat already exists
//     let existingChat = await PersonalChat.findOne({
//         participants: { $all: [req.user._id, participantId] }
//     });

//     if (existingChat) {
//         return res
//             .status(200)
//             .json(new ApiResponse(200, existingChat, "Personal chat already exists"));
//     }

//     // Create new chat
//     const newChat = await PersonalChat.create({
//         participants: [req.user._id, participantId]
//     });

//     return res
//         .status(201)
//         .json(new ApiResponse(201, newChat, "Personal chat created successfully"));
// });

// /**
//  * Get all personal chats for current user
//  */
// const getPersonalChats = AsyncHandler(async (req, res) => {
//     const chats = await PersonalChat.find({
//         participants: req.user._id
//     })
//         .populate("participants", "name email avatar")
//         .populate("lastMessage")
//         .sort({ updatedAt: -1 });

//     return res
//         .status(200)
//         .json(new ApiResponse(200, chats, "Personal chats fetched successfully"));
// });

// /**
//  * Delete a personal chat
//  * - Only participants can delete
//  * - Optionally deletes all messages in that chat
//  */
// const deletePersonalChat = AsyncHandler(async (req, res) => {
//     const { chatId } = req.params;

//     if (!chatId) throw new ApiError(400, "chatId is required");

//     const chat = await PersonalChat.findById(chatId);
//     if (!chat) throw new ApiError(404, "Personal chat not found");

//     // Ensure the user is a participant
//     const isParticipant = chat.participants.some(
//         id => id.toString() === req.user._id.toString()
//     );
//     if (!isParticipant) throw new ApiError(403, "You are not allowed to delete this chat");

//     // Delete messages linked to this chat
//     await PersonalMessage.deleteMany({ chatId });

//     // Delete chat
//     await chat.deleteOne();

//     return res
//         .status(200)
//         .json(new ApiResponse(200, {}, "Personal chat deleted successfully"));
// });

export {
    // createPersonalChat,
    // getPersonalChats,
    // deletePersonalChat
};
