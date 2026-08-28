import { createRequire } from "module";
import Interview from "../models/interview.model.js";
import User from "../models/user.model.js";
import {
  generateInterviewQuestions,
  evaluateSingleAnswer,
  generateFinalEvaluation,
} from "../services/ai.service.js";

const require = createRequire(import.meta.url);

// Parse uploaded PDF resume and extract text
export const parseResumePdf = async (req, res) => {
  let parser = null;
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    if (
      req.file.mimetype !== "application/pdf" &&
      !req.file.originalname.toLowerCase().endsWith(".pdf")
    ) {
      return res.status(400).json({ message: "Only PDF files are supported for resume parsing" });
    }

    // Lazily load PDF parser
    let PDFParseClass;
    try {
      const pdfModule = await import("pdf-parse");
      PDFParseClass = pdfModule.PDFParse || pdfModule.default || pdfModule;
    } catch (importErr) {
      const pdfModule = require("pdf-parse");
      PDFParseClass = pdfModule.PDFParse || pdfModule.default || pdfModule;
    }

    parser = new PDFParseClass({ data: req.file.buffer });
    await parser.load();
    const result = await parser.getText();
    const rawText = (typeof result === "string" ? result : result?.text) || "";
    const numPages = result?.total || 1;


    // Clean up excessive whitespace and page marker tags
    const cleanedText = rawText
      .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "")
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!cleanedText || cleanedText.length < 20) {
      return res.status(400).json({
        message: "Could not extract readable text from this PDF. Please ensure it is not an image-only scan.",
      });
    }

    return res.status(200).json({
      message: "Resume parsed successfully",
      fileName: req.file.originalname,
      numPages,
      charCount: cleanedText.length,
      text: cleanedText,
    });
  } catch (error) {
    console.error("Error parsing resume PDF:", error);
    return res.status(500).json({ message: `Failed to parse PDF resume: ${error.message}` });
  } finally {
    if (parser && typeof parser.destroy === "function") {
      try {
        await parser.destroy();
      } catch (e) {
        // ignore cleanup error
      }
    }
  }
};

// Create / Start a new interview session
export const createInterview = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      interviewType = "Technical",
      jobRole = "Software Engineer",
      experienceLevel = "Mid-Level (2-4 yrs)",
      targetCompany = "General",
      resumeText = "",
      avatar = "female",
      questionCount = 5,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const COST_PER_INTERVIEW = 20;
    if (user.credits < COST_PER_INTERVIEW) {
      return res.status(400).json({
        message: `Insufficient credits. You need at least ${COST_PER_INTERVIEW} credits to start an interview. Current balance: ${user.credits}`,
        credits: user.credits,
      });
    }

    if (interviewType === "Resume" && (!resumeText || resumeText.trim().length < 20)) {
      return res.status(400).json({
        message: "Please upload your resume PDF or provide your resume details for a Resume-Based interview.",
      });
    }

    // Deduct credits
    user.credits -= COST_PER_INTERVIEW;
    await user.save();

    // Generate questions using AI Service (strictly resume-based if Resume type/text provided)
    const questions = await generateInterviewQuestions({
      interviewType,
      jobRole,
      experienceLevel,
      targetCompany,
      resumeText,
      count: Math.min(Math.max(Number(questionCount) || 5, 3), 10),
    });

    const interview = await Interview.create({
      userId,
      interviewType,
      jobRole,
      experienceLevel,
      targetCompany,
      resumeText: resumeText || "",
      avatar,
      questions,
      status: "in-progress",
    });

    return res.status(201).json({
      message: "Interview started successfully",
      interviewId: interview._id,
      interview,
      remainingCredits: user.credits,
    });
  } catch (error) {
    console.error("Error creating interview:", error);
    return res.status(500).json({ message: `Failed to create interview: ${error.message}` });
  }
};

// Submit answer for a specific question
export const submitAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionId, transcript } = req.body;
    const userId = req.userId;

    const interview = await Interview.findOne({ _id: id, userId });
    if (!interview) {
      return res.status(404).json({ message: "Interview session not found" });
    }

    const targetQuestion = interview.questions.find((q) => q.id === Number(questionId));
    if (!targetQuestion) {
      return res.status(404).json({ message: "Question not found in interview" });
    }

    const isUnanswered =
      !transcript ||
      transcript.trim().length < 3 ||
      transcript.trim() === "No spoken answer provided.";

    targetQuestion.userTranscript = isUnanswered ? "No spoken answer provided." : transcript.trim();

    if (isUnanswered) {
      targetQuestion.score = 0;
      targetQuestion.feedback = "No response was recorded for this question.";
    } else {
      // Evaluate single answer
      const evaluation = await evaluateSingleAnswer({
        question: targetQuestion.question,
        userTranscript: transcript,
        jobRole: interview.jobRole,
        experienceLevel: interview.experienceLevel,
        interviewType: interview.interviewType,
      });

      targetQuestion.score = typeof evaluation.score === "number" ? evaluation.score : 0;
      targetQuestion.feedback = evaluation.feedback || "";
    }

    await interview.save();

    return res.status(200).json({
      message: "Answer submitted and evaluated",
      questionId,
      score: targetQuestion.score,
      feedback: targetQuestion.feedback,
      interview,
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return res.status(500).json({ message: `Failed to submit answer: ${error.message}` });
  }
};

// Finish interview and calculate final scorecard
export const finishInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const interview = await Interview.findOne({ _id: id, userId });
    if (!interview) {
      return res.status(404).json({ message: "Interview session not found" });
    }

    // Ensure any untouched/skipped questions are marked score 0 with clean feedback
    interview.questions.forEach((q) => {
      if (
        !q.userTranscript ||
        q.userTranscript.trim().length < 3 ||
        q.userTranscript === "No spoken answer provided."
      ) {
        q.score = 0;
        q.userTranscript = "No spoken answer provided.";
        if (!q.feedback) {
          q.feedback = "No response was recorded for this question.";
        }
      }
    });

    // Generate comprehensive evaluation
    const evaluation = await generateFinalEvaluation({
      interviewType: interview.interviewType,
      jobRole: interview.jobRole,
      experienceLevel: interview.experienceLevel,
      questionsWithAnswers: interview.questions,
    });

    interview.overallScore =
      typeof evaluation.overallScore === "number" ? evaluation.overallScore : 0;
    interview.feedback = {
      strengths: evaluation.strengths || [],
      weaknesses: evaluation.weaknesses || [],
      summary: evaluation.summary || "",
      technicalScore:
        typeof evaluation.technicalScore === "number" ? evaluation.technicalScore : 0,
      communicationScore:
        typeof evaluation.communicationScore === "number" ? evaluation.communicationScore : 0,
      confidenceScore:
        typeof evaluation.confidenceScore === "number" ? evaluation.confidenceScore : 0,
      suggestions: evaluation.suggestions || [],
    };
    interview.status = "completed";

    await interview.save();

    return res.status(200).json({
      message: "Interview completed successfully",
      interview,
    });
  } catch (error) {
    console.error("Error finishing interview:", error);
    return res.status(500).json({ message: `Failed to finish interview: ${error.message}` });
  }
};

// Get user's interview history
export const getUserInterviews = async (req, res) => {
  try {
    const userId = req.userId;
    const interviews = await Interview.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      interviews,
      count: interviews.length,
    });
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return res.status(500).json({ message: `Failed to fetch interviews: ${error.message}` });
  }
};

// Get single interview by ID
export const getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const interview = await Interview.findOne({ _id: id, userId });
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    return res.status(200).json(interview);
  } catch (error) {
    console.error("Error fetching interview:", error);
    return res.status(500).json({ message: `Failed to fetch interview: ${error.message}` });
  }
};
