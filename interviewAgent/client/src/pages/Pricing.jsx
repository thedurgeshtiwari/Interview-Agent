import React, { useState } from "react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import {
  FaCoins,
  FaCheck,
  FaCreditCard,
  FaShieldAlt,
  FaBolt,
  FaStar,
} from "react-icons/fa";
import { IoSparkles } from "react-icons/io5";
import { BsCoin } from "react-icons/bs";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import Navbar from "../components/Navbar";
import AuthModal from "../components/AuthModal";
import { ServerUrl } from "../App";

// Asset import
import creditAsset from "../assets/credit.png";

const PRICING_TIERS = [
  {
    id: "starter",
    name: "Starter Booster",
    credits: 50,
    price: "$9",
    tagline: "Great for quick brush-ups",
    features: [
      "50 Credits (~2.5 Full Mock Sessions)",
      "Technical & HR Track Access",
      "Real-time Speech Recognition",
      "Instant AI Scorecards & Tips",
    ],
    popular: false,
    buttonText: "Get 50 Credits",
  },
  {
    id: "pro",
    name: "Pro Interviewer",
    credits: 200,
    price: "$24",
    tagline: "Most popular for active job seekers",
    features: [
      "200 Credits (10 Full Mock Sessions)",
      "All Tracks: Tech, HR & Resume-Specific",
      "Both Male & Female AI Avatars",
      "Unlimited PDF Scorecard Exports",
      "Detailed Question-by-Question Coaching",
    ],
    popular: true,
    buttonText: "Claim 200 Credits",
  },
  {
    id: "master",
    name: "Placement Master",
    credits: 600,
    price: "$49",
    tagline: "Comprehensive career mastery",
    features: [
      "600 Credits (30 Mock Sessions)",
      "Priority AI Evaluation Processing",
      "Deep Resume Gap Analysis",
      "Lifetime Session History Access",
      "VIP Support & Early Features",
    ],
    popular: false,
    buttonText: "Unlock 600 Credits",
  },
];

const Pricing = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  const [loadingTier, setLoadingTier] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handlePurchase = async (tier) => {
    if (!userData) {
      setAuthModalOpen(true);
      return;
    }

    try {
      setLoadingTier(tier.id);
      setSuccessMsg("");

      const response = await axios.post(
        `${ServerUrl}/api/user/add-credits`,
        { amount: tier.credits },
        { withCredentials: true }
      );

      // Update Redux state
      dispatch(
        setUserData({
          ...userData,
          credits: response.data.credits,
        })
      );

      setSuccessMsg(`Successfully added ${tier.credits} credits to your account!`);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error("Credit purchase error:", err);
      setSuccessMsg("Failed to top up credits. Please try again.");
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] flex flex-col selection:bg-black selection:text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto w-full px-4 py-10 md:py-16 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-full shadow-xs">
            <BsCoin size={14} className="text-amber-500" />
            <span>Pay As You Go Credits</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-950 tracking-tight">
            Simple, Transparent Credit Packs
          </h1>

          <p className="text-sm md:text-base text-gray-600">
            Each full mock interview session with interactive AI video avatars costs 20 credits. No monthly subscriptions, no expiry.
          </p>

          {/* Current Balance Banner */}
          <div className="inline-flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-gray-200 shadow-sm mt-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Your Current Balance:
            </span>
            <span className="text-base font-extrabold text-emerald-600 flex items-center gap-1.5">
              <BsCoin size={18} className="text-amber-500" />
              <span>{userData?.credits ?? 0} Credits</span>
            </span>
          </div>
        </div>

        {successMsg && (
          <div className="max-w-md mx-auto p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-center text-xs font-bold shadow-sm">
            {successMsg}
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PRICING_TIERS.map((tier) => {
            const isPopular = tier.popular;
            const isLoading = loadingTier === tier.id;
            return (
              <motion.div
                key={tier.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition shadow-sm ${
                  isPopular
                    ? "bg-gray-950 text-white border-2 border-emerald-500 shadow-2xl shadow-emerald-500/10"
                    : "bg-white text-gray-900 border border-gray-200 hover:border-gray-300 hover:shadow-lg"
                }`}
              >
                {/* Popular Pill */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <IoSparkles size={11} />
                    <span>Best Value Choice</span>
                  </div>
                )}

                <div>
                  {/* Title & Tagline */}
                  <div className="space-y-1 mb-4">
                    <h3 className="text-xl font-bold">{tier.name}</h3>
                    <p className={`text-xs ${isPopular ? "text-gray-400" : "text-gray-500"}`}>
                      {tier.tagline}
                    </p>
                  </div>

                  {/* Price & Credits */}
                  <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-gray-100/10">
                    <span className="text-4xl font-extrabold tracking-tight">
                      {tier.price}
                    </span>
                    <span className={`text-xs font-bold ${isPopular ? "text-emerald-400" : "text-emerald-600"}`}>
                      / {tier.credits} Credits
                    </span>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs leading-relaxed">
                        <div
                          className={`mt-0.5 p-1 rounded-full ${
                            isPopular
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          <FaCheck size={9} />
                        </div>
                        <span className={isPopular ? "text-gray-300" : "text-gray-600"}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Purchase Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  onClick={() => handlePurchase(tier)}
                  className={`w-full py-3.5 rounded-2xl text-xs font-extrabold transition shadow-md flex items-center justify-center gap-2 ${
                    isPopular
                      ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20"
                      : "bg-black hover:bg-gray-800 text-white"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <FaCreditCard size={12} />
                      <span>{tier.buttonText}</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-200 max-w-4xl mx-auto space-y-6">
          <h3 className="text-xl font-bold text-gray-950 text-center">
            Frequently Asked Questions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-gray-900">How many credits per interview?</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Each mock interview session with AI avatar questions, voice analysis, and full PDF report costs 20 credits.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-gray-900">Do my credits expire?</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                No, purchased credits never expire and stay in your account forever until you use them.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-gray-900">Can I customize the questions?</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Yes! You can specify your target job role, seniority level, target company, and paste your resume for targeted practice.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-gray-900">Can I download my report as a PDF?</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Yes, every completed session allows 1-click PDF download with your complete transcript, model answers, and coaching notes.
              </p>
            </div>
          </div>
        </div>
      </main>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default Pricing;
