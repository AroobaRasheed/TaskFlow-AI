import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  userId:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productivityScore: { type: Number, required: true },
  completedTasks:    { type: Number, required: true },
  pendingTasks:      { type: Number, required: true },
  overdueTasks:      { type: Number, required: true },
  weekLabel:         { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Analytics', analyticsSchema);
