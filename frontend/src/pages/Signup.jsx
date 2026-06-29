import React from "react";
import "../css/signup.css";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

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

          <form>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Enter your full name" />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="Enter your email" />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Create password" />
            </div>

            <button type="submit" className="signup-btn">
              Create Account
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