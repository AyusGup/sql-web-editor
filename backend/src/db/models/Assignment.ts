import mongoose, { Schema, Document } from "mongoose";
import { ISampleTable, IExpectedOutput, IColumn } from "../../types/schema";


export interface IAssignment extends Document {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  question: string;

  sampleTables: ISampleTable[];
  expectedOutput: IExpectedOutput;

  version: number;
  tags: string[];

  createdAt: Date;
  updatedAt: Date;
}

const ColumnSchema = new Schema<IColumn>(
  {
    columnName: { type: String, required: true },
    dataType: { type: String, required: true },
  },
  { _id: false }
);

const SampleTableSchema = new Schema<ISampleTable>(
  {
    tableName: { type: String, required: true },
    columns: { type: [ColumnSchema], required: true },
    rows: { type: [Schema.Types.Mixed as any], default: [] },
  },
  { _id: false }
);

const ExpectedOutputSchema = new Schema<IExpectedOutput>(
  {
    type: {
      type: String,
      enum: ["table", "single_value", "column", "count"],
      required: true,
    },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

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

    sampleTables: { type: [SampleTableSchema], required: true },
    expectedOutput: { type: ExpectedOutputSchema, required: true },

    version: { type: Number, default: 1 },
    tags: [{ type: String, index: true }],
  },
  {
    timestamps: true,
  }
);

AssignmentSchema.index({ difficulty: 1, tags: 1 });

export default mongoose.model<IAssignment>("Assignment", AssignmentSchema);