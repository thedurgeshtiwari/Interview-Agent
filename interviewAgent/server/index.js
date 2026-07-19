import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/connectDB.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/user.route.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error)
    process.exit(1)
  })