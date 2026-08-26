import mongoose from "mongoose";

const questionItemSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: "General",
  },
  sampleAnswer: {
    type: String,
    default: "",
  },
  userTranscript: {
    type: String,
    default: "",
  },
  userRating: {
    type: Number,
    default: 0,
  },
  feedback: {
    type: String,
    default: "",
  },
  score: {
    type: Number,
    default: 0,
  },
});

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    interviewType: {
      type: String,
      enum: ["Technical", "HR", "Resume"],
      default: "Technical",
    },
    jobRole: {
      type: String,
      required: true,
      default: "Software Engineer",
    },
    experienceLevel: {
      type: String,
      default: "Mid-Level (2-4 yrs)",
    },
    targetCompany: {
      type: String,
      default: "Tech Company",
    },
    resumeText: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      enum: ["male", "female"],
      default: "female",
    },
    questions: [questionItemSchema],
    overallScore: {
      type: Number,
      default: 0,
    },
    feedback: {
      strengths: {
        type: [String],
        default: [],
      },
      weaknesses: {
        type: [String],
        default: [],
      },
      summary: {
        type: String,
        default: "",
      },
      technicalScore: {
        type: Number,
        default: 0,
      },
      communicationScore: {
        type: Number,
        default: 0,
      },
      confidenceScore: {
        type: Number,
        default: 0,
      },
      suggestions: {
        type: [String],
        default: [],
      },
    },
    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },
  },
  { timestamps: true }
);

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
