import mongoose, { Schema, Document } from "mongoose";

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  assignmentId: mongoose.Types.ObjectId;

  sqlQuery: string;
  isCompleted: boolean;

  attemptCount: number;
  lastAttempt: Date;

  createdAt: Date;
  updatedAt: Date;
}

const UserProgressSchema = new Schema<IUserProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      index: true,
    },
    sqlQuery: { type: String },
    isCompleted: { type: Boolean, default: false },
    attemptCount: { type: Number, default: 0 },
    lastAttempt: { type: Date },
  },
  { timestamps: true }
);

/* Compound index for fast lookup */
UserProgressSchema.index({ userId: 1, assignmentId: 1 });

export default mongoose.model<IUserProgress>(
  "UserProgress",
  UserProgressSchema
);