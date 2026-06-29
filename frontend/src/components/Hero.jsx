import React from "react";
import "../css/Hero.css";
import { useNavigate } from "react-router-dom";


function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">

      {/* LEFT */}
      <div className="hero-left">
        <h1>
          AI Powered Career Recommendation & Gig Creation Platform
        </h1>

        <p>
          Upload your resume and let GigCraft AI analyze your skills,
          recommend jobs and generate Fiverr/Upwork gigs with SEO title,
          keywords and market-based pricing.
        </p>

        <div className="hero-buttons">
          <button className="primary" onClick={() => navigate("/signup")}>
            Get Started
          </button>

          <button className="secondary">
            Watch Demo
          </button>
        </div>
      </div>

      {/* RIGHT */}
      <div className="hero-right">

        <div className="hero-card">

          <img
            src="assets/images/mbl.svg"
            alt="AI Dashboard"
            className="hero-img"
          />

        </div>

      </div>

    </section>
  );
}

export default Hero;