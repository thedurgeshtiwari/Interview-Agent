import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: `failed to get currentUser ${error}` });
  }
};

// Add / purchase credits
export const addCredits = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount = 50 } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.credits = (user.credits || 0) + Number(amount);
    await user.save();

    return res.status(200).json({
      message: `${amount} credits added successfully!`,
      credits: user.credits,
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: `Failed to add credits: ${error.message}` });
  }
};

// Get aggregate stats for user dashboard
export const getUserStats = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const interviews = await Interview.find({ userId });
    const completed = interviews.filter((i) => i.status === "completed");
    const totalInterviews = interviews.length;
    const avgScore =
      completed.length > 0
        ? Math.round(
            completed.reduce((sum, item) => sum + (item.overallScore || 0), 0) /
              completed.length
          )
        : 0;

    const highestScore =
      completed.length > 0
        ? Math.max(...completed.map((item) => item.overallScore || 0))
        : 0;

    return res.status(200).json({
      credits: user.credits,
      totalInterviews,
      completedInterviews: completed.length,
      avgScore,
      highestScore,
    });
  } catch (error) {
    return res.status(500).json({ message: `Failed to get user stats: ${error.message}` });
  }
};