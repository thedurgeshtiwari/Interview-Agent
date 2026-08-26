import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ServerUrl } from '../App'
import Navbar from '../components/Navbar'
import { motion } from 'motion/react'
import { FaHistory, FaCalendarAlt, FaAward, FaExternalLinkAlt, FaArrowLeft, FaComments } from 'react-icons/fa'
import { AiOutlineLoading3Quarters as LoadingSpinner } from 'react-icons/ai'

const History = () => {
  const navigate = useNavigate()
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${ServerUrl}/api/interview/history`, { withCredentials: true })
        setInterviews(res.data)
      } catch (err) {
        console.error('Failed to fetch history:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  return (
    <div className='min-h-screen bg-[#f3f3f3] flex flex-col font-sans text-black'>
      <Navbar />

      <main className='flex-1 max-w-5xl w-full mx-auto px-6 py-10 flex flex-col gap-6'>
        
        {/* Header */}
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='bg-black text-white p-3 rounded-2xl'>
              <FaHistory size={20} />
            </div>
            <div>
              <h2 className='text-2xl font-bold'>Interview History</h2>
              <p className='text-gray-500 text-sm'>Review your past performances and monitor your progression.</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className='flex items-center gap-2 border border-gray-300 hover:bg-white text-xs font-semibold px-4 py-2.5 rounded-full w-fit cursor-pointer transition'
          >
            <FaArrowLeft size={10} />
            Back to Dashboard
          </button>
        </div>

        {/* History Grid List */}
        {loading ? (
          <div className='flex-1 flex items-center justify-center py-20'>
            <LoadingSpinner className='animate-spin text-black' size={40} />
          </div>
        ) : interviews.length === 0 ? (
          <div className='bg-white rounded-3xl p-10 border border-gray-200 text-center flex flex-col items-center justify-center gap-4 max-w-md mx-auto mt-10 shadow-sm'>
            <FaComments size={40} className="text-gray-300" />
            <h3 className='font-bold text-lg'>No Interviews Recorded</h3>
            <p className='text-sm text-gray-500 leading-relaxed'>
              You haven't completed any mock interviews yet. Head back to the dashboard to customize and start your first AI session.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className='bg-black text-white font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-gray-800 transition cursor-pointer'
            >
              Start Interview
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {interviews.map((interview, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={interview._id}
                className='bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between gap-5'
              >
                <div className='flex flex-col gap-2'>
                  <div className='flex justify-between items-start gap-2'>
                    <h3 className='font-bold text-lg leading-snug truncate' title={interview.role}>
                      {interview.role}
                    </h3>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold flex-shrink-0 ${
                      interview.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : interview.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {interview.status === 'completed' ? 'Completed' : 'In Progress'}
                    </span>
                  </div>

                  <div className='flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-gray-400 font-medium'>
                    <span className='flex items-center gap-1'>
                      <FaCalendarAlt size={10} />
                      {new Date(interview.createdAt).toLocaleDateString()}
                    </span>
                    <span>Level: <strong className='text-gray-600'>{interview.experience}</strong></span>
                    <span>{interview.numQuestions} Questions</span>
                  </div>
                </div>

                <div className='flex items-center justify-between border-t border-gray-50 pt-4'>
                  {interview.status === 'completed' ? (
                    <>
                      <div className='flex items-center gap-1.5'>
                        <FaAward size={16} className='text-yellow-500' />
                        <span className='text-sm text-gray-500'>Score:</span>
                        <strong className='text-base text-black font-extrabold'>{interview.overallScore}/10</strong>
                      </div>
                      
                      <button
                        onClick={() => navigate(`/feedback/${interview._id}`)}
                        className='bg-black text-white hover:bg-gray-800 text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm'
                      >
                        View Report
                        <FaExternalLinkAlt size={10} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className='text-xs text-gray-400 italic'>Session not finalized.</span>
                      <button
                        onClick={() => navigate(`/interview/${interview._id}`)}
                        className='bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm'
                      >
                        Resume Interview
                        <FaExternalLinkAlt size={10} />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </main>
    </div>
  )
}

export default History
