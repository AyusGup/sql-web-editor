"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ColumnSchema = new mongoose_1.Schema({
    columnName: { type: String, required: true },
    dataType: { type: String, required: true },
}, { _id: false });
const SampleTableSchema = new mongoose_1.Schema({
    tableName: { type: String, required: true },
    columns: { type: [ColumnSchema], required: true },
    rows: { type: [mongoose_1.Schema.Types.Mixed], default: [] },
}, { _id: false });
const ExpectedOutputSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ["table", "single_value", "column", "count"],
        required: true,
    },
    value: { type: mongoose_1.Schema.Types.Mixed, required: true },
}, { _id: false });
const AssignmentSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
});
AssignmentSchema.index({ difficulty: 1, tags: 1 });
exports.default = mongoose_1.default.model("Assignment", AssignmentSchema);
