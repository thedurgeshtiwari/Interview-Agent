import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  FaHistory,
  FaRobot,
  FaArrowRight,
  FaCalendarAlt,
  FaTrophy,
  FaPlus,
  FaSearch,
  FaFilter,
  FaCheckCircle,
} from "react-icons/fa";
import { BsCoin } from "react-icons/bs";
import axios from "axios";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import InterviewSetupModal from "../components/InterviewSetupModal";
import AuthModal from "../components/AuthModal";
import { ServerUrl } from "../App";

const History = () => {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [historyRes, statsRes] = await Promise.all([
          axios.get(`${ServerUrl}/api/interview/history`, { withCredentials: true }),
          axios.get(`${ServerUrl}/api/user/stats`, { withCredentials: true }),
        ]);
        setInterviews(historyRes.data.interviews || []);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [userData]);

  const filteredInterviews = interviews.filter((item) => {
    const matchesFilter =
      filterType === "ALL" || item.interviewType?.toUpperCase() === filterType;
    const matchesSearch =
      item.jobRole?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.targetCompany?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f6f7fb] flex flex-col selection:bg-black selection:text-white">
      <Navbar onStartInterview={() => setSetupModalOpen(true)} />

      <main className="max-w-6xl mx-auto w-full px-4 py-8 md:py-12 space-y-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-full mb-2 shadow-xs">
              <FaHistory size={12} />
              <span>Performance Tracker</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-950 tracking-tight">
              Interview History & Progress
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Review your previous mock sessions, track score improvements, and study model answers.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (!userData) setAuthModalOpen(true);
              else setSetupModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white text-xs font-bold py-3 px-6 rounded-2xl shadow-lg transition"
          >
            <FaPlus size={12} />
            <span>New Mock Interview</span>
          </motion.button>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Sessions
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-gray-950">
              {stats?.totalInterviews || interviews.length}
            </h3>
            <p className="text-[11px] text-gray-500">Practice rounds taken</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Average Score
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-emerald-600">
              {stats?.avgScore || 0}%
            </h3>
            <p className="text-[11px] text-gray-500">Overall proficiency rating</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Highest Score
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-blue-600">
              {stats?.highestScore || 0}%
            </h3>
            <p className="text-[11px] text-gray-500">Peak performance mark</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Credit Balance
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-amber-600 flex items-center gap-1.5">
              <BsCoin size={24} className="text-amber-500" />
              <span>{userData?.credits ?? 0}</span>
            </h3>
            <p className="text-[11px] text-gray-500">Available credits</p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="glass-card rounded-3xl p-4 border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {["ALL", "TECHNICAL", "HR", "RESUME"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  filterType === type
                    ? "bg-black text-white shadow-sm"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {type === "ALL" ? "All Tracks" : type}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input
              type="text"
              placeholder="Search by role or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        {/* Interview List / Cards */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-500 font-medium">Loading session history...</p>
          </div>
        ) : filteredInterviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredInterviews.map((item) => {
              const isCompleted = item.status === "completed";
              const score = item.overallScore || 0;
              return (
                <motion.div
                  key={item._id}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {item.interviewType} Round
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <FaCalendarAlt size={11} />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-950 leading-snug">
                        {item.jobRole}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {item.experienceLevel} • Target: {item.targetCompany || "General"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <div className="text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200/60">
                        Interviewer: <strong className="text-gray-900">{item.avatar === "male" ? "Alex" : "Sophia"}</strong>
                      </div>
                      <div className="text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200/60">
                        Questions: <strong className="text-gray-900">{item.questions?.length || 5}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      {isCompleted ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-extrabold text-gray-900">{score}%</span>
                          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Completed
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                          In Progress
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        isCompleted
                          ? navigate(`/feedback/${item._id}`)
                          : navigate(`/interview/${item._id}`)
                      }
                      className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                    >
                      <span>{isCompleted ? "View Scorecard" : "Resume Session"}</span>
                      <FaArrowRight size={10} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 border border-gray-200 text-center space-y-4 max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center mx-auto">
              <FaRobot size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Interview Sessions Yet</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Launch your first AI mock interview session to get evaluated across technical and behavioral benchmarks.
            </p>
            <button
              onClick={() => {
                if (!userData) setAuthModalOpen(true);
                else setSetupModalOpen(true);
              }}
              className="px-6 py-3 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-2xl transition inline-flex items-center gap-2 shadow-md"
            >
              <FaPlus size={11} />
              <span>Start First Mock Interview</span>
            </button>
          </div>
        )}
      </main>

      <InterviewSetupModal
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default History;
