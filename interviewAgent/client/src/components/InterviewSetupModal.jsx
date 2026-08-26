import React, { useState, useRef } from "react";
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
  FaCloudUploadAlt,
  FaFilePdf,
  FaTrashAlt,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaExclamationTriangle,
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

  const fileInputRef = useRef(null);

  const [interviewType, setInterviewType] = useState(initialType);
  const [jobRole, setJobRole] = useState("Full Stack Developer");
  const [experienceLevel, setExperienceLevel] = useState("Mid-Level Engineer (2-4 yrs)");
  const [targetCompany, setTargetCompany] = useState("Top Tech Company");
  const [avatar, setAvatar] = useState("female");
  const [resumeText, setResumeText] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // PDF Upload States
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfFileName, setPdfFileName] = useState("");
  const [pdfPageCount, setPdfPageCount] = useState(0);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfUploadSuccess, setPdfUploadSuccess] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [showPreviewText, setShowPreviewText] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  if (!isOpen) return null;

  const handlePdfUpload = async (file) => {
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setPdfError("Please upload a valid PDF document (.pdf).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPdfError("File size exceeds 10MB limit. Please upload a smaller PDF.");
      return;
    }

    setPdfError("");
    setPdfFile(file);
    setPdfFileName(file.name);
    setIsUploadingPdf(true);
    setPdfUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("resumePdf", file);

      const response = await axios.post(
        `${ServerUrl}/api/interview/parse-resume`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const parsedText = response.data.text || "";
      setResumeText(parsedText);
      setPdfPageCount(response.data.numPages || 1);
      setPdfUploadSuccess(true);
      setErrorMsg("");
    } catch (err) {
      console.error("Resume upload/parsing error:", err);
      const msg =
        err.response?.data?.message ||
        "Failed to read and parse this PDF. You can paste your resume text manually below.";
      setPdfError(msg);
      setPdfFile(null);
      setPdfFileName("");
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePdfUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemovePdf = () => {
    setPdfFile(null);
    setPdfFileName("");
    setResumeText("");
    setPdfUploadSuccess(false);
    setPdfError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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

    if (interviewType === "Resume" && (!resumeText || resumeText.trim().length < 20)) {
      setErrorMsg("Please upload your PDF resume so the AI can tailor questions strictly to your experience.");
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
          className="relative w-full max-w-3xl bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-100 my-8 max-h-[90vh] flex flex-col"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition"
          >
            <FaTimes size={18} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6 shrink-0">
            <div className="bg-black text-white p-2.5 rounded-xl shadow-sm">
              <FaRobot size={22} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Setup Your AI Mock Interview
              </h2>
              <p className="text-xs md:text-sm text-gray-500">
                Configure your interview format, upload your resume, or select your interviewer
              </p>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-3 gap-3 mb-6 shrink-0">
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
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-md"
                  : "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800"
              }`}
            >
              <FaFilePdf size={16} />
              <span className="font-semibold">Resume-Based</span>
            </button>
          </div>

          {/* Scrollable Form Body */}
          <div className="space-y-5 overflow-y-auto pr-1 flex-1">
            {/* Resume Upload Section (Prominently featured when Resume mode is active) */}
            {interviewType === "Resume" && (
              <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-white to-gray-50 border-2 border-emerald-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                      <FaFilePdf size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">
                        Upload Your PDF Resume
                      </h4>
                      <p className="text-xs text-gray-500">
                        Questions will be asked <strong className="text-emerald-700">exclusively</strong> from your uploaded projects & experience
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dropzone / Upload Area */}
                {!pdfUploadSuccess ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition flex flex-col items-center justify-center ${
                      isDragOver
                        ? "border-emerald-500 bg-emerald-100/50 scale-[1.01]"
                        : "border-gray-300 hover:border-emerald-400 bg-white"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handlePdfUpload(e.target.files[0]);
                        }
                      }}
                    />

                    {isUploadingPdf ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-semibold text-emerald-800">
                          Extracting resume content & projects...
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 shadow-sm">
                          <FaCloudUploadAlt size={24} />
                        </div>
                        <p className="text-sm font-semibold text-gray-800">
                          Click to browse or drag & drop your Resume PDF
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Supported format: PDF up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  /* Success Upload Card */
                  <div className="bg-white rounded-2xl border border-emerald-300 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <FaFilePdf size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900 truncate max-w-xs md:max-w-sm">
                              {pdfFileName}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <FaCheck size={10} /> Ready
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {pdfPageCount} Page{pdfPageCount > 1 ? "s" : ""} • ~{resumeText.length} characters parsed
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowPreviewText(!showPreviewText)}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition"
                          title="Preview parsed text"
                        >
                          {showPreviewText ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                          <span>{showPreviewText ? "Hide" : "Preview"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRemovePdf}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Remove PDF"
                        >
                          <FaTrashAlt size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Preview Text Box */}
                    {showPreviewText && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">
                          Extracted Resume Content (Editable):
                        </label>
                        <textarea
                          rows={4}
                          value={resumeText}
                          onChange={(e) => setResumeText(e.target.value)}
                          className="w-full text-xs font-mono p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-800"
                        />
                      </div>
                    )}
                  </div>
                )}

                {pdfError && (
                  <div className="mt-2 text-xs text-red-600 flex items-center gap-1.5">
                    <FaExclamationTriangle size={12} />
                    <span>{pdfError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Job Role Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                Target Role / Domain
              </label>
              <input
                type="text"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="e.g. Full Stack Developer, Data Engineer, Python Backend..."
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
            <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100 shrink-0">
              {errorMsg}
            </div>
          )}

          {/* Footer actions */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
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
                disabled={loading || isUploadingPdf}
                onClick={handleStart}
                className="flex-1 sm:flex-none px-7 py-3 rounded-2xl bg-black text-white text-sm font-semibold shadow-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
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
