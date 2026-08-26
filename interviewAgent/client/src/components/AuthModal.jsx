import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FaRobot,
  FaTimes,
  FaUserCheck,
  FaEnvelope,
  FaArrowRight,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { IoSparkles } from "react-icons/io5";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { ServerUrl } from "../App";

const AuthModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [authMode, setAuthMode] = useState("options"); // "options" | "email"
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");

  if (!isOpen) return null;

  const handleLoginSuccess = (userData) => {
    if (userData.token) {
      localStorage.setItem("interviewiq_token", userData.token);
    }
    dispatch(setUserData(userData));
    onClose();
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const response = await signInWithPopup(auth, provider);
      const user = response.user;
      const name = user.displayName;
      const email = user.email;

      const result = await axios.post(
        ServerUrl + "/api/auth/google",
        { name, email },
        { withCredentials: true }
      );

      handleLoginSuccess(result.data);
    } catch (error) {
      console.error("Google Auth error:", error);
      const code = error.code || "";
      if (code === "auth/popup-closed-by-user") {
        setErrorMsg("Sign-in popup was closed. Please try again or use Demo/Email login.");
      } else if (code === "auth/unauthorized-domain") {
        setErrorMsg("Domain not authorized in Firebase. Use 1-Click Demo Login or Email Login below.");
      } else {
        setErrorMsg(`Google sign-in notice: ${code || error.message}. Use 1-Click Demo Login below!`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAuth = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const result = await axios.post(
        ServerUrl + "/api/auth/demo",
        {},
        { withCredentials: true }
      );
      handleLoginSuccess(result.data);
    } catch (error) {
      console.error("Demo login error:", error);
      setErrorMsg(error.response?.data?.message || "Demo login failed. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      const result = await axios.post(
        ServerUrl + "/api/auth/email",
        { name: nameInput || emailInput.split("@")[0], email: emailInput },
        { withCredentials: true }
      );
      handleLoginSuccess(result.data);
    } catch (error) {
      console.error("Email login error:", error);
      setErrorMsg(error.response?.data?.message || "Email login failed. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-100"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition"
          >
            <FaTimes size={18} />
          </button>

          {/* Logo & Title */}
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-black text-white p-2.5 rounded-xl shadow-md">
              <FaRobot size={20} />
            </div>
            <div>
              <h2 className="font-extrabold text-xl text-gray-900 tracking-tight">
                InterviewIQ<span className="text-emerald-500">.AI</span>
              </h2>
              <p className="text-[11px] text-gray-500">AI Mock Interview Platform</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full mb-2">
              <IoSparkles size={13} />
              <span>200 Free Trial Credits</span>
            </div>
            <h3 className="text-xl md:text-2xl font-extrabold text-gray-950 tracking-tight leading-snug">
              Welcome Candidate
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Sign in to unlock interactive AI video avatars, real-time speech evaluation, and scorecards.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100 leading-relaxed">
              {errorMsg}
            </div>
          )}

          {authMode === "options" ? (
            <div className="space-y-3">
              {/* Demo Login (Primary 1-Click) */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                onClick={handleDemoAuth}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 transition text-xs md:text-sm cursor-pointer"
              >
                <FaUserCheck size={16} />
                <span>{loading ? "Signing in..." : "1-Click Demo Candidate Login"}</span>
              </motion.button>

              {/* Google Sign In */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                onClick={handleGoogleAuth}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 rounded-2xl font-semibold shadow-xs transition text-xs md:text-sm cursor-pointer"
              >
                <FcGoogle size={20} />
                <span>Continue with Google</span>
              </motion.button>

              {/* Email Direct Login Button */}
              <button
                type="button"
                onClick={() => {
                  setErrorMsg("");
                  setAuthMode("email");
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl font-semibold transition text-xs cursor-pointer"
              >
                <FaEnvelope size={13} className="text-gray-500" />
                <span>Continue with Email Address</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black bg-gray-50"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAuthMode("options")}
                  className="px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2"
                >
                  <span>{loading ? "Signing in..." : "Continue"}</span>
                  <FaArrowRight size={11} />
                </motion.button>
              </div>
            </form>
          )}

          <p className="text-center text-[11px] text-gray-400 mt-5">
            By signing in, you get 200 free credits immediately to practice.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
