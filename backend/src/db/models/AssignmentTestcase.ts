import mongoose, { Schema, Document } from "mongoose";

export interface IAssignmentTestcase extends Document {
    assignmentId: mongoose.Types.ObjectId;
    testcaseId: mongoose.Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;
}

const AssignmentTestcaseSchema = new Schema<IAssignmentTestcase>(
    {
        assignmentId: {
            type: Schema.Types.ObjectId,
            ref: "Assignment",
            required: true,
            index: true,
        },
        testcaseId: {
            type: Schema.Types.ObjectId,
            ref: "Testcase",
            required: true,
            index: true,
        },
    },
    { timestamps: true }
);

/* Compound index for fast lookup and uniqueness */
AssignmentTestcaseSchema.index({ assignmentId: 1, testcaseId: 1 }, { unique: true });

export default mongoose.model<IAssignmentTestcase>(
    "AssignmentTestcase",
    AssignmentTestcaseSchema
);
