import React, { useEffect, useState } from 'react'
import { FaRobot } from "react-icons/fa";
import { IoSparkles } from "react-icons/io5";
import { motion } from "motion/react";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../utils/firebase';
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUserData } from '../redux/userSlice';

const ServerUrl = "http://localhost:8000";


const Auth = () => {

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { userData } = useSelector((state) => state.user)
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    useEffect(() => {
        if (userData) {
            navigate("/")
        }
    }, [userData, navigate])

    const handleGoogleAuth = async () => {
        if (loading) return
        try {
            setLoading(true)
            setErrorMessage("")
            const response = await signInWithPopup(auth, provider)
            let User = response.user
            let name = User.displayName
            let email = User.email
            const result = await axios.post(ServerUrl + "/api/auth/google", { name, email }, { withCredentials: true })
            dispatch(setUserData(result.data))
            navigate("/")
        } catch (error) {
            console.error("Google auth error:", error)
            dispatch(setUserData(null))
            const msg = error.response?.data?.message || error.message || "Authentication failed. Please check server and database connection."
            setErrorMessage(msg)
        } finally {
            setLoading(false)
        }
    }


  return (
    <div className='w-full min-h-screen bg-[#f3f3f3] flex items-center justify-center px-6 py-20'>
        <motion.div
        initial={{opacity:0 , y:-40}}
        animate={{opacity:1 , y:0}}
        transition={{duration:1}}
         className='w-full max-w-md p-8 rounded-3xl bg-white shadow-2xl border border-gray-200'>
            <div className='flex items-center justify-center gap-3 mb-6'>
                <div className='bg-black text-white p-2 rounded-lg'>
                    <FaRobot size={18}/>
                </div>
                <h2 className='font-semibold text-lg'>InterviewIQ.AI</h2>
            </div>
            <h1 className='text-2xl md:text-3xl font-semibold text-center leading-snug mb-4'>
                Continue with
                <span className='bg-green-100 text-green-600 px-3 py-1 rounded-full inline-flex items-center gap-2'>
                    <IoSparkles size={16}/>
                    AI Smart Interview

                </span>
            </h1>
            <p className='text-gray-500 text-center text-sm md:text-base leading-relaxed mb-8'>
                Sign in to start AI-powered mock interviews, track your progress, and unlock detailed performance insights.
            </p>

            {errorMessage && (
                <div className='mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm text-center leading-relaxed'>
                    {errorMessage}
                </div>
            )}

            <motion.button 
            disabled={loading}
            onClick={handleGoogleAuth}
            whileHover={!loading ? {opacity:0.9 , scale:1.03} : {}}
            whileTap={!loading ? {opacity:0.9 , scale:0.96} : {}}
             className={`w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full shadow-md ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}>
                {loading ? (
                    <>
                        <AiOutlineLoading3Quarters className="animate-spin" size={18} />
                        <span>Signing in...</span>
                    </>
                ) : (
                    <>
                        <FcGoogle size={20} />
                        <span>Continue with Google</span>
                    </>
                )}
            </motion.button>

        </motion.div>
      
    </div>
  )
}

export default Auth

