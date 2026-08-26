import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "./redux/userSlice";

// Pages
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import InterviewRoom from "./pages/InterviewRoom";
import FeedbackReport from "./pages/FeedbackReport";
import History from "./pages/History";
import Pricing from "./pages/Pricing";

export const ServerUrl = "http://localhost:8000";

// Configure global Axios settings
axios.defaults.withCredentials = true;

// Attach Authorization header if stored
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("interviewiq_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await axios.get(ServerUrl + "/api/user/current-user", {
          withCredentials: true,
        });
        dispatch(setUserData(result.data));
      } catch (error) {
        dispatch(setUserData(null));
      }
    };

    getUser();
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/interview/:id" element={<InterviewRoom />} />
      <Route path="/feedback/:id" element={<FeedbackReport />} />
      <Route path="/history" element={<History />} />
      <Route path="/pricing" element={<Pricing />} />
    </Routes>
  );
};

export default App;
