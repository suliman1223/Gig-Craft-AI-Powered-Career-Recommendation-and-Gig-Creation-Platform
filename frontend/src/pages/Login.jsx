import React from "react";
import "../css/login.css";
import { useNavigate } from "react-router-dom";


function Login() {
  const navigate = useNavigate();

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

          <form>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="Enter your email" />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Enter your password" />
            </div>

            <div className="login-options">
              <label>
                <input type="checkbox" />
                Remember me
              </label>

              <span>Forgot Password?</span>
            </div>

            <button type="submit" className="login-btn">
              Login
            </button>
          </form>

          <div className="divider">
            <span>or</span>
          </div>

          <button className="google-btn">
            Continue with Google
          </button>

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