import mongoose, { Schema } from "mongoose";

const personalChatSchema = new Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  ],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message"
  }
}, { timestamps: true });

export const PersonalChat = mongoose.model("PersonalChat", personalChatSchema);
