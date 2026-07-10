import React from "react";
import "../css/login.css";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { API_URL } from "../config.js";
import { GoogleLogin } from "@react-oauth/google";



function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {

      const response = await axios.post(`${API_URL}/auth/login`, formData, {
        withCredentials: true,
      });

      if (response.data?.success) {
        localStorage.setItem("isAuthenticated", "true");
        if (response.data?.user) {
          localStorage.setItem("authUser", JSON.stringify(response.data.user));
        }
        setMessage("Login successful!");
        const redirectPath = location.state?.from?.pathname || "/dashboard";
        setTimeout(() => navigate(redirectPath, { replace: true }), 800);
      }
    } catch (error) {
      const errMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      setMessage(errMessage);
    } finally {
      setLoading(false);
    }
  };


  return (

    <section className="login">


      {/* LEFT */}
      <div className="login-left">
        <h1>Welcome Back to GigCraft AI</h1>

        <p>
          Login to continue your AI-powered career journey. Analyze your resume,
          explore recommended jobs and create professional gigs for Fiverr and
          Upwork.
        </p>

        <div className="login-info">
          <div>AI Resume Analysis</div>
          <div>Smart Job Recommendations</div>
          <div>Professional Gig Creation</div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="login-right">
        <div className="login-card">
          <h2>Login</h2>
          <p className="login-subtitle">Access your account to continue</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="login-options">
              <label>
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      rememberMe: e.target.checked,
                    }))
                  }
                />
                Remember me
              </label>

              <span onClick={() => navigate("/forgot-password")} style={{ cursor: "pointer" }}>
                Forgot Password?
              </span>
            </div>

            {/* <button type="submit" className="login-btn">
              Login
            </button> */}

            {message && <p className="login-message">{message}</p>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>




          <div className="divider">
            <span>or</span>
          </div>

          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                const response = await axios.post(
                  `${API_URL}/auth/google`,
                  { credential: credentialResponse.credential },
                  { withCredentials: true }
                );

                if (response.data?.success) {
                  localStorage.setItem("isAuthenticated", "true");
                  localStorage.setItem("authUser", JSON.stringify(response.data.user));
                  const redirectPath = location.state?.from?.pathname || "/dashboard";
                  navigate(redirectPath, { replace: true });
                }
              } catch (error) {
                setMessage("Google login failed. Please try again.");
              }
            }}
            onError={() => {
              setMessage("Google login failed. Please try again.");
            }}
          />

          <p className="signup-text">
            Don’t have an account?{" "}
            <span onClick={() => navigate("/signup")}>Sign Up</span>
          </p>
        </div>
      </div>

    </section>
  );
}

export default Login;