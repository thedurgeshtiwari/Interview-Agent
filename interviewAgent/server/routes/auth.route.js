import express from "express";
import {
  googleAuth,
  emailLogin,
  demoAuth,
  logOut,
} from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/google", googleAuth);
authRouter.post("/email", emailLogin);
authRouter.post("/demo", demoAuth);
authRouter.get("/logout", logOut);

export default authRouter;