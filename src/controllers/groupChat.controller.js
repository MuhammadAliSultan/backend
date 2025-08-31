// import { GroupChat } from "../models/groupChat.model.js";
// import { AsyncHandler } from "../utils/asyncHandler.js";
// import { ApiError } from "../utils/apiError.js";
// import { ApiResponse } from "../utils/apiResponse.js";

// // Create Group Chat
// const createGroupChat = AsyncHandler(async (req, res) => {
//     const { name, members, groupImage, onlyAdminsCanMessage = false } = req.body;

//     if (!name) throw new ApiError(400, "Group name is required");
//     if (!Array.isArray(members) || members.length < 2) {
//         throw new ApiError(400, "At least 2 members are required to create a group");
//     }

//     // Ensure creator is included
//     if (!members.includes(req.user._id.toString())) {
//         members.push(req.user._id);
//     }

//     const groupChat = await GroupChat.create({
//         name,
//         members,
//         admins: [req.user._id],
//         createdBy: req.user._id,
//         groupImage: groupImage || null,
//         onlyAdminsCanMessage
//     });

//     return res
//         .status(201)
//         .json(new ApiResponse(201, groupChat, "Group chat created successfully"));
// });

// // Get All Group Chats for Current User
// const getGroupChats = AsyncHandler(async (req, res) => {
//     const groups = await GroupChat.find({
//         members: req.user._id
//     })
//         .populate("members", "name email")
//         .populate("admins", "name email")
//         .populate("lastMessage")
//         .sort({ updatedAt: -1 });

//     return res
//         .status(200)
//         .json(new ApiResponse(200, groups, "Group chats fetched successfully"));
// });

// const updateGroupInfo = AsyncHandler(async (req, res) => {
//     const { groupId } = req.params;
//     const { name, groupImage, onlyAdminsCanSend } = req.body; // matches Postman

//     const group = await GroupChat.findById(groupId);
//     if (!group) throw new ApiError(404, "Group not found");

//     if (!group.admins.includes(req.user._id.toString())) {
//         throw new ApiError(403, "Only admins can update group info");
//     }

//     // Update name and image
//     if (name) group.name = name;
//     if (groupImage) group.groupImage = groupImage;

//     // Ensure settings object exists
//     if (!group.settings) group.settings = {};

//     // Update the onlyAdminsCanSend flag
//     if (onlyAdminsCanSend !== undefined) {
//         group.settings.onlyAdminsCanSend =
//             typeof onlyAdminsCanSend === "string"
//                 ? onlyAdminsCanSend.toLowerCase() === "true"
//                 : Boolean(onlyAdminsCanSend);
//     }

//     await group.save();

//     // Return the settings explicitly to verify
//     const responseGroup = await GroupChat.findById(groupId);
//     return res.status(200).json(
//         new ApiResponse(200, responseGroup, "Group updated successfully")
//     );
// });


// // Add or Remove Members
// const updateMembers = AsyncHandler(async (req, res) => {
//     const { groupId } = req.params;
//     const { userId, action } = req.body; // 'add' or 'remove'

//     if (!["add", "remove"].includes(action)) {
//         throw new ApiError(400, "Invalid action. Must be 'add' or 'remove'");
//     }

//     const group = await GroupChat.findById(groupId);
//     if (!group) throw new ApiError(404, "Group not found");

//     // Only admins can modify members
//     if (!group.admins.includes(req.user._id.toString())) {
//         throw new ApiError(403, "Only admins can modify members");
//     }

//     if (action === "add") {
//         // Cannot add if already a member
//         if (group.members.includes(userId.toString())) {
//             throw new ApiError(400, "User is already a member of the group");
//         }
//         group.members.push(userId);
//     } else {
//         // Cannot remove if not a member
//         if (!group.members.includes(userId.toString())) {
//             throw new ApiError(400, "User is not a member of the group");
//         }
//         // Cannot remove creator
//         if (userId.toString() === group.createdBy.toString()) {
//             throw new ApiError(400, "Creator cannot be removed");
//         }

//         // Remove user from members and admins
//         group.members = group.members.filter(id => id.toString() !== userId.toString());
//         group.admins = group.admins.filter(id => id.toString() !== userId.toString());
//     }

//     await group.save();

//     return res.status(200).json(
//         new ApiResponse(200, group, `Member ${action}ed successfully`)
//     );
// });




// // Promote/Demote Admins
// const updateAdmins = AsyncHandler(async (req, res) => {
//     const { groupId } = req.params;
//     const { userId, action } = req.body; // 'promote' or 'demote'

//     if (!["promote", "demote"].includes(action)) throw new ApiError(400, "Invalid action");

//     const group = await GroupChat.findById(groupId);
//     if (!group) throw new ApiError(404, "Group not found");

//     if (!group.admins.includes(req.user._id)) {
//         throw new ApiError(403, "Only admins can change admin roles");
//     }

//     if (!group.members.includes(userId)) {
//         throw new ApiError(400, "User is not a member");
//     }

//     if (action === "promote" && !group.admins.includes(userId)) {
//         group.admins.push(userId);
//     } else if (action === "demote") {
//         if (userId.toString() === group.createdBy.toString()) {
//             throw new ApiError(400, "Creator cannot be demoted");
//         }
//         group.admins = group.admins.filter(id => id.toString() !== userId.toString());
//     }

//     await group.save();
//     return res.status(200).json(new ApiResponse(200, group, `User ${action}d successfully`));
// });

// // Delete Group
// const deleteGroupChat = AsyncHandler(async (req, res) => {
//     const { groupId } = req.params;
//     const group = await GroupChat.findById(groupId);
//     if (!group) throw new ApiError(404, "Group not found");

//     if (req.user._id.toString() !== group.createdBy.toString()) {
//         throw new ApiError(403, "Only the creator can delete the group");
//     }

//     await GroupChat.findByIdAndDelete(groupId);
//     return res.status(200).json(new ApiResponse(200, {}, "Group deleted successfully"));
// });

// export {
//    // groupChat.controller.js

//     createGroupChat,
//     getGroupChats,
//     updateGroupInfo as updateGroupChat, // alias
//     deleteGroupChat,
//     updateMembers as addGroupMember,
//     updateMembers as removeGroupMember,
//     updateAdmins as promoteToAdmin,
//     updateAdmins as demoteAdmin


// };
