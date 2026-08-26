import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { ServerUrl } from '../App'
import { setUserData } from '../redux/userSlice'
import Navbar from '../components/Navbar'
import { motion, AnimatePresence } from 'motion/react'
import { FaCheck, FaArrowLeft, FaCoins } from 'react-icons/fa'
import { IoSparkles } from 'react-icons/io5'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'

const Pricing = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { userData } = useSelector((state) => state.user)

  const [loadingPlan, setLoadingPlan] = useState(null) // plan index being purchased
  const [showSuccess, setShowSuccess] = useState(false)
  const [creditsAdded, setCreditsAdded] = useState(0)

  const plans = [
    {
      name: 'Starter Package',
      credits: 50,
      price: '$5',
      description: 'Ideal for a quick warm-up before a screening interview.',
      features: [
        '5 mock interviews (10 credits/each)',
        'Standard Gemini AI question generation',
        'Speech-to-text voice answers',
        'Granular feedback scoreboard'
      ]
    },
    {
      name: 'Pro Package',
      credits: 200,
      price: '$15',
      description: 'Best for candidates undergoing active interview rounds.',
      features: [
        '20 mock interviews (10 credits/each)',
        'Priority Gemini AI response grading',
        'Speech-to-text voice answers',
        'Comprehensive interview history log',
        'AI recommended model answers'
      ],
      popular: true
    },
    {
      name: 'Interview Ace',
      credits: 500,
      price: '$30',
      description: 'Designed for deep practice and high-volume mock runs.',
      features: [
        '50 mock interviews (10 credits/each)',
        'Priority Gemini AI response grading',
        'Speech-to-text voice answers',
        'Comprehensive interview history log',
        'AI recommended model answers',
        'VIP access to new features'
      ]
    }
  ]

  const handlePurchase = async (planCredits, index) => {
    setLoadingPlan(index)
    try {
      const response = await axios.post(
        `${ServerUrl}/api/user/add-credits`,
        { credits: planCredits },
        { withCredentials: true }
      )

      // Update Redux state with new credits
      dispatch(setUserData(response.data))

      setCreditsAdded(planCredits)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 4000)
    } catch (err) {
      console.error('Failed to purchase credits:', err)
      alert('Mock payment processing failed. Please try again.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className='min-h-screen bg-[#f3f3f3] flex flex-col font-sans text-black relative'>
      <Navbar />

      {/* Success Notification Alert */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className='fixed top-24 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-xl z-50 flex items-center gap-3 border border-emerald-500 font-semibold text-sm'
          >
            <IoSparkles className="text-yellow-300" />
            <span>Success! <strong>+{creditsAdded} Credits</strong> have been added to your balance.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className='flex-1 max-w-6xl w-full mx-auto px-6 py-10 flex flex-col items-center gap-8'>
        
        {/* Header */}
        <div className='text-center max-w-2xl flex flex-col items-center gap-3'>
          <button
            onClick={() => navigate('/dashboard')}
            className='flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold px-4 py-2 rounded-full cursor-pointer transition mb-2 shadow-sm'
          >
            <FaArrowLeft size={10} />
            Back to Dashboard
          </button>

          <h2 className='text-3xl md:text-4xl font-extrabold tracking-tight'>
            Top Up Your Credits
          </h2>
          <p className='text-gray-500 text-sm md:text-base leading-relaxed'>
            Each mock interview costs 10 credits. Purchase a package to generate custom job-specific questions and unlock detailed AI scoring analyses.
          </p>
        </div>

        {/* Balance Status */}
        <div className='bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 text-sm font-semibold'>
          <div className='bg-yellow-100 text-yellow-600 p-2.5 rounded-xl'>
            <FaCoins size={18} />
          </div>
          <div>
            <p className='text-gray-400 text-xs font-medium'>Current Balance</p>
            <span className='text-lg font-bold text-black'>{userData?.credits ?? 0} Credits</span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-6 items-start'>
          {plans.map((plan, index) => (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={plan.name}
              className={`bg-white rounded-3xl p-8 border shadow-sm flex flex-col justify-between min-h-[480px] relative ${
                plan.popular ? 'border-black ring-2 ring-black' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <span className='absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-black text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border border-black shadow'>
                  Most Popular
                </span>
              )}

              <div className='flex flex-col gap-4'>
                <div>
                  <h3 className='font-extrabold text-lg'>{plan.name}</h3>
                  <p className='text-gray-400 text-xs mt-1.5 leading-relaxed'>{plan.description}</p>
                </div>

                <div className='flex items-baseline gap-1 my-3'>
                  <span className='text-4xl font-black'>{plan.price}</span>
                  <span className='text-gray-400 text-sm font-medium'>/ {plan.credits} Credits</span>
                </div>

                <div className='w-full border-t border-gray-100 my-2'></div>

                <ul className='flex flex-col gap-3.5 text-xs text-gray-600 font-medium'>
                  {plan.features.map((feature) => (
                    <li key={feature} className='flex items-start gap-2.5 leading-tight'>
                      <FaCheck size={10} className='text-emerald-500 mt-0.5 flex-shrink-0' />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handlePurchase(plan.credits, index)}
                disabled={loadingPlan !== null}
                className={`w-full font-semibold text-sm py-3.5 rounded-xl mt-8 transition flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  plan.popular
                    ? 'bg-black text-white hover:bg-gray-900'
                    : 'border border-gray-300 bg-white hover:bg-gray-50 text-black'
                } disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`}
              >
                {loadingPlan === index ? (
                  <>
                    <AiOutlineLoading3Quarters className='animate-spin' size={16} />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    Purchase Package
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

      </main>
    </div>
  )
}

export default Pricing
