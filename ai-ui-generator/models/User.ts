import mongoose, { Schema, Document } from "mongoose";

export interface UserDocument extends Document {
  email: string;
  password: string;
  name?: string;
  creditsRemaining: number;
  lastCreditReset?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      default: "",
    },
    creditsRemaining: {
      type: Number,
      default: () => Number(process.env.DAILY_CREDITS || 4),
      min: 0,
    },
    lastCreditReset: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User ||
  mongoose.model<UserDocument>("User", UserSchema);
