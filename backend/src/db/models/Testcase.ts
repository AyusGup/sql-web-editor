import mongoose, { Schema, Document } from "mongoose";
import { ISampleTable, IExpectedOutput, IColumn } from "../../types/schema";

export interface ITestcase extends Document {
    sampleTables: ISampleTable[];
    expectedOutput: IExpectedOutput;
    visible: boolean;

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

const TestcaseSchema = new Schema<ITestcase>(
    {
        sampleTables: { type: [SampleTableSchema], required: true },
        expectedOutput: { type: ExpectedOutputSchema, required: true },
        visible: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ITestcase>("Testcase", TestcaseSchema);
