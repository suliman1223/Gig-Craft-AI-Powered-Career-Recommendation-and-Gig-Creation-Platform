import React from "react";
import "../css/Features.css";

function Features() {
  const features = [
    {
      icon: "📄",
      title: "Resume Parsing",
      desc: "AI extracts skills, education, experience from your CV",
    },
    {
      icon: "🧠",
      title: "AI Skill Extraction",
      desc: "NLP models identify and normalize technical skills",
    },
    {
      icon: "💼",
      title: "Job Recommendation",
      desc: "Get 70%+ matched jobs using AI ranking system",
    },
    {
      icon: "🚀",
      title: "One Click Apply",
      desc: "Apply directly to LinkedIn & company portals",
    },
    {
      icon: "💰",
      title: "Gig Creation AI",
      desc: "Generate freelance gigs automatically from skills",
    },
    {
      icon: "📊",
      title: "Career Analytics",
      desc: "Track progress, skills growth and performance",
    },
  ];

  return (
    <section className="features-section" id="features">

      <h2 className="features-title">Powerful AI Features</h2>

      <p className="features-subtitle">
        Everything you need to build your career with AI
      </p>

      <div className="features-grid">
        {features.map((item, index) => (
          <div className="feature-card" key={index}>

            <div className="feature-icon">{item.icon}</div>

            <h3>{item.title}</h3>

            <p>{item.desc}</p>

          </div>
        ))}
      </div>

    </section>
  );
}

export default Features;