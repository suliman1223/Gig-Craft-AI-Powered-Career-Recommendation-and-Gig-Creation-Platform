import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import UploadCV from "./pages/UploadCV";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* 🏠 Home Page */}
                <Route path="/" element={<Home />} />

                {/* 🔐 Auth Pages */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload-cv" element={<UploadCV />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;