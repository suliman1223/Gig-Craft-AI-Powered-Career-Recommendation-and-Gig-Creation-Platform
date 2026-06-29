import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/Footer.css";

function Footer() {
     const navigate = useNavigate();
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* BRAND */}
        <div className="footer-brand">
          <h2>GigCraft AI</h2>
          <p>
            AI-powered career recommendation platform helping students
            and professionals find better opportunities.
          </p>
        </div>

        {/* LINKS */}
        <div className="footer-links">
          <h3>Quick Links</h3>
          <ul>
            <li onClick={() => navigate("/")}>Home</li>
            <li><a href="#features" className="ab">Features</a></li>
            <li><a href="#howItWorks" className="ab">How it Works</a></li>
            <li>Jobs</li>
          </ul>
        </div>

        {/* RESOURCES */}
        <div className="footer-links">
          <h3>Resources</h3>
          <ul>
            <li>Privacy Policy</li>
            <li>Terms</li>
            <li>Support</li>
          </ul>
        </div>

        {/* CONTACT */}
        <div className="footer-contact">
          <h3>Contact</h3>
          <p>support@gigcraft.ai</p>
          <p>gigcrafAi@gmail.com</p>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="footer-bottom">
        <p>© 2026 GigCraft AI. All rights reserved.</p>
      </div>

    </footer>
  );
}

export default Footer;