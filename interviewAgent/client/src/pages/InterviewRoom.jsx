import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ServerUrl } from '../App'
import Navbar from '../components/Navbar'
import { motion, AnimatePresence } from 'motion/react'
import { FaMicrophone, FaMicrophoneSlash, FaPaperPlane, FaArrowRight, FaArrowLeft, FaClock, FaLightbulb } from 'react-icons/fa'
import { IoSparkles } from 'react-icons/io5'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'

const InterviewRoom = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [interview, setInterview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({}) // { questionId: answerText }
  const [submittingAnswer, setSubmittingAnswer] = useState(false)

  // Speech Recognition states
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)

  // Timer state
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes per question
  const timerIntervalRef = useRef(null)

  // Evaluation states
  const [evaluating, setEvaluating] = useState(false)

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const res = await axios.get(`${ServerUrl}/api/interview/${id}`, { withCredentials: true })
        setInterview(res.data)

        // Initialize answers state from DB if resume
        const initialAnswers = {}
        let firstUnansweredIdx = 0
        let foundUnanswered = false

        res.data.questions.forEach((q, idx) => {
          initialAnswers[q._id] = q.userAnswer || ''
          if (!q.userAnswer && !foundUnanswered) {
            firstUnansweredIdx = idx
            foundUnanswered = true
          }
        });

        setAnswers(initialAnswers)
        // If the interview is already completed, go straight to feedback page
        if (res.data.status === 'completed') {
          navigate(`/feedback/${id}`, { replace: true })
          return
        }

        // Navigate to the first unanswered question
        setCurrentIdx(firstUnansweredIdx)
      } catch (err) {
        console.error('Failed to fetch interview details:', err)
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchInterview()
  }, [id, navigate])

  // Timer logic
  useEffect(() => {
    if (loading || evaluating) return

    setTimeLeft(180) // reset timer for new question

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [currentIdx, loading, evaluating])

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = true
      rec.interimResults = false
      rec.lang = 'en-US'

      rec.onstart = () => {
        setIsListening(true)
      }

      rec.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript
        const currentQId = interview.questions[currentIdx]._id
        setAnswers((prev) => ({
          ...prev,
          [currentQId]: (prev[currentQId] ? prev[currentQId] + ' ' : '') + transcript.trim()
        }))
      }

      rec.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      rec.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = rec
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [interview, currentIdx])

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. Please try Google Chrome or Edge.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }

  const handleTextChange = (e) => {
    const currentQId = interview.questions[currentIdx]._id
    setAnswers({
      ...answers,
      [currentQId]: e.target.value
    })
  }

  const saveCurrentAnswer = async () => {
    const currentQ = interview.questions[currentIdx]
    const currentAnswer = answers[currentQ._id] || ''
    
    // Stop recording if listening
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
    }

    setSubmittingAnswer(true)
    try {
      await axios.post(
        `${ServerUrl}/api/interview/${id}/answer`,
        { questionId: currentQ._id, userAnswer: currentAnswer },
        { withCredentials: true }
      )
    } catch (err) {
      console.error('Failed to save answer:', err)
    } finally {
      setSubmittingAnswer(false)
    }
  }

  const handleNext = async () => {
    await saveCurrentAnswer()
    if (currentIdx < interview.questions.length - 1) {
      setCurrentIdx(currentIdx + 1)
    }
  }

  const handlePrev = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
    }
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1)
    }
  }

  const handleSubmitInterview = async () => {
    await saveCurrentAnswer()
    setEvaluating(true)
    try {
      await axios.post(`${ServerUrl}/api/interview/${id}/evaluate`, {}, { withCredentials: true })
      navigate(`/feedback/${id}`, { replace: true })
    } catch (err) {
      console.error('Evaluation failed:', err)
      alert('Evaluation failed. Please try submitting again.')
      setEvaluating(false)
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-[#f3f3f3] flex flex-col items-center justify-center'>
        <AiOutlineLoading3Quarters className='animate-spin text-black' size={40} />
        <p className='mt-4 text-gray-600 font-medium'>Loading Interview Room...</p>
      </div>
    )
  }

  const currentQuestion = interview.questions[currentIdx]
  const currentAnswerText = answers[currentQuestion._id] || ''
  const progressPercent = ((currentIdx + 1) / interview.questions.length) * 100

  // Format timeLeft (seconds) to mm:ss
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div className='min-h-screen bg-[#f3f3f3] flex flex-col font-sans text-black relative'>
      <Navbar />

      {/* Evaluating Overlay Screen */}
      <AnimatePresence>
        {evaluating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center'
          >
            <div className='max-w-md flex flex-col items-center gap-6'>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className='text-emerald-500'
              >
                <IoSparkles size={48} />
              </motion.div>
              <h2 className='text-2xl font-bold'>Evaluating Your Answers</h2>
              <p className='text-gray-500 text-sm leading-relaxed'>
                Our AI hiring agent is scoring your responses, outlining key strengths, noting improvements, and crafting ideal example answers. This will take about 10-15 seconds...
              </p>
              <div className='w-48 bg-gray-100 h-2 rounded-full overflow-hidden mt-2'>
                <div className='bg-emerald-500 h-full animate-[loading-bar_8s_ease-out_infinite]' style={{ width: '100%' }}></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className='flex-1 max-w-4xl w-full mx-auto px-6 py-10 flex flex-col gap-6'>
        
        {/* Progress Bar & Header */}
        <div className='flex flex-col gap-2'>
          <div className='flex justify-between items-center text-sm font-semibold text-gray-500'>
            <span>Question {currentIdx + 1} of {interview.questions.length}</span>
            <span className='flex items-center gap-1.5 text-gray-700 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm'>
              <FaClock size={12} className={timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-gray-400'} />
              <span className={timeLeft < 30 ? 'text-red-600 font-bold' : ''}>{formatTime(timeLeft)}</span>
            </span>
          </div>
          <div className='w-full bg-gray-200 h-2 rounded-full overflow-hidden'>
            <div className='bg-black h-full transition-all duration-300' style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        {/* Question Panel */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className='bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col gap-6 min-h-[380px] justify-between'
          >
            <div>
              <div className='bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-bold w-fit mb-4'>
                {interview.role} ({interview.experience} Level)
              </div>
              <h3 className='text-xl md:text-2xl font-bold leading-snug'>
                {currentQuestion.question}
              </h3>
            </div>

            {/* Answer Input Panel */}
            <div className='flex flex-col gap-3 mt-4'>
              <div className='flex justify-between items-center'>
                <span className='text-xs font-semibold text-gray-400'>Your Answer</span>
                <span className='text-xs text-gray-400'>{currentAnswerText.length} characters</span>
              </div>
              
              <div className='relative'>
                <textarea
                  value={currentAnswerText}
                  onChange={handleTextChange}
                  rows={6}
                  placeholder="Type your response here, or click the microphone to speak your answer..."
                  className='w-full border border-gray-200 rounded-2xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-black transition text-sm resize-none'
                />
                
                {/* Speech To Text Button inside Textarea */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`absolute right-4 bottom-4 p-3 rounded-full shadow transition-all duration-200 cursor-pointer ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                  title={isListening ? 'Stop recording' : 'Record answer'}
                >
                  {isListening ? <FaMicrophoneSlash size={16} /> : <FaMicrophone size={16} />}
                </button>
              </div>

              {isListening && (
                <div className='text-xs text-red-500 font-semibold flex items-center gap-1.5 animate-pulse ml-2'>
                  <span className='w-2 h-2 rounded-full bg-red-500'></span>
                  Listening... start speaking now.
                </div>
              )}
            </div>

            {/* Hint / Tips Callout */}
            <div className='bg-blue-50 text-blue-800 text-xs p-4 rounded-2xl border border-blue-200 flex gap-2.5 items-start'>
              <FaLightbulb size={16} className='text-blue-500 flex-shrink-0 mt-0.5' />
              <div>
                <strong>Interviewer Tip:</strong> Structure your answer using the <strong>STAR</strong> method (Situation, Task, Action, Result) for behavioral questions, and explain your technical thought process clearly.
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Action Controls */}
        <div className='flex justify-between items-center gap-4'>
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className='flex items-center gap-2 border border-gray-300 hover:bg-white text-sm font-semibold px-6 py-3 rounded-xl transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
          >
            <FaArrowLeft size={12} />
            Back
          </button>

          {currentIdx < interview.questions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={submittingAnswer}
              className='flex items-center gap-2 bg-black text-white hover:bg-gray-900 text-sm font-semibold px-6 py-3 rounded-xl transition cursor-pointer disabled:bg-gray-400'
            >
              {submittingAnswer ? 'Saving...' : 'Next Question'}
              <FaArrowRight size={12} />
            </button>
          ) : (
            <button
              onClick={handleSubmitInterview}
              disabled={submittingAnswer}
              className='flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-semibold px-6 py-3 rounded-xl transition cursor-pointer shadow-md disabled:bg-gray-400'
            >
              Finish & Evaluate
              <FaPaperPlane size={12} />
            </button>
          )}
        </div>

      </main>
    </div>
  )
}

export default InterviewRoom
