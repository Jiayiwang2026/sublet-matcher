import mongoose, { Document, Model } from 'mongoose';
import { IUser } from './User';

// Define the interface for Listing document
export interface IListing extends Document {
  title: string;
  description?: string;
  price: number;
  deposit: number;
  startDate: Date;
  endDate: Date;
  location: string;
  images: string[];
  furnished: boolean;
  roomType: 'studio' | '1b1b' | '2b1b' | 'shared';
  owner: IUser['_id'];
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
const ListingSchema = new mongoose.Schema<IListing>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    deposit: {
      type: Number,
      required: [true, 'Deposit is required'],
      min: [0, 'Deposit cannot be negative'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      validate: {
        validator: function(this: IListing, value: Date) {
          return value >= new Date();
        },
        message: 'Start date must be in the future',
      },
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function(this: IListing, value: Date) {
          return value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function(v: string[]) {
          // Validate each URL in the array
          return v.every(url => /^https?:\/\/.+/.test(url));
        },
        message: 'Invalid image URL format',
      },
    },
    furnished: {
      type: Boolean,
      default: false,
    },
    roomType: {
      type: String,
      enum: Object.values(RoomType),
      default: RoomType.Studio,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
      index: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: {
      virtuals: true, // Include virtual fields when converting to JSON
      transform: function(doc, ret) {
        ret.id = ret._id; // Convert _id to id
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Add indexes for common queries
ListingSchema.index({ price: 1 });
ListingSchema.index({ startDate: 1 });
ListingSchema.index({ location: 'text' }); // Enable text search on location
ListingSchema.index({ roomType: 1 });

// Virtual for duration in days
ListingSchema.virtual('durationDays').get(function(this: IListing) {
  return Math.ceil((this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to validate dates
ListingSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Static method to find available listings
ListingSchema.statics.findAvailable = function(startDate: Date, endDate: Date) {
  return this.find({
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  }).sort({ createdAt: -1 });
};

// Create the model
const Listing = (mongoose.models.Listing || mongoose.model<IListing>('Listing', ListingSchema)) as Model<IListing> & {
  findAvailable(startDate: Date, endDate: Date): Promise<IListing[]>;
};

export default Listing; 