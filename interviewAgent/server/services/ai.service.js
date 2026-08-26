import { GoogleGenerativeAI } from "@google/generative-ai";

const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  } catch (err) {
    console.warn("Could not initialize GoogleGenerativeAI:", err.message);
    return null;
  }
};

// Fallback question bank generator
const getFallbackQuestions = (interviewType, jobRole, experienceLevel, count = 5) => {
  const isTechnical = interviewType === "Technical";
  const isHR = interviewType === "HR";

  if (isTechnical) {
    return [
      {
        id: 1,
        question: `Could you give an overview of your technical background and key technologies you use for ${jobRole}?`,
        category: "Architecture & Fundamentals",
        sampleAnswer: `I have extensive experience working with ${jobRole} tech stacks, focusing on clean architecture, scalable APIs, state management, and robust CI/CD practices.`,
      },
      {
        id: 2,
        question: `How do you optimize performance and handle bottleneck issues in a production ${jobRole} application?`,
        category: "Performance & Optimization",
        sampleAnswer: `I identify bottlenecks using profiling and monitoring tools, optimize database queries, implement caching strategies, minimize redundant renders, and ensure lazy loading.`,
      },
      {
        id: 3,
        question: `Describe a challenging bug or technical obstacle you encountered in a recent project and how you resolved it.`,
        category: "Problem Solving & Debugging",
        sampleAnswer: `I isolated the issue using structured logging and reproducing test cases, identified the root cause in concurrency/state handling, and deployed a targeted patch with regression tests.`,
      },
      {
        id: 4,
        question: `What design patterns and security practices do you consistently apply when building software?`,
        category: "Design Patterns & Security",
        sampleAnswer: `I utilize SOLID principles, repository/factory patterns where suitable, strict input validation, authentication/authorization checks, and secure secret handling.`,
      },
      {
        id: 5,
        question: `How do you approach automated testing, code reviews, and maintaining code quality across a team?`,
        category: "Testing & Code Quality",
        sampleAnswer: `I advocate for comprehensive unit and integration tests, enforce clear linting and PR standards, and conduct constructive code reviews with a focus on readability and maintainability.`,
      },
    ].slice(0, count);
  }

  if (isHR) {
    return [
      {
        id: 1,
        question: "Tell me about yourself, your career journey, and why you are interested in this position.",
        category: "Introduction & Motivation",
        sampleAnswer: "I am a passionate professional driven by solving complex problems, continuous learning, and contributing to high-impact collaborative team environments.",
      },
      {
        id: 2,
        question: "Can you describe a situation where you had a disagreement with a team member or stakeholder and how you handled it?",
        category: "Conflict Resolution & Communication",
        sampleAnswer: "I actively listened to understand their perspective, focused on the shared goal and data-driven solutions, and reached a constructive consensus.",
      },
      {
        id: 3,
        question: "Tell me about a time you had to deliver a critical project under tight deadlines. How did you prioritize?",
        category: "Time Management & Pressure",
        sampleAnswer: "I broke down the deliverable into MVP milestones, communicated proactively with stakeholders, and delegated tasks effectively to hit the deadline without compromising quality.",
      },
      {
        id: 4,
        question: "Describe a project or outcome that did not go as planned. What did you learn from the experience?",
        category: "Self-Reflection & Resilience",
        sampleAnswer: "I analyzed the breakdown during the post-mortem, identified gaps in requirement clarity, and established better feedback loops that prevented future occurrences.",
      },
      {
        id: 5,
        question: "Where do you see yourself professionally in the next 3 to 5 years?",
        category: "Career Vision & Growth",
        sampleAnswer: "I aim to deepen my expertise, take on greater technical leadership and mentorship responsibilities, and drive key product initiatives.",
      },
    ].slice(0, count);
  }

  // Resume-based questions
  return [
    {
      id: 1,
      question: `Looking at your background for ${jobRole}, what is the most impactful project you have worked on recently?`,
      category: "Project Deep Dive",
      sampleAnswer: "I led the development of a key feature/system that improved system throughput and delivered significant value to our users.",
    },
    {
      id: 2,
      question: "Which technologies or frameworks mentioned in your background are you most confident with and why?",
      category: "Skills Verification",
      sampleAnswer: "I have hands-on experience building production features with these technologies and understand their internal mechanics and trade-offs.",
    },
    {
      id: 3,
      question: "Can you walk me through an architectural or design decision you made on a project from your resume?",
      category: "System Design & Architecture",
      sampleAnswer: "I evaluated several trade-offs between speed, scalability, and complexity before choosing the optimal modular architecture for our requirements.",
    },
    {
      id: 4,
      question: "How did you measure the success or business impact of the initiatives you led in your previous roles?",
      category: "Impact & Metrics",
      sampleAnswer: "I tracked metrics such as latency reduction, user adoption, test coverage, and customer satisfaction scores.",
    },
    {
      id: 5,
      question: "What is an area of technology or skill you are currently upskilling in to prepare for this role?",
      category: "Continuous Learning",
      sampleAnswer: "I am actively exploring modern tooling, cloud design patterns, and AI integrations to build higher efficiency applications.",
    },
  ].slice(0, count);
};

export const generateInterviewQuestions = async ({
  interviewType = "Technical",
  jobRole = "Software Engineer",
  experienceLevel = "Mid-Level",
  targetCompany = "Tech Company",
  resumeText = "",
  count = 5,
}) => {
  const model = getGeminiModel();

  if (model) {
    try {
      const prompt = `You are an expert technical hiring manager and interviewer at ${targetCompany}.
Generate ${count} realistic, challenging, and insightful interview questions for a candidate applying for:
- Role: ${jobRole}
- Experience Level: ${experienceLevel}
- Interview Type: ${interviewType}
${resumeText ? `- Candidate Resume / Experience Summary: ${resumeText}` : ""}

Return ONLY a valid JSON array of objects with the following schema:
[
  {
    "id": 1,
    "question": "Clear, concise interview question",
    "category": "Topic / Core Competency",
    "sampleAnswer": "Key points of a strong, top-tier answer"
  }
]
Do not include any Markdown code fence outside the JSON or text before/after. Return raw JSON string only.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleanedJson = text.replace(/```json|```/gi, "").trim();
      const parsed = JSON.parse(cleanedJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((q, idx) => ({
          id: idx + 1,
          question: q.question,
          category: q.category || "Core Competency",
          sampleAnswer: q.sampleAnswer || "",
          userTranscript: "",
          userRating: 0,
          feedback: "",
          score: 0,
        }));
      }
    } catch (err) {
      console.error("Gemini question generation error, using fallback:", err.message);
    }
  }

  // Fallback
  return getFallbackQuestions(interviewType, jobRole, experienceLevel, count).map((q, idx) => ({
    ...q,
    id: idx + 1,
    userTranscript: "",
    userRating: 0,
    feedback: "",
    score: 0,
  }));
};

export const evaluateSingleAnswer = async ({
  question,
  userTranscript,
  jobRole,
  experienceLevel,
  interviewType,
}) => {
  if (!userTranscript || userTranscript.trim().length < 5) {
    return {
      score: 30,
      feedback: "Answer was too brief or incomplete. Try providing concrete examples and structured explanations.",
    };
  }

  const model = getGeminiModel();

  if (model) {
    try {
      const prompt = `You are an AI interviewer assessing a candidate's verbal answer.
Question: "${question}"
Candidate's Response: "${userTranscript}"
Role: ${jobRole} (${experienceLevel}) - ${interviewType} Round

Evaluate the response and output ONLY a JSON object:
{
  "score": <integer from 10 to 100>,
  "feedback": "<2-3 sentences of concise feedback highlighting what was good and what could be improved>"
}
Return raw JSON without markdown fences.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json|```/gi, "").trim();
      return JSON.parse(cleaned);
    } catch (err) {
      console.error("Gemini single answer evaluation error:", err.message);
    }
  }

  // Fallback evaluation heuristic
  const wordCount = userTranscript.trim().split(/\s+/).length;
  let score = 65;
  let feedback = "Good communication. Consider adding specific metrics and deeper technical rationale.";

  if (wordCount > 50) {
    score = 85;
    feedback = "Thorough and well-articulated response covering key concepts with good clarity.";
  } else if (wordCount > 25) {
    score = 75;
    feedback = "Clear answer with relevant points. Adding more concrete project examples would make it even stronger.";
  } else {
    score = 55;
    feedback = "Decent start, but expanding on the reasoning and detailing real-world application would improve your rating.";
  }

  return { score, feedback };
};

export const generateFinalEvaluation = async ({
  interviewType,
  jobRole,
  experienceLevel,
  questionsWithAnswers,
}) => {
  const answeredCount = questionsWithAnswers.filter(
    (q) => q.userTranscript && q.userTranscript.trim().length > 0
  ).length;

  const model = getGeminiModel();

  if (model && answeredCount > 0) {
    try {
      const answersSummary = questionsWithAnswers
        .map(
          (q, i) =>
            `Q${i + 1}: ${q.question}\nAnswer: ${q.userTranscript || "No answer provided"}\n`
        )
        .join("\n");

      const prompt = `You are a Senior Principal Interviewer evaluating a candidate's complete mock interview.
Role: ${jobRole} (${experienceLevel})
Round: ${interviewType}

Transcript:
${answersSummary}

Generate a comprehensive scorecard in JSON format:
{
  "overallScore": <integer 0-100>,
  "technicalScore": <integer 0-100>,
  "communicationScore": <integer 0-100>,
  "confidenceScore": <integer 0-100>,
  "summary": "<3-4 sentence comprehensive evaluation summary>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<area to improve 1>", "<area to improve 2>"],
  "suggestions": ["<actionable step 1>", "<actionable step 2>", "<actionable step 3>"]
}
Return raw JSON only without markdown formatting.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json|```/gi, "").trim();
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (err) {
      console.error("Gemini final evaluation error:", err.message);
    }
  }

  // Fallback evaluation calculation
  const totalQuestions = questionsWithAnswers.length || 1;
  const scores = questionsWithAnswers.map((q) => q.score || (q.userTranscript?.length > 20 ? 75 : 40));
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalQuestions);

  const technicalScore = Math.min(100, Math.max(30, avgScore + 3));
  const communicationScore = Math.min(100, Math.max(35, avgScore - 2));
  const confidenceScore = Math.min(100, Math.max(40, avgScore + 1));
  const overallScore = Math.round((technicalScore + communicationScore + confidenceScore) / 3);

  return {
    overallScore,
    technicalScore,
    communicationScore,
    confidenceScore,
    summary: `The candidate demonstrated a solid foundational grasp of ${jobRole} principles with clear communication and structured problem solving. Continued focus on quantifying results and exploring edge cases will lead to outstanding interview outcomes.`,
    strengths: [
      "Clear and articulate verbal communication style",
      `Relevant domain knowledge tailored for ${jobRole}`,
      "Structured approach when tackling complex situational questions",
    ],
    weaknesses: [
      "Could incorporate more measurable impact and metrics in responses",
      "Opportunity to elaborate further on system trade-offs and edge cases",
    ],
    suggestions: [
      "Use the STAR method (Situation, Task, Action, Result) consistently for all behavioral and project responses",
      "Deepen preparation on scalability and concurrency trade-offs for high-level technical questions",
      "Practice concise delivery within 90-120 seconds per answer",
    ],
  };
};
