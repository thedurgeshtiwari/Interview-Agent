import React, { useState } from "react";
import { motion } from "motion/react";
import {
  FaRobot,
  FaPlay,
  FaMicrophone,
  FaFilePdf,
  FaChartLine,
  FaArrowRight,
  FaCheckCircle,
  FaShieldAlt,
  FaStar,
  FaUserGraduate,
  FaRegLightbulb,
} from "react-icons/fa";
import { IoSparkles } from "react-icons/io5";
import { BsLightningChargeFill } from "react-icons/bs";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import InterviewSetupModal from "../components/InterviewSetupModal";
import AuthModal from "../components/AuthModal";

// Asset imports
import techImg from "../assets/tech.png";
import hrImg from "../assets/HR.png";
import resumeImg from "../assets/resume.png";
import confiImg from "../assets/confi.png";
import aiAnsImg from "../assets/ai-ans.png";
import pdfImg from "../assets/pdf.png";
import historyImg from "../assets/history.png";
import femaleAiVideo from "../assets/Videos/female-ai.mp4";
import maleAiVideo from "../assets/Videos/male-ai.mp4";

const Home = () => {
  const { userData } = useSelector((state) => state.user);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState("Technical");
  const [activeAvatarPreview, setActiveAvatarPreview] = useState("female");

  const handleOpenSetup = (mode = "Technical") => {
    setSelectedMode(mode);
    if (!userData) {
      setAuthModalOpen(true);
    } else {
      setSetupModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] flex flex-col selection:bg-black selection:text-white">
      {/* Top Navigation */}
      <Navbar onStartInterview={() => handleOpenSetup("Technical")} />

      {/* Hero Section */}
      <section className="relative px-4 pt-10 pb-20 md:pt-16 md:pb-28 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-xs">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Next-Gen AI Interview Prep
                </span>
                <IoSparkles className="text-emerald-500" size={14} />
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-950 tracking-tight leading-[1.12]">
                Master Your Next Interview with{" "}
                <span className="bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Real-Time AI Avatars
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl leading-relaxed">
                Practice realistic Technical, Behavioral, and Resume-tailored interviews with interactive video avatars. Get instant verbal scoring, model ideal answers, and pinpoint improvement tips.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleOpenSetup("Technical")}
                  className="w-full sm:w-auto px-8 py-4 bg-black text-white text-sm md:text-base font-bold rounded-2xl shadow-xl hover:bg-gray-800 transition flex items-center justify-center gap-3"
                >
                  <BsLightningChargeFill className="text-amber-400" size={18} />
                  <span>Start Mock Interview Free</span>
                  <FaArrowRight size={13} />
                </motion.button>

                <div className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-gray-500">
                  <FaCheckCircle className="text-emerald-500" size={15} />
                  <span>200 Free Credits Included</span>
                </div>
              </div>

              {/* Key Trust Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200/80">
                <div>
                  <h4 className="text-2xl font-extrabold text-gray-900">50K+</h4>
                  <p className="text-xs text-gray-500 font-medium">Questions Evaluated</p>
                </div>
                <div>
                  <h4 className="text-2xl font-extrabold text-gray-900">94%</h4>
                  <p className="text-xs text-gray-500 font-medium">Interview Pass Rate</p>
                </div>
                <div>
                  <h4 className="text-2xl font-extrabold text-gray-900">4.9/5</h4>
                  <p className="text-xs text-gray-500 font-medium">Candidate Rating</p>
                </div>
              </div>
            </motion.div>

            {/* Right Video / Avatar Interactive Stage */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden glass-card p-4 shadow-2xl border-2 border-white">
                {/* Avatar Video Preview */}
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-gray-950 shadow-inner">
                  <video
                    key={activeAvatarPreview}
                    src={activeAvatarPreview === "female" ? femaleAiVideo : maleAiVideo}
                    muted
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />

                  {/* Top Live Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-white text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>AI Interviewer Live</span>
                  </div>

                  {/* Avatar Switcher */}
                  <div className="absolute top-3 right-3 flex gap-1.5 bg-black/70 backdrop-blur-md p-1 rounded-full border border-white/20">
                    <button
                      onClick={() => setActiveAvatarPreview("female")}
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium transition ${
                        activeAvatarPreview === "female"
                          ? "bg-white text-black font-bold"
                          : "text-white/80 hover:text-white"
                      }`}
                    >
                      Sophia
                    </button>
                    <button
                      onClick={() => setActiveAvatarPreview("male")}
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium transition ${
                        activeAvatarPreview === "male"
                          ? "bg-white text-black font-bold"
                          : "text-white/80 hover:text-white"
                      }`}
                    >
                      Alex
                    </button>
                  </div>

                  {/* Speech Simulation Wave */}
                  <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="w-1 h-3 bg-emerald-400 rounded-full soundwave-bar" />
                      <span className="w-1 h-5 bg-emerald-400 rounded-full soundwave-bar" />
                      <span className="w-1 h-2 bg-emerald-400 rounded-full soundwave-bar" />
                      <span className="w-1 h-4 bg-emerald-400 rounded-full soundwave-bar" />
                    </div>
                    <p className="text-xs text-white/90 truncate font-medium">
                      "Could you explain how you design scalable backend architectures?"
                    </p>
                  </div>
                </div>

                {/* Quick Info Bar */}
                <div className="mt-4 flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <FaMicrophone size={13} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Speech Recognition</p>
                      <p className="text-[11px] text-gray-500">Real-time voice & video</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenSetup("Technical")}
                    className="text-xs font-bold text-black hover:underline flex items-center gap-1"
                  >
                    <span>Test Now</span>
                    <FaArrowRight size={10} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Practice Modes Section */}
      <section className="px-4 py-16 bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded-full">
              <span>Tailored Practice Modes</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-950 tracking-tight">
              Choose Your Interview Track
            </h2>
            <p className="text-sm md:text-base text-gray-500">
              Select the mode that matches your upcoming round, customize your role and seniority, and practice under real pressure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Technical Track */}
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="rounded-3xl border border-gray-200 bg-[#fafafa] p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-gray-300 transition"
            >
              <div>
                <div className="w-full h-44 rounded-2xl overflow-hidden bg-white border border-gray-100 mb-6 flex items-center justify-center p-4">
                  <img
                    src={techImg}
                    alt="Technical Interview"
                    className="max-h-full object-contain"
                  />
                </div>
                <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full mb-3">
                  Technical Round
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Technical & Coding Concepts
                </h3>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed mb-6">
                  Deep-dive questions covering algorithms, full-stack frameworks, database design, optimization, and system design patterns.
                </p>
              </div>

              <button
                onClick={() => handleOpenSetup("Technical")}
                className="w-full py-3 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Start Technical Round</span>
                <FaArrowRight size={11} />
              </button>
            </motion.div>

            {/* HR & Behavioral Track */}
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="rounded-3xl border border-gray-200 bg-[#fafafa] p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-gray-300 transition"
            >
              <div>
                <div className="w-full h-44 rounded-2xl overflow-hidden bg-white border border-gray-100 mb-6 flex items-center justify-center p-4">
                  <img
                    src={hrImg}
                    alt="HR & Behavioral Interview"
                    className="max-h-full object-contain"
                  />
                </div>
                <div className="inline-block px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full mb-3">
                  HR & Culture Fit
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Behavioral & Leadership
                </h3>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed mb-6">
                  Master STAR method responses, conflict resolution, situational judgment, deadline pressure, and culture alignment.
                </p>
              </div>

              <button
                onClick={() => handleOpenSetup("HR")}
                className="w-full py-3 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Start HR Round</span>
                <FaArrowRight size={11} />
              </button>
            </motion.div>

            {/* Resume Track */}
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="rounded-3xl border border-gray-200 bg-[#fafafa] p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-gray-300 transition"
            >
              <div>
                <div className="w-full h-44 rounded-2xl overflow-hidden bg-white border border-gray-100 mb-6 flex items-center justify-center p-4">
                  <img
                    src={resumeImg}
                    alt="Resume Based Interview"
                    className="max-h-full object-contain"
                  />
                </div>
                <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full mb-3">
                  Resume-Specific
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Project & Experience Drill
                </h3>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed mb-6">
                  AI dynamically analyzes your resume experience and challenges you on architectural decisions, leadership, and metrics.
                </p>
              </div>

              <button
                onClick={() => handleOpenSetup("Resume")}
                className="w-full py-3 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Start Resume Drill</span>
                <FaArrowRight size={11} />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive Grid */}
      <section className="px-4 py-20 bg-[#f6f7fb]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white border border-gray-200 text-gray-800 text-xs font-bold rounded-full shadow-xs">
              <IoSparkles className="text-emerald-500" size={13} />
              <span>Full Analytics Suite</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-950 tracking-tight">
              Why Candidates Accelerate Faster with InterviewIQ
            </h2>
            <p className="text-sm md:text-base text-gray-500">
              State-of-the-art feedback mechanisms designed to bridge the gap between practice and landing top-tier offers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1: AI Model Answers */}
            <div className="glass-card rounded-3xl p-8 border border-white flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-1/2 flex items-center justify-center">
                <img
                  src={aiAnsImg}
                  alt="AI Ideal Answers"
                  className="max-h-48 object-contain drop-shadow-md"
                />
              </div>
              <div className="w-full md:w-1/2 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center">
                  <FaRegLightbulb size={18} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Instant Ideal Model Answers
                </h3>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                  Compare your spoken response side-by-side with high-scoring sample answers crafted for senior hiring standards.
                </p>
              </div>
            </div>

            {/* Feature 2: Confidence & Tone Scoring */}
            <div className="glass-card rounded-3xl p-8 border border-white flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-1/2 flex items-center justify-center">
                <img
                  src={confiImg}
                  alt="Confidence & Tone Scoring"
                  className="max-h-48 object-contain drop-shadow-md"
                />
              </div>
              <div className="w-full md:w-1/2 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center">
                  <FaChartLine size={18} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Tone, Clarity & Confidence
                </h3>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                  Objective grading across 4 dimensions: Technical Accuracy, Communication Clarity, Delivery Confidence, and Problem Solving.
                </p>
              </div>
            </div>

            {/* Feature 3: Downloadable PDF Reports */}
            <div className="glass-card rounded-3xl p-8 border border-white flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-1/2 flex items-center justify-center">
                <img
                  src={pdfImg}
                  alt="Downloadable PDF Reports"
                  className="max-h-48 object-contain drop-shadow-md"
                />
              </div>
              <div className="w-full md:w-1/2 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center">
                  <FaFilePdf size={18} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Exportable PDF Scorecards
                </h3>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                  Generate polished, printable evaluation summaries to review your weaknesses and study right before the actual interview.
                </p>
              </div>
            </div>

            {/* Feature 4: Interview History Tracking */}
            <div className="glass-card rounded-3xl p-8 border border-white flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-1/2 flex items-center justify-center">
                <img
                  src={historyImg}
                  alt="Performance Tracking"
                  className="max-h-48 object-contain drop-shadow-md"
                />
              </div>
              <div className="w-full md:w-1/2 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center">
                  <FaUserGraduate size={18} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Progressive History & Stats
                </h3>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                  Track your score progression across multiple attempts and witness your interview readiness improve session by session.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-20 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-950 tracking-tight">
              How InterviewIQ Works in 3 Steps
            </h2>
            <p className="text-sm md:text-base text-gray-500">
              Simple, intuitive, and designed to replicate real video interview platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#fafafa] border border-gray-200 rounded-3xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-black text-white text-base font-bold flex items-center justify-center mx-auto shadow-md">
                1
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Configure Target Role & Avatar
              </h3>
              <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
                Choose your job title, experience level, and select between our male or female AI avatar interviewers.
              </p>
            </div>

            <div className="bg-[#fafafa] border border-gray-200 rounded-3xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-black text-white text-base font-bold flex items-center justify-center mx-auto shadow-md">
                2
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Speak Live with Speech-to-Text
              </h3>
              <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
                Listen to the AI ask questions via voice and video. Deliver your answers verbally using your microphone.
              </p>
            </div>

            <div className="bg-[#fafafa] border border-gray-200 rounded-3xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-black text-white text-base font-bold flex items-center justify-center mx-auto shadow-md">
                3
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Unlock Comprehensive Scorecard
              </h3>
              <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
                Get an instant performance grade, strengths/weaknesses breakdown, ideal answer scripts, and PDF report.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="px-4 py-16 bg-[#f6f7fb]">
        <div className="max-w-5xl mx-auto glass-dark rounded-3xl p-8 md:p-14 text-white text-center shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Land Your Dream Offer?
            </h2>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              Join thousands of engineers and candidates preparing with InterviewIQ's realistic AI interviewers.
            </p>
            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleOpenSetup("Technical")}
                className="px-9 py-4 bg-white text-black font-bold text-sm md:text-base rounded-2xl shadow-xl hover:bg-gray-100 transition inline-flex items-center gap-2"
              >
                <span>Launch Practice Session</span>
                <FaArrowRight size={13} />
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-gray-200 px-4 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="bg-black text-white p-1.5 rounded-lg">
              <FaRobot size={14} />
            </div>
            <span className="font-bold text-gray-900 text-sm">InterviewIQ.AI</span>
          </div>
          <p>© 2026 InterviewIQ.AI. All rights reserved.</p>
          <div className="flex gap-6">
            <button onClick={() => handleOpenSetup("Technical")} className="hover:text-black">Technical</button>
            <button onClick={() => handleOpenSetup("HR")} className="hover:text-black">HR Round</button>
            <button onClick={() => handleOpenSetup("Resume")} className="hover:text-black">Resume Round</button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <InterviewSetupModal
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
        initialType={selectedMode}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
};

export default Home;
