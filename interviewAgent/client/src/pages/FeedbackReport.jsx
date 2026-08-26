import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ServerUrl } from '../App'
import Navbar from '../components/Navbar'
import { motion } from 'motion/react'
import { FaChevronDown, FaChevronUp, FaCheckCircle, FaStar, FaInfoCircle, FaArrowLeft, FaAward } from 'react-icons/fa'
import { IoSparkles } from 'react-icons/io5'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'

const FeedbackReport = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [interview, setInterview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [openAccordions, setOpenAccordions] = useState({}) // { questionId: boolean }

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await axios.get(`${ServerUrl}/api/interview/${id}`, { withCredentials: true })
        if (res.data.status !== 'completed') {
          navigate(`/interview/${id}`, { replace: true })
          return
        }
        setInterview(res.data)

        // Open the first accordion by default
        if (res.data.questions?.length > 0) {
          setOpenAccordions({ [res.data.questions[0]._id]: true })
        }
      } catch (err) {
        console.error('Failed to fetch feedback details:', err)
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchFeedback()
  }, [id, navigate])

  const toggleAccordion = (qId) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }))
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-[#f3f3f3] flex flex-col items-center justify-center'>
        <AiOutlineLoading3Quarters className='animate-spin text-black' size={40} />
        <p className='mt-4 text-gray-600 font-medium'>Fetching Scorecard...</p>
      </div>
    )
  }

  // Helper color logic based on score
  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getScoreBadgeColor = (score) => {
    if (score >= 8) return 'bg-green-600 text-white'
    if (score >= 6) return 'bg-yellow-500 text-white'
    return 'bg-red-500 text-white'
  }

  return (
    <div className='min-h-screen bg-[#f3f3f3] flex flex-col font-sans text-black'>
      <Navbar />

      <main className='flex-1 max-w-4xl w-full mx-auto px-6 py-10 flex flex-col gap-8'>
        
        {/* Scorecard Hero Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-white rounded-3xl p-8 border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8 items-center relative overflow-hidden'
        >
          {/* Background subtle sparkles */}
          <div className='absolute right-0 top-0 text-gray-50/60 p-4 select-none pointer-events-none'>
            <IoSparkles size={120} />
          </div>

          <div className='md:col-span-2 flex flex-col gap-3 relative z-10'>
            <div className='bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold w-fit'>
              Mock Interview Results
            </div>
            <h2 className='text-2xl md:text-3xl font-extrabold leading-tight'>
              {interview.role}
            </h2>
            <p className='text-gray-500 text-sm'>
              Experience level: <span className="font-semibold text-gray-800">{interview.experience}</span> &bull; Taken on {new Date(interview.createdAt).toLocaleDateString()}
            </p>

            <button
              onClick={() => navigate('/dashboard')}
              className='mt-4 flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-black transition cursor-pointer border border-gray-200 hover:bg-gray-50 px-4 py-2.5 rounded-full w-fit'
            >
              <FaArrowLeft size={10} />
              Back to Dashboard
            </button>
          </div>

          {/* Big Score Widget */}
          <div className='flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border border-gray-100 relative z-10'>
            <FaAward className='text-yellow-500 mb-2' size={32} />
            <span className='text-gray-400 text-xs font-bold uppercase tracking-wider'>Overall Score</span>
            <div className='flex items-baseline gap-1 mt-1'>
              <span className='text-4xl font-extrabold text-black'>{interview.overallScore}</span>
              <span className='text-gray-400 font-medium'>/ 10</span>
            </div>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold mt-3 border ${getScoreColor(interview.overallScore)}`}>
              {interview.overallScore >= 8 ? 'Excellent' : interview.overallScore >= 6 ? 'Competent' : 'Needs Work'}
            </span>
          </div>
        </motion.div>

        {/* Synthesis & Feedback Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col gap-4'
        >
          <h3 className='font-bold text-lg flex items-center gap-2'>
            <IoSparkles className="text-yellow-500" />
            AI Overall Evaluation Summary
          </h3>
          <p className='text-gray-600 text-sm leading-relaxed whitespace-pre-line'>
            {interview.overallFeedback}
          </p>
        </motion.div>

        {/* Question Breakdown List */}
        <div className='flex flex-col gap-4'>
          <h3 className='font-bold text-lg flex items-center gap-2 px-2'>
            <FaInfoCircle className="text-gray-400" />
            Question-by-Question Breakdown
          </h3>

          <div className='flex flex-col gap-4'>
            {interview.questions.map((q, idx) => {
              const isOpen = !!openAccordions[q._id]
              return (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  key={q._id}
                  className='bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm'
                >
                  {/* Accordion Trigger */}
                  <button
                    onClick={() => toggleAccordion(q._id)}
                    className='w-full text-left p-6 flex justify-between items-center hover:bg-gray-50 transition cursor-pointer gap-4'
                  >
                    <div className='flex items-start gap-4'>
                      <span className='bg-black text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-0.5'>
                        {idx + 1}
                      </span>
                      <p className='font-bold text-sm md:text-base leading-snug pr-4'>
                        {q.question}
                      </p>
                    </div>

                    <div className='flex items-center gap-3 flex-shrink-0'>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${getScoreBadgeColor(q.score)}`}>
                        {q.score} / 10
                      </span>
                      {isOpen ? <FaChevronUp className="text-gray-400" size={14} /> : <FaChevronDown className="text-gray-400" size={14} />}
                    </div>
                  </button>

                  {/* Accordion Content */}
                  {isOpen && (
                    <div className='px-6 pb-6 pt-2 border-t border-gray-100 flex flex-col gap-5 bg-gray-50/50 text-sm'>
                      
                      {/* User Answer */}
                      <div className='flex flex-col gap-1.5'>
                        <span className='text-xs font-bold text-gray-400 uppercase tracking-wider'>Your Answer</span>
                        <div className='bg-white p-4 rounded-xl border border-gray-200 text-gray-700 leading-relaxed whitespace-pre-wrap'>
                          {q.userAnswer || <em className="text-gray-400">No answer submitted for this question.</em>}
                        </div>
                      </div>

                      {/* AI Critique */}
                      <div className='flex flex-col gap-1.5'>
                        <span className='text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1'>
                          <IoSparkles />
                          AI Feedback & Score critique
                        </span>
                        <div className='bg-emerald-50/40 p-4 rounded-xl border border-emerald-100/80 text-gray-700 leading-relaxed whitespace-pre-line'>
                          {q.feedback}
                        </div>
                      </div>

                      {/* Ideal/Model Answer */}
                      <div className='flex flex-col gap-1.5'>
                        <span className='text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1'>
                          <FaCheckCircle size={12} />
                          Recommended Ideal Answer
                        </span>
                        <div className='bg-blue-50/40 p-4 rounded-xl border border-blue-100/80 text-gray-700 leading-relaxed whitespace-pre-line'>
                          {q.idealAnswer}
                        </div>
                      </div>

                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

      </main>
    </div>
  )
}

export default FeedbackReport
