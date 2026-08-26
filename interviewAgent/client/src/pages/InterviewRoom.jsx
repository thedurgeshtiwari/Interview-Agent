import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaVolumeUp,
  FaArrowRight,
  FaCheck,
  FaClock,
  FaExclamationTriangle,
  FaRobot,
  FaUser,
  FaRedo,
} from "react-icons/fa";
import { IoSparkles } from "react-icons/io5";
import axios from "axios";
import { ServerUrl } from "../App";

// Video avatars
import femaleAiVideo from "../assets/Videos/female-ai.mp4";
import maleAiVideo from "../assets/Videos/male-ai.mp4";

const InterviewRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showExitModal, setShowExitModal] = useState(false);

  // Media states
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);

  // Timer
  const [elapsedTime, setElapsedTime] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const aiVideoRef = useRef(null);

  // Fetch Interview on Mount
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${ServerUrl}/api/interview/${id}`, {
          withCredentials: true,
        });
        setInterview(res.data);
        if (res.data.status === "completed") {
          navigate(`/feedback/${id}`);
        }
      } catch (err) {
        console.error("Failed to load interview:", err);
        setErrorMsg("Failed to load interview session. Please return to Home.");
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [id, navigate]);

  // Overall Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // WebRTC User Camera
  useEffect(() => {
    const enableCamera = async () => {
      try {
        if (cameraActive) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } else {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
          }
        }
      } catch (err) {
        console.warn("Webcam access error or denied:", err);
        setCameraActive(false);
      }
    };

    enableCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive]);

  // Web Speech Recognition (Speech-to-Text)
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + " ";
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Text-to-Speech (AI asks question)
  const speakQuestion = (text) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = interview?.avatar === "male" ? 0.9 : 1.1;

    utterance.onstart = () => {
      setIsAiSpeaking(true);
      if (aiVideoRef.current) {
        aiVideoRef.current.play().catch(() => {});
      }
    };

    utterance.onend = () => {
      setIsAiSpeaking(false);
      // Automatically start listening for response if mic enabled
      startSpeechRecognition();
    };

    utterance.onerror = () => {
      setIsAiSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Speak whenever current question changes
  useEffect(() => {
    if (interview?.questions && interview.questions[currentIndex]) {
      const currentQ = interview.questions[currentIndex];
      setTranscript(currentQ.userTranscript || "");
      speakQuestion(currentQ.question);
    }
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentIndex, interview]);

  // Speech controls
  const startSpeechRecognition = () => {
    if (recognitionRef.current && !isRecording && micActive) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.warn("Recognition already active:", e);
      }
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  // Submit Answer for Current Question
  const handleSubmitAnswer = async () => {
    if (!interview) return;
    stopSpeechRecognition();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    try {
      setSubmitting(true);
      const currentQ = interview.questions[currentIndex];

      // Save answer in backend
      await axios.post(
        `${ServerUrl}/api/interview/${id}/answer`,
        {
          questionId: currentQ.id,
          transcript: transcript || "No spoken answer provided.",
        },
        { withCredentials: true }
      );

      const nextIndex = currentIndex + 1;
      if (nextIndex < interview.questions.length) {
        setCurrentIndex(nextIndex);
      } else {
        // All questions finished! Trigger final evaluation
        await handleFinishInterview();
      }
    } catch (err) {
      console.error("Submit answer error:", err);
      setErrorMsg("Failed to submit answer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Finish Interview
  const handleFinishInterview = async () => {
    try {
      setSubmitting(true);
      stopSpeechRecognition();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      await axios.post(
        `${ServerUrl}/api/interview/${id}/finish`,
        {},
        { withCredentials: true }
      );

      navigate(`/feedback/${id}`);
    } catch (err) {
      console.error("Finish interview error:", err);
      setErrorMsg("Failed to complete interview evaluation.");
    } finally {
      setSubmitting(false);
    }
  };

  // Format Elapsed Time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <h2 className="text-xl font-bold">Initializing Live Interview Stage...</h2>
        <p className="text-xs text-gray-400">Loading AI avatar and role questions</p>
      </div>
    );
  }

  const currentQuestion = interview?.questions?.[currentIndex];
  const progressPercent = interview?.questions?.length
    ? Math.round(((currentIndex + 1) / interview.questions.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Top Session Bar */}
      <header className="px-4 py-3 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 flex items-center justify-between z-30">
        {/* Left: Role Info */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-xl border border-emerald-500/30">
            <FaRobot size={18} />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-gray-100 flex items-center gap-2">
              <span>{interview?.jobRole}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 font-normal">
                {interview?.interviewType} Round
              </span>
            </h1>
            <p className="text-xs text-gray-400">
              Target: {interview?.targetCompany} • {interview?.experienceLevel}
            </p>
          </div>
        </div>

        {/* Center: Progress & Timer */}
        <div className="hidden sm:flex items-center gap-6">
          {/* Question Counter */}
          <div className="flex items-center gap-2 bg-gray-800/80 px-3.5 py-1.5 rounded-full border border-gray-700">
            <span className="text-xs font-semibold text-gray-300">
              Question {currentIndex + 1} of {interview?.questions?.length}
            </span>
            <div className="w-16 bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2 text-xs font-mono bg-gray-800/80 px-3.5 py-1.5 rounded-full border border-gray-700 text-gray-300">
            <FaClock size={12} className="text-emerald-400" />
            <span>{formatTime(elapsedTime)}</span>
          </div>
        </div>

        {/* Right: End Session Button */}
        <div>
          <button
            onClick={() => setShowExitModal(true)}
            className="px-3.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 rounded-full text-xs font-bold transition"
          >
            End Interview
          </button>
        </div>
      </header>

      {/* Main Dual Stage Area */}
      <main className="flex-1 p-3 md:p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: AI Interviewer Stage (7 cols on lg) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-gray-900 border border-gray-800 shadow-2xl aspect-4/3 flex items-center justify-center">
            {/* AI Video Avatar */}
            <video
              ref={aiVideoRef}
              src={interview?.avatar === "male" ? maleAiVideo : femaleAiVideo}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Speaking Status Overlay Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isAiSpeaking ? "bg-emerald-400 animate-ping" : "bg-amber-400"
                }`}
              />
              <span className="text-xs font-semibold text-gray-200">
                {isAiSpeaking ? "AI Speaking..." : "AI Listening"}
              </span>
            </div>

            {/* Avatar Tag */}
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-xs text-gray-300 font-medium">
              Interviewer:{" "}
              <strong className="text-white">
                {interview?.avatar === "male" ? "Alex" : "Sophia"}
              </strong>
            </div>

            {/* Replay Audio Button */}
            <button
              onClick={() => speakQuestion(currentQuestion?.question)}
              title="Replay question audio"
              className="absolute bottom-4 right-4 p-3 rounded-2xl bg-black/70 hover:bg-black text-white backdrop-blur-md border border-white/20 shadow-lg transition"
            >
              <FaVolumeUp size={16} />
            </button>
          </div>

          {/* Question Text Box */}
          <div className="bg-gray-900/90 rounded-3xl p-5 border border-gray-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-500/20">
                {currentQuestion?.category || "Core Competency"}
              </span>
              <span className="text-xs text-gray-400">
                Question {currentIndex + 1} of {interview?.questions?.length}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-100 leading-snug">
              {currentQuestion?.question}
            </h2>
          </div>
        </div>

        {/* Right Column: Candidate Webcam & Real-Time Answer Stage (6 cols on lg) */}
        <div className="lg:col-span-6 space-y-4">
          {/* User Webcam Preview */}
          <div className="relative rounded-3xl overflow-hidden bg-gray-900 border border-gray-800 shadow-2xl aspect-16/9 flex items-center justify-center">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <FaUser size={42} />
                <span className="text-xs">Camera is Off</span>
              </div>
            )}

            {/* Candidate Controls Overlay */}
            <div className="absolute bottom-3 left-3 flex gap-2">
              <button
                onClick={() => setCameraActive(!cameraActive)}
                className={`p-2.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition ${
                  cameraActive
                    ? "bg-gray-900/80 text-white border-white/20 hover:bg-gray-800"
                    : "bg-red-500/80 text-white border-red-400"
                }`}
              >
                {cameraActive ? <FaVideo size={14} /> : <FaVideoSlash size={14} />}
              </button>

              <button
                onClick={() => setMicActive(!micActive)}
                className={`p-2.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition ${
                  micActive
                    ? "bg-gray-900/80 text-white border-white/20 hover:bg-gray-800"
                    : "bg-red-500/80 text-white border-red-400"
                }`}
              >
                {micActive ? <FaMicrophone size={14} /> : <FaMicrophoneSlash size={14} />}
              </button>
            </div>

            {/* Live Recording Ring Indicator */}
            {isRecording && (
              <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-600/90 text-white text-xs px-3 py-1 rounded-full border border-red-400/50 shadow-md">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>Recording Speech...</span>
              </div>
            )}
          </div>

          {/* Real-time Spoken Transcript & Editable Input */}
          <div className="bg-gray-900/90 rounded-3xl p-5 border border-gray-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <FaMicrophone size={12} className={isRecording ? "text-red-400 animate-pulse" : "text-gray-400"} />
                <span>Your Verbal Response</span>
              </label>

              <button
                onClick={() => setTranscript("")}
                className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1"
              >
                <FaRedo size={10} />
                <span>Clear</span>
              </button>
            </div>

            <textarea
              rows={4}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Speak using your microphone or type your answer here in detail..."
              className="w-full bg-gray-950 text-gray-100 text-sm p-4 rounded-2xl border border-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 leading-relaxed resize-none"
            />

            {/* Mic Toggle and Submit Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={toggleRecording}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                  isRecording
                    ? "bg-red-500 text-white border-red-400 pulse-record"
                    : "bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-700"
                }`}
              >
                {isRecording ? (
                  <>
                    <FaMicrophoneSlash size={13} />
                    <span>Stop Recording</span>
                  </>
                ) : (
                  <>
                    <FaMicrophone size={13} className="text-emerald-400" />
                    <span>Start Voice Recording</span>
                  </>
                )}
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={submitting}
                onClick={handleSubmitAnswer}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Response...</span>
                  </>
                ) : currentIndex + 1 === interview?.questions?.length ? (
                  <>
                    <FaCheck size={13} />
                    <span>Submit & Finish Interview</span>
                  </>
                ) : (
                  <>
                    <span>Submit Answer & Next</span>
                    <FaArrowRight size={12} />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </main>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-900 border border-gray-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
                <FaExclamationTriangle size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-100">End Mock Interview?</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                You can generate your scorecard now based on questions answered so far, or exit back to dashboard.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition"
                >
                  Continue
                </button>
                <button
                  onClick={handleFinishInterview}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition shadow-md"
                >
                  Generate Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InterviewRoom;
