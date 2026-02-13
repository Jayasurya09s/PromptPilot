import mongoose, { Schema, Document } from "mongoose";

interface Version {
  intent: string;
  plan: object;
  tree: object;
  explanation: string;
  diff: {
    added: string[];
    removed: string[];
  };
  createdAt: Date;
}

export interface SessionDocument extends Document {
  userId: string;
  versions: Version[];
  createdAt: Date;
  updatedAt: Date;
}

const VersionSchema = new Schema({
  intent: String,
  plan: Object,
  tree: Object,
  explanation: String,
  diff: {
    added: [String],
    removed: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SessionSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    versions: [VersionSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Session ||
  mongoose.model<SessionDocument>("Session", SessionSchema);
