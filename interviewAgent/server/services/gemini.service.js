import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper to initialize genAI
const getModel = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined in environment variables.");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
};

/**
 * Generates an array of interview questions based on job details
 * @param {string} role 
 * @param {string} description 
 * @param {string} experience 
 * @param {number} numQuestions 
 * @param {Buffer} [resumeBuffer=null] - Optional PDF file buffer
 * @returns {Promise<string[]>} Array of questions
 */
export const generateQuestions = async (role, description, experience, numQuestions = 5, resumeBuffer = null) => {
    try {
        const model = getModel();
        
        let resumeContext = "";
        if (resumeBuffer) {
            resumeContext = `\nThe candidate has also uploaded their resume (attached PDF). Base your questions on their past projects, work experiences, and listed skills on their resume, while tailoring it for the target role.`;
        }

        const prompt = `
You are an expert interviewer. Generate ${numQuestions} professional interview questions for a candidate applying for the role of "${role}" with an experience level of "${experience}".
Job Description/Key Skills: "${description}"
${resumeContext}

Guidelines:
1. Mix technical questions about key skills/concepts with behavioral/situation questions.
2. Ensure questions are realistic and suitable for the experience level.
3. Return the response as a JSON array of strings. Do not include markdown code blocks or any text outside of the JSON array.

Example Output Format:
[
  "Can you explain...",
  "Describe a time when you...",
  "How would you optimize..."
]
`;

        const parts = [];
        if (resumeBuffer) {
            parts.push({
                inlineData: {
                    data: resumeBuffer.toString("base64"),
                    mimeType: "application/pdf"
                }
            });
        }
        parts.push({ text: prompt });

        const response = await model.generateContent({
            contents: [{ role: "user", parts: parts }],
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const text = response.response.text();
        return JSON.parse(text.trim());
    } catch (error) {
        console.error("Error in generateQuestions service:", error);
        throw new Error(`Failed to generate questions: ${error.message}`);
    }
};

/**
 * Evaluates the complete interview answers and generates scores and feedback
 * @param {string} role 
 * @param {string} experience 
 * @param {Array<{question: string, userAnswer: string}>} qaList 
 * @returns {Promise<{questions: Array<{question: string, userAnswer: string, feedback: string, score: number, idealAnswer: string}>, overallScore: number, overallFeedback: string}>}
 */
export const evaluateInterview = async (role, experience, qaList) => {
    try {
        const model = getModel();
        const prompt = `
You are a senior hiring manager. Evaluate the candidate's responses for the role of "${role}" (${experience} level).

Here is the transcript of the interview questions and the candidate's answers:
${JSON.stringify(qaList, null, 2)}

Instructions:
1. For each question:
   - Provide constructive feedback (what was good, what was missing).
   - Grade the answer with a score between 0 and 10 (decimal values allowed, e.g., 7.5).
   - Provide a concise ideal answer that showcases best practices.
2. Provide an overall summary feedback discussing key strengths and areas of improvement.
3. Calculate an overall average score (0 to 10).
4. Return the output as a valid JSON object matching the schema below. Do not wrap in markdown or include extra text.

Required Output Schema:
{
  "questions": [
    {
      "question": "The question asked",
      "userAnswer": "The answer candidate gave",
      "feedback": "Critique and constructive advice",
      "score": 8.5,
      "idealAnswer": "Suggested ideal response"
    }
  ],
  "overallScore": 8.0,
  "overallFeedback": "Overall critique and summary"
}
`;

        const response = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const text = response.response.text();
        return JSON.parse(text.trim());
    } catch (error) {
        console.error("Error in evaluateInterview service:", error);
        throw new Error(`Failed to evaluate interview: ${error.message}`);
    }
};
