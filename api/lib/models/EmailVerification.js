import mongoose from 'mongoose';

const emailVerificationSchema = new mongoose.Schema({
  email:     { type: String, required: true },
  token:     { type: String, required: true },
  expiresAt: { type: Number, required: true },
  used:      { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('EmailVerification', emailVerificationSchema);
