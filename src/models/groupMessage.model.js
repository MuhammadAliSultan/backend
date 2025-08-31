import mongoose, { Schema } from "mongoose";

const groupMessageSchema = new Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GroupChat", // references group chat
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    content: {
      type: String,
      trim: true
    },
    attachments: [
      {
        type: String // URLs to uploaded files/images
      }
    ],
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ], // Tracks which members have seen the message
    systemMessage: {
      type: Boolean,
      default: false // For admin notices like "User X was removed"
    }
  },
  { timestamps: true }
);

export const GroupMessage = mongoose.model("GroupMessage", groupMessageSchema);
