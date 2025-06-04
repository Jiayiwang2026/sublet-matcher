import { Schema, model, models, Document, Model } from 'mongoose';
import { IUser } from './User';

// Define the interface for Listing document
export interface IListing extends Document {
  title: string;
  description: string;
  price: number;
  deposit: number;
  startDate: Date;
  endDate: Date;
  location: string;
  images: string[];
  furnished: boolean;
  roomType: string;
  owner: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Define room type enum for better type safety
export enum RoomType {
  Studio = 'studio',
  OneBedroom = '1b1b',
  TwoBedroom = '2b1b',
  Shared = 'shared',
}

// Define the Listing schema
const listingSchema = new Schema<IListing>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  deposit: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: { type: String, required: true },
  images: [{ type: String }],
  furnished: { type: Boolean, default: false },
  roomType: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Add indexes for common queries
listingSchema.index({ price: 1 });
listingSchema.index({ startDate: 1 });
listingSchema.index({ location: 'text' }); // Enable text search on location
listingSchema.index({ roomType: 1 });

// Virtual for duration in days
listingSchema.virtual('durationDays').get(function (this: IListing) {
  return Math.ceil((this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to validate dates
listingSchema.pre('save', function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Static method to find available listings
listingSchema.statics.findAvailable = function (startDate: Date, endDate: Date) {
  return this.find({
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  }).sort({ createdAt: -1 });
};

// Create the model
export const Listing: Model<IListing> = models.Listing || model<IListing>('Listing', listingSchema);

export default Listing;
