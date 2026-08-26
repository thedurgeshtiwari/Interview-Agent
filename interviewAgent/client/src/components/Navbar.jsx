import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from "motion/react";
import { BsRobot, BsCoin } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import { setUserData } from '../redux/userSlice'

const ServerUrl = "http://localhost:8000"

const Navbar = () => {

    const dispatch = useDispatch()
    const {userData} = useSelector((state)=>state.user)
    const [showCreditPopup,setShowCreditPopup] = useState(false)
    const [showUserPopup,setShowUserPopup] = useState(false)
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await axios.get(ServerUrl + "/api/auth/logout", {
                withCredentials: true
            })

            dispatch(setUserData(null))
            setShowCreditPopup(false)
            setShowUserPopup(false)

            navigate("/")
        } catch (error) {
            console.error("Logout failed:", error)
            dispatch(setUserData(null))
            navigate("/")
        }
    }
  return (
    <div className='bg-[#f3f3f3] flex justify-center px-4 pt-6'>
        <motion.div
        initial={{opacity:0, y:-40}}
        animate={{opacity:1 , y:0}}
        transition={0.5} 
        
        className='w-full max-w-6xl bg-white rounded-[24px] shadow-sm border border-gray-200 px-8 py-4 flex justify-between items-center relative'>

            <div onClick={() => navigate(userData ? '/dashboard' : '/')} className='flex items-center gap-3 cursor-pointer'>
                <div className='bg-black text-white p-2 rounded-lg'>
                    <BsRobot size={18}/>
                </div>

                <h1 className='font-semibold text-lg'>
                    InterviewIQ.AI
                </h1>
            </div>

            <div className='flex items-center gap-6 relative'>
                {userData ? (
                    <>
                        <div className='relative'>
                            <button 
                            onClick={()=>{
                                setShowCreditPopup(!showCreditPopup);
                                setShowUserPopup(false);
                            }}
                            className='flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition cursor-pointer'>
                                <BsCoin size={16} className="text-yellow-500" />
                                <span>{userData.credits ?? 0} Credits</span>
                            </button>

                            {showCreditPopup && (
                                <div className='absolute right-0 mt-3 w-64 bg-white shadow-xl border border-gray-200 rounded-2xl p-5 z-50'>
                                    <p className='text-sm text-gray-600 mb-3'>Need more credits to continue interviews?</p>
                                    <button
                                    onClick={() => {
                                        setShowCreditPopup(false);
                                        navigate("/pricing");
                                    }}
                                    className='w-full bg-black text-white py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 transition cursor-pointer'>
                                        Buy more credits
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className='relative'>
                            <button
                            onClick={()=>{
                                setShowUserPopup(!showUserPopup);
                                setShowCreditPopup(false);
                            }} 
                            className='w-9 h-9 bg-black text-white rounded-full flex items-center justify-center font-semibold cursor-pointer hover:bg-gray-800 transition'>
                                {userData.name ? userData.name.slice(0,1).toUpperCase() : <FaUserAstronaut size={16}/>}
                            </button>

                            {showUserPopup && (
                                <div className='absolute right-0 mt-3 w-52 bg-white shadow-xl border border-gray-200 rounded-2xl p-4 z-50'>
                                    <p className='text-sm text-gray-400 font-medium mb-2 border-b border-gray-100 pb-2 truncate'>
                                        {userData.name}
                                    </p>

                                    <button
                                        onClick={() => {
                                            setShowUserPopup(false);
                                            navigate("/dashboard");
                                        }}
                                        className='w-full text-left text-sm py-2 hover:bg-gray-50 rounded-lg px-2 text-gray-700 transition cursor-pointer'
                                    >
                                        Dashboard
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShowUserPopup(false);
                                            navigate("/history");
                                        }}
                                        className='w-full text-left text-sm py-2 hover:bg-gray-50 rounded-lg px-2 text-gray-700 transition cursor-pointer'
                                    >
                                        Interview History
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShowUserPopup(false);
                                            navigate("/pricing");
                                        }}
                                        className='w-full text-left text-sm py-2 hover:bg-gray-50 rounded-lg px-2 text-gray-700 transition cursor-pointer'
                                    >
                                        Pricing
                                    </button>

                                    <button
                                    onClick={handleLogout}
                                    className='w-full text-left text-sm py-2 mt-1 border-t border-gray-100 pt-2 flex items-center gap-2 text-red-500 hover:bg-red-50 rounded-lg px-2 transition cursor-pointer'>
                                        <HiOutlineLogout size={16}/>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <button
                        onClick={() => navigate('/auth')}
                        className='bg-black text-white hover:bg-gray-800 text-sm font-semibold px-5 py-2.5 rounded-full transition cursor-pointer'
                    >
                        Sign In
                    </button>
                )}
            </div>

        </motion.div>
      
    </div>
  )
}

export default Navbar
