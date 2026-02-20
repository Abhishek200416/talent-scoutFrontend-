import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Toaster } from "./components/ui/sonner";
import Landing from "./components/Landing";
import Documentation from "./components/pages/Documentation";
import APIReference from "./components/pages/APIReference";
import SmartContract from "./components/pages/SmartContract";
import PrivacyPolicy from "./components/pages/PrivacyPolicy";
import TermsOfService from "./components/pages/TermsOfService";
import CookiePolicy from "./components/pages/CookiePolicy";
import CandidateDashboard from "./components/candidate/Dashboard";
import RecruiterDashboard from "./components/recruiter/Dashboard";
import "./App.css";
import "./index.css";

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <ThemeProvider>
      <div className="App min-h-screen bg-background text-foreground">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={user ? <Navigate to={`/${user.role}`} /> : <Landing setUser={setUser} />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/api-reference" element={<APIReference />} />
            <Route path="/smart-contract" element={<SmartContract />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route 
              path="/candidate/*" 
              element={user?.role === 'candidate' ? <CandidateDashboard user={user} setUser={setUser} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/recruiter/*" 
              element={user?.role === 'recruiter' ? <RecruiterDashboard user={user} setUser={setUser} /> : <Navigate to="/" />} 
            />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </div>
    </ThemeProvider>
  );
}

export default App;
