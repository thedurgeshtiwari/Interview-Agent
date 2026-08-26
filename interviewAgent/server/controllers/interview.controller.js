import Interview from "../models/interview.model.js";
import User from "../models/user.model.js";
import {
  generateInterviewQuestions,
  evaluateSingleAnswer,
  generateFinalEvaluation,
} from "../services/ai.service.js";

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

    // Deduct credits
    user.credits -= COST_PER_INTERVIEW;
    await user.save();

    // Generate questions using AI Service
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
      resumeText,
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

    targetQuestion.userTranscript = transcript || "";

    // Evaluate single answer
    const evaluation = await evaluateSingleAnswer({
      question: targetQuestion.question,
      userTranscript: transcript,
      jobRole: interview.jobRole,
      experienceLevel: interview.experienceLevel,
      interviewType: interview.interviewType,
    });

    targetQuestion.score = evaluation.score || 70;
    targetQuestion.feedback = evaluation.feedback || "";

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

    // Generate comprehensive evaluation
    const evaluation = await generateFinalEvaluation({
      interviewType: interview.interviewType,
      jobRole: interview.jobRole,
      experienceLevel: interview.experienceLevel,
      questionsWithAnswers: interview.questions,
    });

    interview.overallScore = evaluation.overallScore || 75;
    interview.feedback = {
      strengths: evaluation.strengths || [],
      weaknesses: evaluation.weaknesses || [],
      summary: evaluation.summary || "",
      technicalScore: evaluation.technicalScore || 75,
      communicationScore: evaluation.communicationScore || 75,
      confidenceScore: evaluation.confidenceScore || 75,
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
