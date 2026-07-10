import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../config.js";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}/auth/reset-password/${token}`,
        { password },
        { withCredentials: true }
      );

      if (response.data?.success) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("authUser", JSON.stringify(response.data.user));
        setMessage("Password reset! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 800);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Reset failed, link may be expired");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login">
      <div className="login-right">
        <div className="login-card">
          <h2>Reset Password</h2>
          <p className="login-subtitle">Enter your new password</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={6}
              />
            </div>

            {message && <p className="login-message">{message}</p>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ResetPassword;