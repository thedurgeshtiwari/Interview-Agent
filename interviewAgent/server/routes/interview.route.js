import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  createInterview,
  submitAnswer,
  finishInterview,
  getUserInterviews,
  getInterviewById,
} from "../controllers/interview.controller.js";

const interviewRouter = express.Router();

interviewRouter.post("/create", isAuth, createInterview);
interviewRouter.post("/:id/answer", isAuth, submitAnswer);
interviewRouter.post("/:id/finish", isAuth, finishInterview);
interviewRouter.get("/history", isAuth, getUserInterviews);
interviewRouter.get("/:id", isAuth, getInterviewById);

export default interviewRouter;
