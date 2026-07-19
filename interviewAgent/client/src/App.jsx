import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import axios from 'axios'
import Auth from './pages/Auth'
import Home from './pages/Home'
import { useDispatch } from 'react-redux'
import { setUserData } from './redux/userSlice'

export const ServerUrl = "http://localhost:8000"

const App = () => {

  const dispatch = useDispatch()
  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await axios.get(ServerUrl + "/api/user/current-user", { withCredentials: true })
        console.log(result.data)
        dispatch(setUserData(result.data))
      } catch (error) {
        console.log(error)
        dispatch(setUserData(null))
      }
    }

    getUser()
  }, [dispatch])

  return (
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/auth' element={<Auth/>}/>
    </Routes>
  )
}

export default App
