import mongoose from "mongoose";
const { Schema, model } = mongoose;

const commentSchema = new Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const messageSchema = new Schema({
  text: { type: String, required: true },
  sender: { type: String, default: 'Anonymous' }, 
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }], 
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now }
});

export const Message = model('Message', messageSchema);
