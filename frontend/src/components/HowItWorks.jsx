import React from "react";
import "../css/HowItWorks.css";

function HowItWorks() {
  const steps = [
    {
      icon: "📄",
      title: "Upload CV",
      desc: "Upload your resume in PDF or DOCX format",
    },
    {
      icon: "🧠",
      title: "AI Analysis",
      desc: "AI extracts skills using NLP & ML models",
    },
    {
      icon: "🎯",
      title: "Job Matching",
      desc: "Find jobs that match your skills (70%+ accuracy)",
    },
    {
      icon: "🚀",
      title: "Apply Instantly",
      desc: "Apply directly to LinkedIn & company portals",
    },
    {
      icon: "💼",
      title: "Gig Creation",
      desc: "AI generates freelance gigs from your skills",
    },
    {
      icon: "💰",
      title: "Price Prediction",
      desc: "AI suggests optimal gig pricing automatically",
    },
    {
      icon: "📊",
      title: "Career Analytics",
      desc: "Track your skill growth and job readiness",
    },
    {
      icon: "📉",
      title: "Career Gap Analysis",
      desc: "Identify missing skills for your dream job",
    },
  ];

  return (
    <section className="how-section" id="howItWorks">

      <h2 className="how-title">How GigCraft AI Works</h2>

      <p className="how-subtitle">
        End-to-end AI powered career system
      </p>

      <div className="how-grid">
        {steps.map((item, index) => (
          <div className="how-card" key={index}>

            <div className="how-icon">{item.icon}</div>

            <h3>{item.title}</h3>

            <p>{item.desc}</p>

          </div>
        ))}
      </div>

    </section>
  );
}

export default HowItWorks;