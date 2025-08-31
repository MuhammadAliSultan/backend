// groupChat.model.js
import mongoose, { Schema } from "mongoose";

const groupChatSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  ],
  admins: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GroupMessage"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  groupImage: String,

  // ✅ Group settings for permissions
  settings: {
    onlyAdminsCanSend: {
      type: Boolean,
      default: false // false → anyone can send messages
    }
  }

}, { timestamps: true });

export const GroupChat = mongoose.model("GroupChat", groupChatSchema);
