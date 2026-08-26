import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "motion/react";
import { BsRobot, BsCoin } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut, FaHistory, FaPlus, FaCreditCard } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { setUserData } from "../redux/userSlice";
import { ServerUrl } from "../App";
import AuthModal from "./AuthModal";

const Navbar = ({ onStartInterview }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.get(ServerUrl + "/api/auth/logout", {
        withCredentials: true,
      });
      dispatch(setUserData(null));
      setShowCreditPopup(false);
      setShowUserPopup(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      dispatch(setUserData(null));
      navigate("/");
    }
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "History", path: "/history" },
    { label: "Pricing", path: "/pricing" },
  ];

  return (
    <>
      <div className="w-full flex justify-center px-4 pt-4 md:pt-6 sticky top-0 z-40">
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-6xl glass-card rounded-3xl px-5 md:px-8 py-3.5 flex justify-between items-center relative shadow-lg shadow-black/5"
        >
          {/* Brand Logo */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="bg-black text-white p-2.5 rounded-xl shadow-md group-hover:scale-105 transition">
              <BsRobot size={19} />
            </div>
            <div>
              <span className="font-extrabold text-lg md:text-xl tracking-tight text-gray-900">
                InterviewIQ<span className="text-emerald-500">.AI</span>
              </span>
            </div>
          </div>

          {/* Navigation Center Links */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100/80 p-1.5 rounded-full border border-gray-200/60">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                    isActive
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3 md:gap-4 relative">
            {/* Quick Start Button */}
            {onStartInterview && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onStartInterview}
                className="hidden lg:flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-xs font-semibold py-2 px-4 rounded-full shadow-sm transition"
              >
                <FaPlus size={10} />
                <span>Start Practice</span>
              </motion.button>
            )}

            {/* Credits Counter Pill */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowCreditPopup(!showCreditPopup);
                  setShowUserPopup(false);
                }}
                className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-amber-800 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-xs"
              >
                <BsCoin size={15} className="text-amber-500" />
                <span>{userData?.credits ?? 0}</span>
                <span className="hidden sm:inline text-amber-600 font-normal">Credits</span>
              </button>

              <AnimatePresence>
                {showCreditPopup && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-64 bg-white shadow-2xl border border-gray-100 rounded-2xl p-5 z-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Credit Balance
                      </span>
                      <span className="text-base font-bold text-gray-900">
                        {userData?.credits ?? 0}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                      Each full mock interview with AI video avatars costs 20 credits.
                    </p>
                    <button
                      onClick={() => {
                        setShowCreditPopup(false);
                        navigate("/pricing");
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white py-2.5 rounded-xl text-xs font-semibold transition"
                    >
                      <FaCreditCard size={12} />
                      <span>Buy More Credits</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Dropdown / Login Button */}
            {userData ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowUserPopup(!showUserPopup);
                    setShowCreditPopup(false);
                  }}
                  className="w-9 h-9 bg-linear-to-tr from-gray-900 to-gray-700 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md hover:ring-2 hover:ring-black/20 transition"
                >
                  {userData.name ? userData.name.charAt(0).toUpperCase() : <FaUserAstronaut size={14} />}
                </button>

                <AnimatePresence>
                  {showUserPopup && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 bg-white shadow-2xl border border-gray-100 rounded-2xl p-4 z-50"
                    >
                      <div className="pb-3 border-b border-gray-100 mb-2">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {userData.name || "Candidate"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{userData.email}</p>
                      </div>

                      <button
                        onClick={() => {
                          setShowUserPopup(false);
                          navigate("/history");
                        }}
                        className="w-full text-left text-xs font-medium py-2 px-2 hover:bg-gray-50 rounded-lg text-gray-700 flex items-center gap-2.5 transition"
                      >
                        <FaHistory size={13} className="text-gray-400" />
                        <span>Interview History</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserPopup(false);
                          navigate("/pricing");
                        }}
                        className="w-full text-left text-xs font-medium py-2 px-2 hover:bg-gray-50 rounded-lg text-gray-700 flex items-center gap-2.5 transition"
                      >
                        <FaCreditCard size={13} className="text-gray-400" />
                        <span>Credit Store</span>
                      </button>

                      <div className="pt-2 border-t border-gray-100 mt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left text-xs font-semibold py-2 px-2 hover:bg-red-50 text-red-600 rounded-lg flex items-center gap-2 transition"
                        >
                          <HiOutlineLogout size={15} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-black hover:bg-gray-800 text-white text-xs font-semibold py-2 px-4 rounded-full shadow-sm transition"
              >
                Sign In
              </button>
            )}
          </div>
        </motion.div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default Navbar;
