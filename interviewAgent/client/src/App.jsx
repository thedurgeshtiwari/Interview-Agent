import React, { useEffect, useState } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import axios from 'axios'
import Auth from './pages/Auth'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import InterviewRoom from './pages/InterviewRoom'
import FeedbackReport from './pages/FeedbackReport'
import History from './pages/History'
import Pricing from './pages/Pricing'
import { useDispatch, useSelector } from 'react-redux'
import { setUserData } from './redux/userSlice'
import { AiOutlineLoading3Quarters } from "react-icons/ai"

export const ServerUrl = "http://localhost:8000"

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const { userData } = useSelector((state) => state.user)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // If we have userData or have finished checking
    if (userData !== undefined) {
      setChecking(false)
    }
  }, [userData])

  if (checking) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex flex-col items-center justify-center">
        <AiOutlineLoading3Quarters className="animate-spin text-black" size={40} />
        <p className="mt-4 text-gray-600 font-medium">Verifying Session...</p>
      </div>
    )
  }

  if (!userData) {
    return <Navigate to="/auth" replace />
  }

  return children
}

const App = () => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await axios.get(ServerUrl + "/api/user/current-user", { withCredentials: true })
        dispatch(setUserData(result.data))
      } catch (error) {
        console.log(error)
        dispatch(setUserData(null))
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [dispatch])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex flex-col items-center justify-center">
        <AiOutlineLoading3Quarters className="animate-spin text-black" size={40} />
        <p className="mt-4 text-gray-600 font-medium">Loading InterviewIQ.AI...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/auth' element={<Auth />} />
      
      {/* Protected Routes */}
      <Route path='/dashboard' element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path='/interview/:id' element={
        <ProtectedRoute>
          <InterviewRoom />
        </ProtectedRoute>
      } />
      <Route path='/feedback/:id' element={
        <ProtectedRoute>
          <FeedbackReport />
        </ProtectedRoute>
      } />
      <Route path='/history' element={
        <ProtectedRoute>
          <History />
        </ProtectedRoute>
      } />
      <Route path='/pricing' element={
        <ProtectedRoute>
          <Pricing />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App
