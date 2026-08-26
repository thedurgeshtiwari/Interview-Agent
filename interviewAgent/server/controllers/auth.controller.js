import User from "../models/user.model.js";
import genToken from "../config/token.js";

// Google authentication
export const googleAuth = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      user = await User.create({
        name: name || email.split("@")[0],
        email: email.toLowerCase().trim(),
        credits: 200,
      });
    }

    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      credits: user.credits,
      token,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return res.status(500).json({
      message: `Google Authentication error: ${error.message}`,
    });
  }
};

// Email direct authentication
export const emailLogin = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email address is required" });
    }

    let user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      user = await User.create({
        name: name?.trim() || email.split("@")[0],
        email: email.toLowerCase().trim(),
        credits: 200,
      });
    }

    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      credits: user.credits,
      token,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("Email auth error:", error);
    return res.status(500).json({
      message: `Authentication failed: ${error.message}`,
    });
  }
};

// Instant 1-Click Demo Candidate login
export const demoAuth = async (req, res) => {
  try {
    const demoEmail = "demo.candidate@interviewiq.ai";
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      user = await User.create({
        name: "Demo Candidate",
        email: demoEmail,
        credits: 200,
      });
    }

    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      credits: user.credits,
      token,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("Demo auth error:", error);
    return res.status(500).json({ message: `Demo auth failed: ${error.message}` });
  }
};

// Logout
export const logOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({
      message: "Logout successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      message: "Logout failed",
    });
  }
};