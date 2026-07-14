import React from "react";

export default function JobCard({ job }) {
  // Extracting fields from the job object safely with fallbacks
  const title = job?.job_title || "Job Opportunity";
  const company = job?.company || "Tech Company";
  const location = job?.location || "Remote / Unspecified";
  const matchScore = job?.match_percentage ?? 0;
  const applyLink = job?.job_link || "https://www.linkedin.com";
  const skills = job?.matched_skills || [];
 const getBadgeColors = (score) => {
    if (score >= 80) return { text: "#10b981", bg: "#e6fbf1" };
    if (score >= 50) return { text: "#f59e0b", bg: "#fffbeb" };
    return { text: "#ef4444", bg: "#fef2f2" };
  };

  const badgeStyle = getBadgeColors(matchScore);

  return (
    <div 
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#ffffff",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)",
        marginBottom: "16px",
        fontFamily: "sans-serif"
      }}
    >
      {/* LEFT: Metadata Block */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <h3 style={{ margin: 0, color: "#1e293b", fontSize: "18px", fontWeight: "600" }}>
          {title}
        </h3>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
          🏢 {company} &nbsp;•&nbsp; 📍 {location}
        </p>

        {/* Dynamic Skill Badges */}
        {skills.length > 0 && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
            {skills.map((skill, index) => (
              <span 
                key={index} 
                style={{ 
                  backgroundColor: "#f1f5f9", 
                  color: "#475569", 
                  fontSize: "12px", 
                  padding: "3px 10px", 
                  borderRadius: "6px" 
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: Actions and Score Metrics */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        
        {/* Match Percentage Badge */}
        <div style={{ textAlign: "center", minWidth: "75px" }}>
          <span 
            style={{ 
              backgroundColor: badgeStyle.bg, 
              color: badgeStyle.text, 
              fontSize: "18px", 
              fontWeight: "bold", 
              padding: "6px 12px", 
              borderRadius: "8px",
              display: "inline-block"
            }}
          >
            {matchScore}%
          </span>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px", fontWeight: "500" }}>
            Match Score
          </div>
        </div>

        {/* Dynamic Apply Action Link */}
        <a 
          href={applyLink} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            backgroundColor: "#0a66c2", // LinkedIn Blue
            color: "#ffffff",
            textDecoration: "none",
            padding: "10px 20px",
            borderRadius: "24px",
            fontSize: "14px",
            fontWeight: "bold",
            display: "inline-block",
            textAlign: "center"
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#004182"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#0a66c2"}
        >
          Apply
        </a>

      </div>
    </div>
  );
}