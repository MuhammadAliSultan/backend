// import { GroupChat } from "../models/groupChat.model.js";
// import { GroupMessage } from "../models/groupMessage.model.js";
// import { ApiError } from "../utils/apiError.js";
// import { ApiResponse } from "../utils/apiResponse.js";
// import { AsyncHandler } from "../utils/asyncHandler.js";

// /**
//  * Send a group message
//  * Rules:
//  * - Sender must be a member of the group
//  * - If onlyAdminsCanSend is true, sender must be an admin
//  */
// const sendGroupMessage = AsyncHandler(async (req, res) => {
//     const { groupId}=req.query;
//     const{ content, attachments } = req.body;

//     if (!groupId) throw new ApiError(400, "Group ID is required");
//     if (!content && (!attachments || attachments.length === 0)) {
//         throw new ApiError(400, "Message content or attachment is required");
//     }

//     const group = await GroupChat.findById(groupId);
//     if (!group) throw new ApiError(404, "Group not found");

//     // Membership check
//     const isMember = group.members.some(
//         id => id.toString() === req.user._id.toString()
//     );
//     if (!isMember) throw new ApiError(403, "You are not a member of this group");

//     // Admin send restriction
//     if (group.onlyAdminsCanSend) {
//         const isAdmin = group.admins.some(
//             id => id.toString() === req.user._id.toString()
//         );
//         if (!isAdmin) {
//             throw new ApiError(403, "Only admins can send messages in this group");
//         }
//     }

//     const message = await GroupMessage.create({
//         groupId: group._id,
//         sender: req.user._id,
//         content,
//         attachments
//     });

//     group.lastMessage = message._id;
//     await group.save();

//     return res
//         .status(201)
//         .json(new ApiResponse(201, message, "Group message sent successfully"));
// });

// /**
//  * Get all messages from a group
//  * User must be a member
//  */
// const getGroupMessages = AsyncHandler(async (req, res) => {
//     const { groupId } = req.query;

//     if (!groupId) throw new ApiError(400, "Group ID is required");

//     const group = await GroupChat.findById(groupId);
//     if (!group) throw new ApiError(404, "Group not found");

//     const isMember = group.members.some(
//         id => id.toString() === req.user._id.toString()
//     );
//     if (!isMember) throw new ApiError(403, "You are not a member of this group");

//     const messages = await GroupMessage.find({ groupId })
//         .sort({ createdAt: -1 })
//         .populate("sender", "username avatar");

//     return res
//         .status(200)
//         .json(new ApiResponse(200, messages, "Group messages fetched successfully"));
// });

// /**
//  * Delete a group message
//  * - Admin can delete any message
//  * - Sender can delete only their own
//  */
// const deleteGroupMessage = AsyncHandler(async (req, res) => {
//     const { messageId } = req.params;

//     const message = await GroupMessage.findById(messageId);
//     if (!message) throw new ApiError(404, "Message not found");

//     const group = await GroupChat.findById(message.groupId);
//     if (!group) throw new ApiError(404, "Group not found");

//     const isAdmin = group.admins.some(
//         id => id.toString() === req.user._id.toString()
//     );

//     if (!isAdmin && message.sender.toString() !== req.user._id.toString()) {
//         throw new ApiError(403, "You don't have permission to delete this message");
//     }

//     await message.deleteOne();

//     return res
//         .status(200)
//         .json(new ApiResponse(200, null, "Group message deleted successfully"));
// });

// export {
//     sendGroupMessage,
//     getGroupMessages,
//     deleteGroupMessage
// };
