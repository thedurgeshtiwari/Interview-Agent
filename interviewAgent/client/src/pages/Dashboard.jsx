import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { setUserData } from '../redux/userSlice'
import { ServerUrl } from '../App'
import Navbar from '../components/Navbar'
import { motion } from 'motion/react'
import { FaPlus, FaBriefcase, FaGraduationCap, FaListOl, FaHistory, FaArrowRight, FaClock, FaFilePdf } from 'react-icons/fa'
import { IoSparkles } from 'react-icons/io5'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'

const Dashboard = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { userData } = useSelector((state) => state.user)

  // Form states
  const [role, setRole] = useState('')
  const [description, setDescription] = useState('')
  const [experience, setExperience] = useState('Entry')
  const [numQuestions, setNumQuestions] = useState(5)
  const [resumeFile, setResumeFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // History state
  const [recentInterviews, setRecentInterviews] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${ServerUrl}/api/interview/history`, { withCredentials: true })
        setRecentInterviews(res.data.slice(0, 5)) // show top 5 recent ones
      } catch (err) {
        console.error('Failed to fetch history:', err)
      } finally {
        setLoadingHistory(false)
      }
    }
    fetchHistory()
  }, [])

  const handleStartInterview = async (e) => {
    e.preventDefault()
    if (!role || !description || !experience) {
      setError('Please fill in all required fields.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('role', role)
      formData.append('description', description)
      formData.append('experience', experience)
      formData.append('numQuestions', Number(numQuestions))
      if (resumeFile) {
        formData.append('resume', resumeFile)
      }

      const response = await axios.post(
        `${ServerUrl}/api/interview/start`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      )

      // Update credits in Redux store
      dispatch(setUserData({
        ...userData,
        credits: response.data.credits
      }))

      // Navigate to the interview room
      navigate(`/interview/${response.data.interview._id}`)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to start interview. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-[#f3f3f3] flex flex-col font-sans text-black'>
      <Navbar />

      <main className='flex-1 max-w-6xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8'>
        
        {/* Left Column: Form to Start Interview */}
        <div className='lg:col-span-2 flex flex-col gap-6'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-white rounded-3xl p-8 border border-gray-200 shadow-sm'
          >
            <div className='flex items-center gap-3 mb-6'>
              <div className='bg-emerald-100 text-emerald-600 p-2.5 rounded-xl'>
                <FaPlus size={16} />
              </div>
              <h2 className='text-xl font-bold'>New Mock Interview</h2>
            </div>

            {error && (
              <div className='bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6 border border-red-200'>
                {error}
              </div>
            )}

            <form onSubmit={handleStartInterview} className='flex flex-col gap-5'>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2'>
                  <FaBriefcase size={14} className="text-gray-400" />
                  Target Job Role *
                </label>
                <input
                  type='text'
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder='e.g. Frontend Engineer, Product Manager'
                  className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition text-sm'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2'>
                  <FaGraduationCap size={14} className="text-gray-400" />
                  Experience Level *
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition text-sm bg-white'
                >
                  <option value='Entry'>Entry Level / Junior</option>
                  <option value='Mid'>Mid Level (2-5 years)</option>
                  <option value='Senior'>Senior Level (5+ years)</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2'>
                  <FaListOl size={14} className="text-gray-400" />
                  Number of Questions
                </label>
                <select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                  className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition text-sm bg-white'
                >
                  <option value={3}>3 Questions (Fast)</option>
                  <option value={5}>5 Questions (Standard)</option>
                  <option value={10}>10 Questions (Comprehensive)</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2'>
                  <FaFilePdf size={14} className="text-gray-400" />
                  Upload Resume (PDF - Optional)
                </label>
                <input
                  type='file'
                  accept='.pdf'
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition text-sm bg-white cursor-pointer file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200'
                />
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Job Description / Core Skills *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder='Paste the job description or enter key skills (e.g., React, Node, System Design, behavioral questions).'
                  className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition text-sm resize-none'
                  required
                />
              </div>

              <div className='bg-yellow-50 text-yellow-800 text-xs p-4 rounded-xl border border-yellow-200 flex items-center gap-2.5'>
                <IoSparkles size={16} className="text-yellow-600 flex-shrink-0" />
                <span>Starting this session will deduct <strong>10 credits</strong> from your account balance.</span>
              </div>

              <button
                type='submit'
                disabled={loading}
                className='w-full bg-black text-white py-3.5 rounded-xl font-semibold hover:bg-gray-900 transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed'
              >
                {loading ? (
                  <>
                    <AiOutlineLoading3Quarters className='animate-spin' size={18} />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    Start Mock Interview
                    <FaArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Right Column: History Quick List */}
        <div className='flex flex-col gap-6'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className='bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex-1 flex flex-col'
          >
            <div className='flex justify-between items-center mb-6'>
              <div className='flex items-center gap-2.5'>
                <FaHistory size={16} className="text-gray-500" />
                <h3 className='font-bold text-lg'>Recent Sessions</h3>
              </div>
              <button
                onClick={() => navigate('/history')}
                className='text-xs font-semibold hover:underline text-gray-500'
              >
                View All
              </button>
            </div>

            {loadingHistory ? (
              <div className='flex-1 flex items-center justify-center py-10'>
                <AiOutlineLoading3Quarters className='animate-spin text-gray-400' size={24} />
              </div>
            ) : recentInterviews.length === 0 ? (
              <div className='flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200'>
                <p className='text-sm text-gray-500 mb-2'>No sessions yet</p>
                <span className='text-xs text-gray-400'>Fill out the form to start your first AI interview.</span>
              </div>
            ) : (
              <div className='flex flex-col gap-4 overflow-y-auto max-h-[420px] pr-1'>
                {recentInterviews.map((interview) => (
                  <div
                    key={interview._id}
                    className='p-4 border border-gray-100 rounded-2xl hover:border-gray-200 transition bg-gray-50 flex flex-col gap-2'
                  >
                    <div className='flex justify-between items-start'>
                      <h4 className='font-bold text-sm truncate max-w-[140px]'>{interview.role}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        interview.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : interview.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {interview.status === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                    </div>

                    <div className='flex items-center gap-4 text-xs text-gray-400'>
                      <span className='flex items-center gap-1'>
                        <FaClock size={10} />
                        {new Date(interview.createdAt).toLocaleDateString()}
                      </span>
                      <span>{interview.numQuestions} Qs</span>
                      {interview.status === 'completed' && (
                        <span className="font-semibold text-emerald-600">Score: {interview.overallScore}/10</span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (interview.status === 'completed') {
                          navigate(`/feedback/${interview._id}`)
                        } else {
                          navigate(`/interview/${interview._id}`)
                        }
                      }}
                      className='mt-2 w-full border border-gray-200 hover:bg-white text-xs font-semibold py-2 rounded-xl transition cursor-pointer text-center'
                    >
                      {interview.status === 'completed' ? 'View Feedback' : 'Resume Interview'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

      </main>
    </div>
  )
}

export default Dashboard
