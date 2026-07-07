import React, { useState } from "react";
import axios from "axios";
import "../css/signup.css";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
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
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      const response = await axios.post(`${API_URL}/auth/signup`, formData, {
        withCredentials: true,
      });

      if (response.data?.success) {
        setMessage("Account created successfully!");
        setTimeout(() => navigate("/login"), 800);
      }
    } catch (error) {
      const errMessage =
        error.response?.data?.message || "Signup failed. Please try again.";
      setMessage(errMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="signup">

      {/* LEFT */}
      <div className="signup-left">
        <h1>Create Your GigCraft AI Account</h1>

        <p>
          Sign up to upload your resume, analyze your skills, get career
          recommendations and create professional Fiverr or Upwork gigs with AI.
        </p>

        <div className="signup-info">
          <div>AI Resume Analysis</div>
          <div>Career Recommendation</div>
          <div>Gig Title, Keywords & Pricing</div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="signup-right">
        <div className="signup-card">
          <h2>Sign Up</h2>
          <p className="signup-subtitle">Create your account to continue</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

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
                placeholder="Create password"
                required
                minLength="6"
              />
            </div>

            {message && <p className="signup-message">{message}</p>}

            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="login-text">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>Login</span>
          </p>
        </div>
      </div>

    </section>
  );
}

export default Signup;