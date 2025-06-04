import mongoose from 'mongoose';

const tipSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
tipSchema.index({ listing: 1 });
tipSchema.index({ fromUser: 1 });
tipSchema.index({ toUser: 1 });
tipSchema.index({ status: 1 });
tipSchema.index({ createdAt: -1 });

const Tip = mongoose.models.Tip || mongoose.model('Tip', tipSchema);

export default Tip; 