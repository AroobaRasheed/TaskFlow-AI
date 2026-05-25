import mongoose from 'mongoose';

const workflowStepSchema = new mongoose.Schema({
  title:          { type: String, required: true },
  description:    { type: String },
  order:          { type: Number, required: true },
  status:         { type: String, enum: ['pending', 'in_progress', 'completed', 'blocked'], default: 'pending' },
  assignedTo:     { type: String },
  estimatedHours: { type: Number },
  completedAt:    { type: Number },
});

const workflowSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String },
  steps:       [workflowStepSchema],
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model('Workflow', workflowSchema);
