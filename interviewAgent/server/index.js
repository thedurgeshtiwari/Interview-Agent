import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/connectDB.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/user.route.js"
import interviewRouter from "./routes/interview.route.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))

app.get("/", (req, res) => {
    res.json({ status: "ok", message: "InterviewIQ API is running" })
})

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/interview", interviewRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  connectDB()
})

setInterval(() => {}, 1000 * 60 * 60)
