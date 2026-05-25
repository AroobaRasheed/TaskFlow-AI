import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  email:          { type: String, required: true, lowercase: true, trim: true },
  role:           { type: String, required: true },
  department:     { type: String },
  avatarColor:    { type: String, required: true },
  avatarInitials: { type: String, required: true },
  status:         { type: String, enum: ['online', 'away', 'offline'], default: 'offline' },
  addedBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model('TeamMember', teamMemberSchema);
