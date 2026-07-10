import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import UploadCV from "./pages/UploadCV";
import ProtectedRoute from "./components/ProtectedRoute";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <BrowserRouter>
                <Routes>

                    {/* 🏠 Home Page */}
                    <Route path="/" element={<Home />} />

                    {/* 🔐 Auth Pages */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/upload-cv"
                        element={
                            <ProtectedRoute>
                                <UploadCV />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />

                </Routes>

            </BrowserRouter>
        </GoogleOAuthProvider >
    );
}

export default App;