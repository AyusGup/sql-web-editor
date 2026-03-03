import mongoose, { Schema, Document } from "mongoose";


export interface IAssignment extends Document {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  question: string;

  version: number;
  tags: string[];

  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, index: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
      index: true,
    },
    question: { type: String, required: true },

    version: { type: Number, default: 1 },
    tags: [{ type: String, index: true }],
  },
  {
    timestamps: true,
  }
);

AssignmentSchema.index({ difficulty: 1, tags: 1 });

export default mongoose.model<IAssignment>("Assignment", AssignmentSchema);