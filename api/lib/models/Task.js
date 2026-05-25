import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title:         { type: String, required: true, trim: true },
  description:   { type: String, default: '' },
  priority:      { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status:        { type: String, enum: ['todo', 'in_progress', 'completed'], default: 'todo' },
  deadline:      { type: Number },           // unix ms
  assignedTo:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  estimatedTime: { type: Number },
  aiSuggestions: { type: String },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

taskSchema.index({ createdBy: 1, status: 1 });
taskSchema.index({ createdBy: 1, deadline: 1 });

export default mongoose.model('Task', taskSchema);
