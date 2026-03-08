import Assignment from "../../db/models/Assignment";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getTestcasesForAssignment } from "../assignment/assignment.service";
import { ISampleTable } from "../../types/schema";


let genAI: GoogleGenerativeAI;
let geminiModel: any;

function getGeminiModel() {
  if (geminiModel) return geminiModel;

  if (!process.env.GEMINI_API_KEY || !process.env.GEMINI_MODEL) {
    throw Error("GEMINI Credentials Missing");
  }

  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  geminiModel = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL,
  });

  return geminiModel;
}

export async function getSQLHint(
  problemId: string,
  userQuery: string
) {

  // Fetch problem
  const assignment = await Assignment.findById(problemId).lean();

  if (!assignment) {
    throw new Error("ASSIGNMENT_NOT_FOUND");
  }

  // Fetch only the first testcase to define the requirement without bloating the context window
  const testcases = await getTestcasesForAssignment(problemId);
  if (!testcases.length) {
    throw new Error("TESTCASES_NOT_FOUND");
  }

  const firstTestcase = testcases[0];

  // Format schema from the first testcase
  const formattedSchema = firstTestcase.sampleTables
    .map(
      (t: ISampleTable) =>
        `${t.tableName}(\n${t.columns
          .map((c: any) => `  ${c.columnName} ${c.dataType}`)
          .join(",\n")}\n)`
    )
    .join("\n");

  // Prompt
  const prompt = `
    You are a SQL mentor.

    Rules:
    - Never give full SQL query.
    - Only guide logically.
    - Identify mistakes by comparing user query intent with the required output.

    Problem:
    ${assignment.question}

    Schema:
    ${formattedSchema}

    User query:
    ${userQuery}

    Expected output:
    ${JSON.stringify(firstTestcase.expectedOutput.value)}

    Provide only a helpful logical hint.
    `;

  const result = await getGeminiModel().generateContent(prompt);
  let hint = result.response.text();

  return hint;
}