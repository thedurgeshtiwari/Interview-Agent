import Interview from "../models/interview.model.js";
import User from "../models/user.model.js";
import { generateQuestions, evaluateInterview } from "../services/gemini.service.js";

// Start a new interview
export const startInterview = async (req, res) => {
    try {
        const { role, description, experience, numQuestions = 5 } = req.body;
        const userId = req.userId;

        if (!role || !description || !experience) {
            return res.status(400).json({ message: "Role, description, and experience level are required." });
        }

        // Check user credits
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.credits < 10) {
            return res.status(403).json({ message: "Insufficient credits. Please top up your account." });
        }

        // Extract uploaded resume details if present
        const resumeBuffer = req.file ? req.file.buffer : null;
        const resumeName = req.file ? req.file.originalname : "";

        // Call Gemini service to generate questions
        const questionTexts = await generateQuestions(role, description, experience, numQuestions, resumeBuffer);

        const questionsArray = questionTexts.map(q => ({
            question: q,
            userAnswer: "",
            feedback: "",
            score: null,
            idealAnswer: ""
        }));

        // Deduct credits
        user.credits -= 10;
        await user.save();

        // Create new interview
        const newInterview = await Interview.create({
            userId,
            role,
            description,
            experience,
            numQuestions,
            questions: questionsArray,
            resumeName,
            status: "created"
        });

        return res.status(201).json({
            interview: newInterview,
            credits: user.credits
        });
    } catch (error) {
        console.error("Error starting interview:", error);
        return res.status(500).json({ message: `Failed to start interview: ${error.message}` });
    }
};

// Submit/update answer for a single question
export const submitAnswer = async (req, res) => {
    try {
        const { id } = req.params; // interviewId
        const { questionId, userAnswer } = req.body;
        const userId = req.userId;

        if (!questionId || userAnswer === undefined) {
            return res.status(400).json({ message: "Question ID and userAnswer are required." });
        }

        const interview = await Interview.findById(id);
        if (!interview) {
            return res.status(404).json({ message: "Interview session not found." });
        }

        if (interview.userId.toString() !== userId) {
            return res.status(403).json({ message: "Access denied. You do not own this session." });
        }

        // Find the question and update the answer
        const question = interview.questions.id(questionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found in this session." });
        }

        question.userAnswer = userAnswer;

        // Change status to in_progress if currently created
        if (interview.status === "created") {
            interview.status = "in_progress";
        }

        await interview.save();
        return res.status(200).json(interview);
    } catch (error) {
        console.error("Error submitting answer:", error);
        return res.status(500).json({ message: `Failed to submit answer: ${error.message}` });
    }
};

// Complete and evaluate the interview
export const evaluateInterviewController = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const interview = await Interview.findById(id);
        if (!interview) {
            return res.status(404).json({ message: "Interview session not found." });
        }

        if (interview.userId.toString() !== userId) {
            return res.status(403).json({ message: "Access denied." });
        }

        // Prepare Q&A list for Gemini
        const qaList = interview.questions.map(q => ({
            question: q.question,
            userAnswer: q.userAnswer || "No answer provided."
        }));

        // Call Gemini service
        const evaluation = await evaluateInterview(interview.role, interview.experience, qaList);

        // Update each question's evaluation
        evaluation.questions.forEach((evalQ) => {
            const originalQ = interview.questions.find(q => q.question === evalQ.question);
            if (originalQ) {
                originalQ.feedback = evalQ.feedback;
                originalQ.score = evalQ.score;
                originalQ.idealAnswer = evalQ.idealAnswer;
            }
        });

        // Update overall results
        interview.overallScore = evaluation.overallScore;
        interview.overallFeedback = evaluation.overallFeedback;
        interview.status = "completed";

        await interview.save();
        return res.status(200).json(interview);
    } catch (error) {
        console.error("Error evaluating interview:", error);
        return res.status(500).json({ message: `Failed to evaluate interview: ${error.message}` });
    }
};

// Get details of a single interview session
export const getInterviewDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const interview = await Interview.findById(id);
        if (!interview) {
            return res.status(404).json({ message: "Interview session not found." });
        }

        if (interview.userId.toString() !== userId) {
            return res.status(403).json({ message: "Access denied." });
        }

        return res.status(200).json(interview);
    } catch (error) {
        console.error("Error fetching interview details:", error);
        return res.status(500).json({ message: `Failed to fetch interview details: ${error.message}` });
    }
};

// Get interview history list for the logged-in user
export const getInterviewHistory = async (req, res) => {
    try {
        const userId = req.userId;

        const history = await Interview.find({ userId })
            .select("role experience numQuestions status overallScore createdAt")
            .sort({ createdAt: -1 });

        return res.status(200).json(history);
    } catch (error) {
        console.error("Error fetching interview history:", error);
        return res.status(500).json({ message: `Failed to fetch history: ${error.message}` });
    }
};
