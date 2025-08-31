import mongoose, { Schema } from "mongoose";

const personalMessageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: function() {
      return !this.attachments || this.attachments.length === 0;
    },
    trim: true,
  },
  attachments: {
    type: [String], // Adjust based on your attachment structure (e.g., array of URLs or ObjectIds)
    default: [],
  },
  seen: {
    type: Boolean,
    default: false,
  },
  deletedBy: [{
    type: Schema.Types.ObjectId,
    ref: "User",
  }],
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedForEveryone: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Add other fields as needed
},{
  timestamps: true,
});

export const PersonalMessage = mongoose.model("PersonalMessage", personalMessageSchema);
