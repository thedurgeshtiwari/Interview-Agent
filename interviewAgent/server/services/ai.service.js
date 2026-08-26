import { GoogleGenerativeAI } from "@google/generative-ai";

const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    console.warn("⚠️ [AI Service] GEMINI_API_KEY is not set in server/.env. Using fallback generator.");
    return null;
  }
  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    return genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
  } catch (err) {
    console.warn("Could not initialize GoogleGenerativeAI with gemini-3.6-flash:", err.message);
    try {
      const genAI = new GoogleGenerativeAI(apiKey.trim());
      return genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    } catch (e) {
      return null;
    }
  }
};

// Fallback question generator that filters out contact details (emails, phone numbers, urls)
const getFallbackQuestions = (interviewType, jobRole, experienceLevel, count = 5, resumeText = "") => {
  const isTechnical = interviewType === "Technical";
  const isHR = interviewType === "HR";

  if (isTechnical && !resumeText) {
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

  if (isHR && !resumeText) {
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

  // Filter out contact details (phone, email, links, address) so fallback only uses project & tech lines
  const cleanLines = resumeText
    ? resumeText
        .split("\n")
        .map((l) => l.trim())
        .filter(
          (l) =>
            l.length > 20 &&
            !l.includes("@") &&
            !l.match(/\+?\d{8,}/) &&
            !l.match(/github\.com|linkedin\.com|portfolio|http/i) &&
            !l.match(/phone|email|address|contact/i)
        )
    : [];

  const projectSnippet = cleanLines[0] ? `"${cleanLines[0].slice(0, 50)}..."` : "the core projects in your resume";
  const techSnippet = cleanLines[1] ? `"${cleanLines[1].slice(0, 50)}..."` : "the tools and frameworks in your resume";

  return [
    {
      id: 1,
      question: `In your resume, you highlighted experience with ${projectSnippet}. Can you walk me through the system architecture, state flow, and your specific technical contributions?`,
      category: "Resume Project Deep Dive",
      sampleAnswer: "I was responsible for architecting the solution, selecting the stack, designing data schemas, and ensuring scalable throughput.",
    },
    {
      id: 2,
      question: `Looking at your experience with ${techSnippet}, what was the most demanding technical obstacle or performance bottleneck you encountered and how did you resolve it?`,
      category: "Technical Problem Solving",
      sampleAnswer: "I isolated the bottleneck through profiling and logs, identified concurrency/state handling issues, and deployed a targeted refactoring that significantly improved responsiveness.",
    },
    {
      id: 3,
      question: "Can you elaborate on a key architectural or engineering trade-off you made during one of the major projects highlighted in your resume?",
      category: "Architecture & Design Decisions",
      sampleAnswer: "I evaluated multiple architectural trade-offs between delivery speed and long-term scalability before selecting the optimal modular pattern.",
    },
    {
      id: 4,
      question: "How did you measure and validate the success, performance, or business impact of the projects detailed in your resume?",
      category: "Metrics & Business Impact",
      sampleAnswer: "I tracked concrete metrics such as response latency, user throughput, test coverage, and customer satisfaction scores.",
    },
    {
      id: 5,
      question: "Based on the technologies in your resume, what is an area where you decided to push your technical boundaries and learn something completely new?",
      category: "Continuous Growth & Tech Stack",
      sampleAnswer: "I actively embraced modern tooling, optimized deployment workflows, and integrated modern APIs to solve real-world problems efficiently.",
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
      const isResumeMode = interviewType === "Resume" || (resumeText && resumeText.trim().length > 30);

      let prompt = "";

      if (isResumeMode) {
        prompt = `You are an elite senior technical hiring manager and interviewer at ${targetCompany}.
You are conducting a strict, project-focused interview based EXCLUSIVELY and DIRECTLY on the candidate's uploaded resume.

=== CANDIDATE RESUME / CV CONTENT ===
${resumeText.trim()}
======================================

CRITICAL MANDATORY INSTRUCTIONS:
1. Every single question MUST directly reference and examine specific projects, tools, frameworks, metrics, internships, responsibilities, or architectural decisions EXPLICITLY mentioned in the candidate's resume above.
2. DO NOT ask generic textbook questions. DO NOT quote contact details (phone number, email, address).
3. Craft questions that read like a real human senior interviewer:
   - "In your resume, you built [Specific Project Name] using [Specific Tech]. Can you walk me through how you designed the database schema, handled state/concurrency, and implemented [Feature]?"
   - "During your experience with [Company/Project], you mentioned achieving [Specific Result/Metric]. What architectural decisions made that possible?"
   - "You listed [Specific Tool/Framework]. How did you structure your application and solve debugging bottlenecks in [Specific Project]?"
4. Generate exactly ${count} diverse, deep-dive questions covering:
   - Flagship project deep dive
   - Technical implementation details & code architecture
   - Complex problem solving, edge cases, and debugging in their listed projects
   - Scalability, performance optimizations, and metrics mentioned in the resume
   - Architectural decisions & trade-offs made in their past work
5. Target Role: ${jobRole} (${experienceLevel})

Return ONLY a valid JSON array of objects with the following schema:
[
  {
    "id": 1,
    "question": "Specific interview question directly quoting and referencing their exact resume project/experience",
    "category": "Resume Project Deep Dive / Architecture / Tech Stack",
    "sampleAnswer": "Key technical details, architecture points, and trade-offs expected in an exemplary answer"
  }
]
Do not include any Markdown code fence outside the JSON or text before/after. Return raw JSON string only.`;
      } else {
        prompt = `You are an expert technical hiring manager and interviewer at ${targetCompany}.
Generate ${count} realistic, challenging, and insightful interview questions for a candidate applying for:
- Role: ${jobRole}
- Experience Level: ${experienceLevel}
- Interview Type: ${interviewType}

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
      }

      console.log(`🤖 [AI Service] Calling Gemini 3.6 Flash for ${isResumeMode ? "Resume-based" : interviewType} questions...`);
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleanedJson = text.replace(/```json|```/gi, "").trim();
      const parsed = JSON.parse(cleanedJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`✅ [AI Service] Successfully generated ${parsed.length} dynamic AI questions via Gemini.`);
        return parsed.map((q, idx) => ({
          id: idx + 1,
          question: q.question,
          category: q.category || "Resume Deep Dive",
          sampleAnswer: q.sampleAnswer || "",
          userTranscript: "",
          userRating: 0,
          feedback: "",
          score: 0,
        }));
      }
    } catch (err) {
      console.error("❌ [AI Service] Gemini question generation error, falling back:", err.message);
    }
  }

  // Fallback
  return getFallbackQuestions(interviewType, jobRole, experienceLevel, count, resumeText).map((q, idx) => ({
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
  if (!userTranscript || userTranscript.trim().length < 3) {
    return {
      score: 0,
      feedback: "No response was recorded for this question. Make sure your microphone is active and you speak your answer.",
    };
  }

  if (userTranscript.trim().length < 10 || userTranscript.trim().split(/\s+/).length < 3) {
    return {
      score: 15,
      feedback: "Answer was too brief to evaluate. Provide concrete explanations, examples, and technical details.",
    };
  }

  const model = getGeminiModel();

  if (model) {
    try {
      const prompt = `You are a strict, fair AI interviewer assessing a candidate's verbal answer.
Question: "${question}"
Candidate's Response: "${userTranscript}"
Role: ${jobRole} (${experienceLevel}) - ${interviewType} Round

Evaluate the response accuracy, clarity, and depth.
If the response does not answer the question or is gibberish, award a score between 0 and 20.
If the response is partially correct, award between 40 and 70.
If the response is thorough and demonstrates mastery, award between 75 and 100.

Output ONLY a JSON object:
{
  "score": <integer from 0 to 100>,
  "feedback": "<2-3 sentences of honest, constructive feedback highlighting what was good and what was missing>"
}
Return raw JSON without markdown fences.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json|```/gi, "").trim();
      return JSON.parse(cleaned);
    } catch (err) {
      console.error("❌ [AI Service] Gemini single answer evaluation error:", err.message);
    }
  }

  // Fallback evaluation heuristic
  const words = userTranscript.trim().split(/\s+/).length;
  let score = 50;
  let feedback = "Decent attempt. Adding more technical depth and structured examples will improve your evaluation.";

  if (words > 60) {
    score = 85;
    feedback = "Thorough and well-articulated response covering key concepts with good clarity.";
  } else if (words > 30) {
    score = 75;
    feedback = "Clear answer with relevant points. Adding more concrete project examples would make it even stronger.";
  } else if (words > 10) {
    score = 55;
    feedback = "Basic answer provided. Elaborating further on implementation and real-world considerations would raise your score.";
  } else {
    score = 25;
    feedback = "Answer was too short. Try to elaborate on your reasoning and give concrete examples.";
  }

  return { score, feedback };
};

export const generateFinalEvaluation = async ({
  interviewType,
  jobRole,
  experienceLevel,
  questionsWithAnswers,
}) => {
  const answeredQuestions = questionsWithAnswers.filter(
    (q) => q.userTranscript && q.userTranscript.trim().length >= 5
  );
  const totalCount = questionsWithAnswers.length || 1;
  const answeredCount = answeredQuestions.length;

  if (answeredCount === 0) {
    return {
      overallScore: 0,
      technicalScore: 0,
      communicationScore: 0,
      confidenceScore: 0,
      summary: "No spoken or written responses were recorded during this interview session. To receive a detailed assessment, please ensure your microphone is enabled and speak your answers clearly for each question.",
      strengths: [],
      weaknesses: [
        "No responses were submitted for any of the interview questions.",
        "Unable to evaluate technical capability or communication skills without candidate input.",
      ],
      suggestions: [
        "Check browser microphone permissions to ensure audio is properly captured.",
        "Click the microphone button and speak clearly into your microphone.",
        "Attempt to answer all questions to receive personalized performance analytics.",
      ],
    };
  }

  const model = getGeminiModel();

  if (model) {
    try {
      const answersSummary = questionsWithAnswers
        .map((q, i) => {
          const hasAns = q.userTranscript && q.userTranscript.trim().length >= 3;
          return `Q${i + 1} (${q.category || "General"}): ${q.question}
Answer: ${hasAns ? q.userTranscript : "[UNANSWERED - Score: 0]"}
Individual Score: ${q.score || 0}/100\n`;
        })
        .join("\n");

      const prompt = `You are a Principal Technical Hiring Manager conducting a final evaluation of a candidate's mock interview.
Role: ${jobRole} (${experienceLevel})
Round: ${interviewType}
Total Questions: ${totalCount}
Questions Answered: ${answeredCount}/${totalCount}

Interview Log:
${answersSummary}

CRITICAL SCORING RULES:
- Unanswered questions must heavily penalize the overall, technical, communication, and confidence scores proportionally.
- If only 1 out of 5 questions was answered, the overall score cannot exceed 20-25.
- If all questions were answered with high quality, score accurately between 75-95.
- Provide honest, highly constructive feedback.

Generate a comprehensive scorecard in JSON format:
{
  "overallScore": <integer 0-100>,
  "technicalScore": <integer 0-100>,
  "communicationScore": <integer 0-100>,
  "confidenceScore": <integer 0-100>,
  "summary": "<3-4 sentence evaluation summary accurately reflecting their actual answers and attendance>",
  "strengths": ["<specific strength from their actual answers>"],
  "weaknesses": ["<specific area of improvement or missing answers>"],
  "suggestions": ["<actionable advice 1>", "<actionable advice 2>", "<actionable advice 3>"]
}
Return raw JSON only without markdown formatting.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json|```/gi, "").trim();
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (err) {
      console.error("❌ [AI Service] Gemini final evaluation error:", err.message);
    }
  }

  // Fallback calculation: compute mathematically honest scores based on questions actually answered
  const sumScores = questionsWithAnswers.reduce((acc, q) => acc + (q.score || 0), 0);
  const avgScore = Math.round(sumScores / totalCount);

  const completionRatio = answeredCount / totalCount;
  const technicalScore = Math.round(avgScore * completionRatio);
  const communicationScore = Math.round((avgScore > 0 ? Math.max(10, avgScore - 5) : 0) * completionRatio);
  const confidenceScore = Math.round((avgScore > 0 ? Math.max(10, avgScore) : 0) * completionRatio);
  const overallScore = Math.round((technicalScore + communicationScore + confidenceScore) / 3);

  return {
    overallScore,
    technicalScore,
    communicationScore,
    confidenceScore,
    summary: `The candidate completed ${answeredCount} of ${totalCount} questions for the ${jobRole} position with an average response score of ${avgScore}%. ${
      answeredCount < totalCount
        ? "Leaving questions unanswered significantly reduced the overall scorecard."
        : "Consistent participation throughout the session provided a solid basis for assessment."
    }`,
    strengths:
      answeredCount > 0
        ? [
            `Demonstrated initial knowledge in ${jobRole} fundamentals for attempted questions`,
            "Active engagement in the simulated interview environment",
          ]
        : [],
    weaknesses: [
      answeredCount < totalCount
        ? `Missed answering ${totalCount - answeredCount} out of ${totalCount} questions in the session`
        : "Responses could include more quantifiable outcomes and specific architectural trade-offs",
    ],
    suggestions: [
      "Ensure all questions are attempted to maximize scoring potential",
      "Use the STAR method (Situation, Task, Action, Result) to structure spoken answers",
      "Elaborate on real-world engineering constraints and metrics",
    ],
  };
};
