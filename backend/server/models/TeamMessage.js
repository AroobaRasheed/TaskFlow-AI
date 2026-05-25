import mongoose from 'mongoose';

const teamMessageSchema = new mongoose.Schema({
  senderId:       { type: String, required: true },
  senderName:     { type: String, required: true },
  senderInitials: { type: String, required: true },
  senderColor:    { type: String, required: true },
  recipientId:    { type: String },
  content:        { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('TeamMessage', teamMessageSchema);
