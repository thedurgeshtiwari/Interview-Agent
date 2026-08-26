import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  getCurrentUser,
  addCredits,
  getUserStats,
} from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.get("/current-user", isAuth, getCurrentUser);
userRouter.post("/add-credits", isAuth, addCredits);
userRouter.get("/stats", isAuth, getUserStats);

export default userRouter;