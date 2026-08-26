import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    startInterview,
    submitAnswer,
    evaluateInterviewController,
    getInterviewDetails,
    getInterviewHistory
} from "../controllers/interview.controller.js";

const interviewRouter = express.Router();

// Apply auth middleware to all routes
interviewRouter.use(isAuth);

interviewRouter.post("/start", upload.single("resume"), startInterview);
interviewRouter.post("/:id/answer", submitAnswer);
interviewRouter.post("/:id/evaluate", evaluateInterviewController);
interviewRouter.get("/history", getInterviewHistory);
interviewRouter.get("/:id", getInterviewDetails);

export default interviewRouter;
