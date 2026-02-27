import Assignment from "../db/models/Assignment";
import { GoogleGenerativeAI } from "@google/generative-ai";


if(!process.env.GEMINI_API_KEY || !process.env.GEMINI_MODEL){
  throw Error("GEMINI Credentials Missing");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const geminiModel = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL,
});

export async function getSQLHint(
  problemId: string,
  userQuery: string
) {

  // Fetch problem
  const assignment = await Assignment.findById(problemId).lean();
  
  if (!assignment) {
    throw new Error("ASSIGNMENT_NOT_FOUND");
  }
  
  // Format schema
  const formattedSchema = assignment.sampleTables
    .map(
      (t) =>
        `${t.tableName}(\n${t.columns
          .map((c) => `  ${c.columnName} ${c.dataType}`)
          .join(",\n")}\n)`
    )
    .join("\n");

  // Prompt
  const prompt = `
    You are a SQL mentor.

    Rules:
    - Never give full SQL query.
    - Only guide logically.
    - Identify mistakes by comparing output with expected result.

    Problem:
    ${assignment.question}

    Schema:
    ${formattedSchema}

    User query:
    ${userQuery}

    Expected output:
    ${JSON.stringify(assignment.expectedOutput.value)}

    Provide only a hint.
    `;

  const result = await geminiModel.generateContent(prompt);
  let hint = result.response.text();

  return hint;
}