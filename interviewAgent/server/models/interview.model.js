import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    userAnswer: {
        type: String,
        default: ""
    },
    feedback: {
        type: String,
        default: ""
    },
    score: {
        type: Number,
        default: null
    },
    idealAnswer: {
        type: String,
        default: ""
    }
});

const interviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    role: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        enum: ["Entry", "Mid", "Senior"],
        required: true
    },
    numQuestions: {
        type: Number,
        default: 5
    },
    questions: [questionSchema],
    overallScore: {
        type: Number,
        default: null
    },
    overallFeedback: {
        type: String,
        default: ""
    },
    resumeName: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["created", "in_progress", "completed"],
        default: "created"
    }
}, { timestamps: true });

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
