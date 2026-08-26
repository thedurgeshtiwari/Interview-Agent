import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaFilePdf,
  FaRedo,
  FaHistory,
  FaTrophy,
  FaChartBar,
  FaLightbulb,
  FaChevronDown,
  FaChevronUp,
  FaRobot,
  FaArrowLeft,
  FaStar,
} from "react-icons/fa";
import { IoSparkles } from "react-icons/io5";
import axios from "axios";
import Navbar from "../components/Navbar";
import { ServerUrl } from "../App";

const FeedbackReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [expandedQuestion, setExpandedQuestion] = useState(0);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${ServerUrl}/api/interview/${id}`, {
          withCredentials: true,
        });
        setInterview(res.data);

        // Confetti celebration if score is good!
        if ((res.data.overallScore || 0) >= 60) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } catch (err) {
        console.error("Failed to load feedback report:", err);
        setErrorMsg("Failed to load interview report.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handlePrintPdf = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7fb] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
        <h2 className="text-xl font-bold text-gray-900">Compiling Detailed Scorecard...</h2>
        <p className="text-xs text-gray-500">Evaluating answers and computing metrics</p>
      </div>
    );
  }

  if (errorMsg || !interview) {
    return (
      <div className="min-h-screen bg-[#f6f7fb] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md text-center space-y-4 border border-gray-200">
          <FaExclamationCircle className="text-red-500 mx-auto" size={40} />
          <h2 className="text-xl font-bold text-gray-900">Scorecard Not Found</h2>
          <p className="text-xs text-gray-500">{errorMsg || "Could not retrieve the interview session."}</p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-black text-white rounded-xl text-xs font-bold shadow-md"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const score = interview.overallScore || 70;
  const feedback = interview.feedback || {};
  const techScore = feedback.technicalScore || score;
  const commScore = feedback.communicationScore || score;
  const confScore = feedback.confidenceScore || score;

  const getScoreVerdict = (s) => {
    if (s >= 85) return { label: "Exceptional • High Offer Readiness", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
    if (s >= 70) return { label: "Proficient • Strong Performance", color: "text-blue-600 bg-blue-50 border-blue-200" };
    return { label: "Developing • Target Key Areas", color: "text-amber-600 bg-amber-50 border-amber-200" };
  };

  const verdict = getScoreVerdict(score);

  return (
    <div className="min-h-screen bg-[#f6f7fb] flex flex-col selection:bg-black selection:text-white">
      {/* Top Navbar (hidden in print) */}
      <div className="no-print">
        <Navbar />
      </div>

      <main className="max-w-6xl mx-auto w-full px-4 py-8 md:py-12 space-y-8">
        {/* Navigation back and Action row (no print) */}
        <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => navigate("/history")}
            className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-black transition"
          >
            <FaArrowLeft size={12} />
            <span>Back to Interview History</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePrintPdf}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 text-xs font-bold py-2.5 px-5 rounded-2xl shadow-xs transition"
            >
              <FaFilePdf size={14} className="text-red-500" />
              <span>Download PDF Scorecard</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white text-xs font-bold py-2.5 px-5 rounded-2xl shadow-md transition"
            >
              <FaRedo size={12} />
              <span>Practice Another Round</span>
            </motion.button>
          </div>
        </div>

        {/* Printable Scorecard Banner */}
        <div className="glass-card rounded-3xl p-6 md:p-10 border border-gray-200 shadow-xl space-y-8">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full mb-3">
                <FaRobot size={12} />
                <span>AI Mock Interview Evaluation</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-gray-950 tracking-tight">
                {interview.jobRole} Performance Report
              </h1>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                {interview.interviewType} Track • {interview.experienceLevel} • Target: {interview.targetCompany}
              </p>
            </div>

            {/* Verdict Badge */}
            <div className={`px-4 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-xs ${verdict.color}`}>
              <FaTrophy size={14} />
              <span>{verdict.label}</span>
            </div>
          </div>

          {/* Core Score Section (Gauge & Dimension Bars) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Overall Circular Score Badge */}
            <div className="lg:col-span-4 bg-linear-to-b from-gray-900 to-black text-white p-8 rounded-3xl text-center space-y-4 shadow-xl flex flex-col items-center justify-center">
              <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                Overall Rating
              </span>
              <div className="relative flex items-center justify-center">
                <div className="w-36 h-36 rounded-full border-8 border-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 bg-gray-950">
                  <span className="text-5xl font-black text-white tracking-tighter">
                    {score}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-300 max-w-[200px] leading-relaxed">
                Based on technical accuracy, structure, and verbal delivery.
              </p>
            </div>

            {/* 3 Metric Breakdown Bars */}
            <div className="lg:col-span-8 space-y-5">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FaChartBar size={15} className="text-gray-700" />
                <span>Performance Breakdown</span>
              </h3>

              {/* Technical Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>Technical Accuracy & Depth</span>
                  <span>{techScore}%</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden border border-gray-200">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${techScore}%` }}
                  />
                </div>
              </div>

              {/* Communication Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>Communication Clarity & Conciseness</span>
                  <span>{commScore}%</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden border border-gray-200">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${commScore}%` }}
                  />
                </div>
              </div>

              {/* Confidence & Structure Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>Confidence, Tone & Structure</span>
                  <span>{confScore}%</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden border border-gray-200">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${confScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI Executive Summary */}
          {feedback.summary && (
            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 space-y-2">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <IoSparkles className="text-emerald-500" size={16} />
                <span>AI Interviewer Assessment</span>
              </h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                {feedback.summary}
              </p>
            </div>
          )}

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 space-y-3">
              <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <FaCheckCircle className="text-emerald-600" size={16} />
                <span>Key Strengths</span>
              </h4>
              <ul className="space-y-2">
                {feedback.strengths?.length > 0 ? (
                  feedback.strengths.map((str, idx) => (
                    <li key={idx} className="text-xs md:text-sm text-emerald-950 flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-gray-500">Good attempt with steady delivery.</li>
                )}
              </ul>
            </div>

            {/* Improvement Areas */}
            <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-6 space-y-3">
              <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <FaExclamationCircle className="text-amber-600" size={16} />
                <span>Areas to Polish</span>
              </h4>
              <ul className="space-y-2">
                {feedback.weaknesses?.length > 0 ? (
                  feedback.weaknesses.map((wk, idx) => (
                    <li key={idx} className="text-xs md:text-sm text-amber-950 flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{wk}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-gray-500">Continue adding concrete metrics to your answers.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Actionable Recommendations */}
          {feedback.suggestions?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-3 shadow-xs">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <FaLightbulb className="text-amber-500" size={16} />
                <span>Actionable Recommendations Before Your Real Interview</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {feedback.suggestions.map((sug, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 space-y-1">
                    <span className="text-[11px] font-bold text-gray-400 uppercase">Tip #{idx + 1}</span>
                    <p className="text-xs text-gray-700 leading-relaxed">{sug}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Question-by-Question Deep Dive */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-950">
              Question-by-Question Analysis
            </h3>
            <p className="text-xs text-gray-500">
              Review what you said alongside the AI recommended model answer and critique.
            </p>

            <div className="space-y-3 pt-2">
              {interview.questions?.map((q, idx) => {
                const isOpen = expandedQuestion === idx;
                return (
                  <div
                    key={q.id || idx}
                    className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-xs transition"
                  >
                    {/* Accordion Header */}
                    <button
                      type="button"
                      onClick={() => setExpandedQuestion(isOpen ? -1 : idx)}
                      className="w-full p-4 md:p-5 flex items-center justify-between text-left hover:bg-gray-50/80 transition"
                    >
                      <div className="space-y-1 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                            Q{idx + 1} • {q.category || "General"}
                          </span>
                          {q.score > 0 && (
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Score: {q.score}%
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm md:text-base font-semibold text-gray-900 leading-snug">
                          {q.question}
                        </h4>
                      </div>
                      <div className="text-gray-400">
                        {isOpen ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                      </div>
                    </button>

                    {/* Accordion Content */}
                    {isOpen && (
                      <div className="p-4 md:p-5 pt-0 border-t border-gray-100 bg-gray-50/50 space-y-4">
                        {/* User Answer */}
                        <div className="space-y-1.5">
                          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Your Transcript:
                          </span>
                          <div className="p-3.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-800 leading-relaxed font-mono">
                            {q.userTranscript || "No answer recorded."}
                          </div>
                        </div>

                        {/* Model Ideal Answer */}
                        {q.sampleAnswer && (
                          <div className="space-y-1.5">
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                              <IoSparkles size={12} />
                              <span>Model Ideal Answer:</span>
                            </span>
                            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950 leading-relaxed">
                              {q.sampleAnswer}
                            </div>
                          </div>
                        )}

                        {/* AI Feedback */}
                        {q.feedback && (
                          <div className="space-y-1.5">
                            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                              AI Coaching Note:
                            </span>
                            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-950 leading-relaxed">
                              {q.feedback}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FeedbackReport;
