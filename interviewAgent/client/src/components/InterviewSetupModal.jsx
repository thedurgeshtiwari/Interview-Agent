import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FaTimes,
  FaRobot,
  FaBriefcase,
  FaUserTie,
  FaFileAlt,
  FaCoins,
  FaVolumeUp,
  FaCheckCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { ServerUrl } from "../App";

import femaleAiVideo from "../assets/Videos/female-ai.mp4";
import maleAiVideo from "../assets/Videos/male-ai.mp4";

const POPULAR_ROLES = [
  "Full Stack Developer",
  "Frontend Developer (React/Next)",
  "Backend Engineer (Node/Python/Java)",
  "AI & ML Engineer",
  "DevOps / Cloud Engineer",
  "Data Scientist",
  "Product Manager",
];

const EXPERIENCE_LEVELS = [
  "Fresher / Entry Level (0-1 yr)",
  "Junior Developer (1-2 yrs)",
  "Mid-Level Engineer (2-4 yrs)",
  "Senior Engineer (5+ yrs)",
  "Lead / Staff Architect",
];

const InterviewSetupModal = ({
  isOpen,
  onClose,
  initialType = "Technical",
  onOpenAuth,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  const [interviewType, setInterviewType] = useState(initialType);
  const [jobRole, setJobRole] = useState("Full Stack Developer");
  const [experienceLevel, setExperienceLevel] = useState("Mid-Level Engineer (2-4 yrs)");
  const [targetCompany, setTargetCompany] = useState("Top Tech Company");
  const [avatar, setAvatar] = useState("female");
  const [resumeText, setResumeText] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleStart = async () => {
    if (!userData) {
      onClose();
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if ((userData.credits || 0) < 20) {
      setErrorMsg("You need at least 20 credits to start an interview session. Please recharge credits.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const response = await axios.post(
        ServerUrl + "/api/interview/create",
        {
          interviewType,
          jobRole,
          experienceLevel,
          targetCompany,
          avatar,
          resumeText,
          questionCount: Number(questionCount),
        },
        { withCredentials: true }
      );

      // Update remaining credits in Redux
      if (response.data.remainingCredits !== undefined) {
        dispatch(
          setUserData({
            ...userData,
            credits: response.data.remainingCredits,
          })
        );
      }

      onClose();
      navigate(`/interview/${response.data.interviewId}`);
    } catch (err) {
      console.error("Start interview error:", err);
      const msg = err.response?.data?.message || "Failed to start interview. Please check server connection.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-100 my-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition"
          >
            <FaTimes size={18} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-black text-white p-2.5 rounded-xl shadow-sm">
              <FaRobot size={22} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Setup Your AI Mock Interview
              </h2>
              <p className="text-xs md:text-sm text-gray-500">
                Configure your domain, seniority, and preferred AI interviewer
              </p>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setInterviewType("Technical")}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-medium text-sm transition border-2 ${
                interviewType === "Technical"
                  ? "border-black bg-black text-white shadow-md"
                  : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700"
              }`}
            >
              <FaBriefcase size={16} />
              <span>Technical</span>
            </button>

            <button
              type="button"
              onClick={() => setInterviewType("HR")}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-medium text-sm transition border-2 ${
                interviewType === "HR"
                  ? "border-black bg-black text-white shadow-md"
                  : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700"
              }`}
            >
              <FaUserTie size={16} />
              <span>HR & Behavioral</span>
            </button>

            <button
              type="button"
              onClick={() => setInterviewType("Resume")}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-medium text-sm transition border-2 ${
                interviewType === "Resume"
                  ? "border-black bg-black text-white shadow-md"
                  : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700"
              }`}
            >
              <FaFileAlt size={16} />
              <span>Resume-Based</span>
            </button>
          </div>

          <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
            {/* Job Role Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                Target Role / Technology
              </label>
              <input
                type="text"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="e.g. React Developer, Data Engineer, Python Backend..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm text-gray-900 bg-gray-50"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {POPULAR_ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setJobRole(r)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition ${
                      jobRole === r
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level & Target Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm text-gray-900 bg-gray-50"
                >
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                  Target Company / Domain
                </label>
                <input
                  type="text"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="e.g. Google, Amazon, FinTech Startup..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm text-gray-900 bg-gray-50"
                />
              </div>
            </div>

            {/* Resume Input if Resume Mode */}
            {interviewType === "Resume" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                  Resume Summary / Past Projects / Skills
                </label>
                <textarea
                  rows={3}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste key points from your resume: projects built, tech stack used, past achievements, or responsibilities..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm text-gray-900 bg-gray-50"
                />
              </div>
            )}

            {/* AI Avatar Selector with live video preview */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                Choose Your AI Interviewer
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* Female Sophia */}
                <div
                  onClick={() => setAvatar("female")}
                  className={`cursor-pointer rounded-2xl border-2 p-3 transition relative flex flex-col items-center text-center ${
                    avatar === "female"
                      ? "border-emerald-500 bg-emerald-50/40 shadow-md ring-2 ring-emerald-400"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  {avatar === "female" && (
                    <div className="absolute top-3 right-3 text-emerald-600">
                      <FaCheckCircle size={18} />
                    </div>
                  )}
                  <div className="w-24 h-24 rounded-2xl overflow-hidden mb-2 bg-gray-900 border border-gray-200 shadow-inner">
                    <video
                      src={femaleAiVideo}
                      muted
                      autoPlay
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-bold text-sm text-gray-900">Sophia</h4>
                  <p className="text-xs text-gray-500">Executive Technical Lead</p>
                </div>

                {/* Male Alex */}
                <div
                  onClick={() => setAvatar("male")}
                  className={`cursor-pointer rounded-2xl border-2 p-3 transition relative flex flex-col items-center text-center ${
                    avatar === "male"
                      ? "border-emerald-500 bg-emerald-50/40 shadow-md ring-2 ring-emerald-400"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  {avatar === "male" && (
                    <div className="absolute top-3 right-3 text-emerald-600">
                      <FaCheckCircle size={18} />
                    </div>
                  )}
                  <div className="w-24 h-24 rounded-2xl overflow-hidden mb-2 bg-gray-900 border border-gray-200 shadow-inner">
                    <video
                      src={maleAiVideo}
                      muted
                      autoPlay
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-bold text-sm text-gray-900">Alex</h4>
                  <p className="text-xs text-gray-500">Senior Hiring Manager</p>
                </div>
              </div>
            </div>

            {/* Question count selector */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-200">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Number of Questions
              </span>
              <div className="flex gap-2">
                {[3, 5, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                      questionCount === num
                        ? "bg-black text-white shadow-sm"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {num} Questions
                  </button>
                ))}
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100">
              {errorMsg}
            </div>
          )}

          {/* Footer actions */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FaCoins className="text-amber-500" size={16} />
              <span>Session Cost: <strong className="text-gray-900">20 Credits</strong></span>
              <span className="text-gray-300">|</span>
              <span>Available: <strong className="text-emerald-600">{userData?.credits ?? 0} Credits</strong></span>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-5 py-3 rounded-2xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                onClick={handleStart}
                className="flex-1 sm:flex-none px-7 py-3 rounded-2xl bg-black text-white text-sm font-semibold shadow-lg hover:bg-gray-800 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Preparing AI Stage...</span>
                  </>
                ) : (
                  <>
                    <FaVolumeUp size={14} />
                    <span>Enter Live Interview Room</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InterviewSetupModal;
