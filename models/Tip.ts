import mongoose, { Document, Model } from 'mongoose';
import { IUser } from './User';
import { IListing } from './Listing';

// Define the interface for Tip document
export interface ITip extends Document {
  listing: IListing['_id'];
  fromUser: IUser['_id'];
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define status enum for better type safety
export enum TipStatus {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
}

// Define the Tip schema
const TipSchema = new mongoose.Schema<ITip>(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Listing is required'],
      index: true,
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be at least 1'],
      validate: {
        validator: function(value: number) {
          // Ensure amount has at most 2 decimal places
          return Number(value.toFixed(2)) === value;
        },
        message: 'Amount cannot have more than 2 decimal places',
      },
    },
    status: {
      type: String,
      enum: Object.values(TipStatus),
      default: TipStatus.Pending,
      required: true,
    },
    transactionId: {
      type: String,
      sparse: true, // Allow null/undefined values
      index: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Add compound index for user's tips on a listing
TipSchema.index({ fromUser: 1, listing: 1 });

// Virtual populate for listing details
TipSchema.virtual('listingDetails', {
  ref: 'Listing',
  localField: 'listing',
  foreignField: '_id',
  justOne: true,
});

// Virtual populate for user details
TipSchema.virtual('userDetails', {
  ref: 'User',
  localField: 'fromUser',
  foreignField: '_id',
  justOne: true,
});

// Static method to get total tips for a listing
TipSchema.statics.getTotalTipsForListing = async function(listingId: string): Promise<number> {
  const result = await this.aggregate([
    { $match: { listing: new mongoose.Types.ObjectId(listingId), status: TipStatus.Completed } },
    { $group: { _id: '$listing', total: { $sum: '$amount' } } },
  ]);
  return result[0]?.total || 0;
};

// Static method to get user's total tips
TipSchema.statics.getUserTotalTips = async function(userId: string): Promise<number> {
  const result = await this.aggregate([
    { $match: { fromUser: new mongoose.Types.ObjectId(userId), status: TipStatus.Completed } },
    { $group: { _id: '$fromUser', total: { $sum: '$amount' } } },
  ]);
  return result[0]?.total || 0;
};

// Instance method to complete a tip
TipSchema.methods.completeTip = async function(transactionId: string): Promise<void> {
  this.status = TipStatus.Completed;
  this.transactionId = transactionId;
  await this.save();
};

// Instance method to fail a tip
TipSchema.methods.failTip = async function(reason?: string): Promise<void> {
  this.status = TipStatus.Failed;
  await this.save();
};

// Create the model with static methods
interface TipModel extends Model<ITip> {
  getTotalTipsForListing(listingId: string): Promise<number>;
  getUserTotalTips(userId: string): Promise<number>;
}

const Tip = (mongoose.models.Tip || mongoose.model<ITip, TipModel>('Tip', TipSchema)) as TipModel;

export default Tip; 