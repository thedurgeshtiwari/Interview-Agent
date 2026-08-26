import React from 'react'
import Navbar from '../components/Navbar'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FaRobot, FaMicrophone, FaChartLine, FaCheckCircle } from 'react-icons/fa'
import { IoSparkles } from 'react-icons/io5'

const Home = () => {
  const navigate = useNavigate()
  const { userData } = useSelector((state) => state.user)

  const handleCTA = () => {
    if (userData) {
      navigate('/dashboard')
    } else {
      navigate('/auth')
    }
  }

  return (
    <div className='min-h-screen bg-[#f3f3f3] flex flex-col font-sans text-black'>
      <Navbar />

      {/* Hero Section */}
      <div className='flex-1 flex flex-col items-center justify-center px-6 py-20 text-center max-w-4xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className='bg-black text-white px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 mb-6'
        >
          <IoSparkles size={12} className="text-yellow-400" />
          Next-Gen AI Interview Simulator
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className='text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6'
        >
          Master Your Next Job Interview with <span className='bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent'>InterviewIQ.AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className='text-gray-600 text-lg md:text-xl max-w-2xl leading-relaxed mb-10'
        >
          Conduct role-specific mock interviews with an advanced AI agent. Speak or type your answers, and receive detailed scorecards, itemized feedback, and suggested model answers.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <button
            onClick={handleCTA}
            className='bg-black text-white hover:bg-gray-900 font-semibold px-8 py-4 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1'
          >
            {userData ? 'Go to Dashboard' : 'Get Started for Free'}
          </button>
        </motion.div>

        {/* Feature Highlights */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full text-left'>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className='bg-white p-8 rounded-3xl border border-gray-200 shadow-sm'
          >
            <div className='bg-emerald-100 text-emerald-600 p-3.5 rounded-2xl w-fit mb-6'>
              <FaRobot size={22} />
            </div>
            <h3 className='text-xl font-bold mb-3'>AI Question Generation</h3>
            <p className='text-gray-600 leading-relaxed text-sm'>
              Dynamic questions crafted specifically for your target role, description, and experience level using Gemini 1.5.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className='bg-white p-8 rounded-3xl border border-gray-200 shadow-sm'
          >
            <div className='bg-blue-100 text-blue-600 p-3.5 rounded-2xl w-fit mb-6'>
              <FaMicrophone size={22} />
            </div>
            <h3 className='text-xl font-bold mb-3'>Speech-To-Text</h3>
            <p className='text-gray-600 leading-relaxed text-sm'>
              Answer via voice using built-in high-accuracy speech transcription. Simulate the pressure of a real call.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className='bg-white p-8 rounded-3xl border border-gray-200 shadow-sm'
          >
            <div className='bg-purple-100 text-purple-600 p-3.5 rounded-2xl w-fit mb-6'>
              <FaChartLine size={22} />
            </div>
            <h3 className='text-xl font-bold mb-3'>Granular Analytics</h3>
            <p className='text-gray-600 leading-relaxed text-sm'>
              Get immediate scoring, strengths, key weaknesses, and ideal example responses for every question you answer.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Home
