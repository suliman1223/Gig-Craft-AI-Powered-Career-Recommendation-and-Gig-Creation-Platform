import React, { useState } from "react";
import "../css/Dashboard.css";
import UploadBox from "../components/UploadBox";
import SkillCard from "../components/SkillCard";
import JobMatchCard from "../components/JobMatchCard";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config.js";

function Dashboard() {
  const navigate = useNavigate();
  const [dashboardState, setDashboardState] = useState("new");

  const extractedSkills = [
    { name: "React", level: "Advanced", category: "Frontend" },
    { name: "Node.js", level: "Intermediate", category: "Backend" },
    { name: "MongoDB", level: "Intermediate", category: "Database" },
    { name: "Express.js", level: "Intermediate", category: "Backend" },
    { name: "Git", level: "Good", category: "Tools" },
  ];

  const matchedJobs = [
    {
      title: "MERN Stack Developer",
      company: "TechSoft Solutions",
      location: "Remote",
      match: 92,
      type: "Full Time",
      matchedSkills: ["React", "Node.js", "MongoDB"],
      missingSkills: ["Docker", "AWS"],
    },
    {
      title: "Frontend Developer",
      company: "CodeLab Technologies",
      location: "Islamabad",
      match: 88,
      type: "Internship",
      matchedSkills: ["React", "JavaScript", "CSS"],
      missingSkills: ["TypeScript"],
    },
    {
      title: "Backend Developer",
      company: "NextGen Systems",
      location: "Lahore",
      match: 81,
      type: "Full Time",
      matchedSkills: ["Node.js", "Express.js", "MongoDB"],
      missingSkills: ["Redis", "Docker"],
    },
  ];
  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("authUser");
      navigate("/login");
    }
  };
  return (

    <section className="dashboard-page">
      
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <h2>GigCraft AI</h2>
          <p>Career Dashboard</p>
        </div>

        <nav className="sidebar-menu">
          <button className="active">Dashboard</button>
          <button onClick={() => navigate("/upload-cv")}>Upload CV</button>
          <button>Profile</button>
          <button>Skills</button>
          <button>Job Matches</button>
          <button>Settings</button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div>
            <h1>Welcome Back, Sulaiman</h1>
            <p>Track your resume, extracted skills and job recommendations.</p>
          </div>

          <button
            className="dash-primary-btn"
            onClick={() => navigate("/upload-cv")}
          >
            Upload New CV
          </button>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <span>Profile Completion</span>
            <h3>30%</h3>
            <div className="progress-line">
              <div style={{ width: "30%" }}></div>
            </div>
          </div>

          <div className="stat-card">
            <span>Extracted Skills</span>
            <h3>{dashboardState === "new" ? "0" : "5"}</h3>
            <p>Skills found from CV</p>
          </div>

          <div className="stat-card">
            <span>Job Matches</span>
            <h3>{dashboardState === "matched" ? "3" : "0"}</h3>
            <p>AI recommended jobs</p>
          </div>
        </div>

        <div className="dashboard-state-tabs">
          <button
            className={dashboardState === "new" ? "active" : ""}
            onClick={() => setDashboardState("new")}
          >
            New User
          </button>

          <button
            className={dashboardState === "extracted" ? "active" : ""}
            onClick={() => setDashboardState("extracted")}
          >
            CV Extracted
          </button>

          <button
            className={dashboardState === "matched" ? "active" : ""}
            onClick={() => setDashboardState("matched")}
          >
            Matching Complete
          </button>
        </div>

        {dashboardState === "new" && (
          <div className="dashboard-grid">
            <div className="dashboard-card large-card">
              <h2>Upload Your CV</h2>
              <p>
                Upload your resume in PDF or DOCX format. GigCraft AI will
                extract your skills and prepare your profile for job matching.
              </p>

              <UploadBox inputId="dashboard-cv-upload" compact />
            </div>

            <div className="dashboard-card">
              <h2>Add Skills Manually</h2>
              <p>You can also add your important skills manually.</p>

              <div className="manual-skill-box">
                <span>React</span>
                <span>Node.js</span>
                <span>MongoDB</span>
                <span>Express</span>
              </div>

              <button className="dash-secondary-btn">Save Skills</button>
            </div>

            <div className="dashboard-card empty-card">
              <h2>No Recommendations Yet</h2>
              <p>
                Upload your CV first to get AI-based job recommendations and
                match percentage.
              </p>
            </div>
          </div>
        )}

        {dashboardState === "extracted" && (
          <div className="dashboard-card">
            <div className="section-header">
              <div>
                <h2>Resume Uploaded Successfully</h2>
                <p>Your CV has been processed and skills were extracted.</p>
              </div>

              <span className="success-badge">Uploaded</span>
            </div>

            <div className="resume-summary">
              <div>
                <h4>Education</h4>
                <p>BS Computer Science</p>
              </div>

              <div>
                <h4>Experience</h4>
                <p>Frontend Developer Intern</p>
              </div>

              <div>
                <h4>Projects</h4>
                <p>Career Recommendation Web App</p>
              </div>
            </div>

            <h3 className="skills-heading">Extracted Skills</h3>

            <div className="skills-grid">
              {extractedSkills.map((skill, index) => (
                <SkillCard
                  key={index}
                  name={skill.name}
                  level={skill.level}
                  category={skill.category}
                />
              ))}
            </div>

            <button
              className="dash-primary-btn find-btn"
              onClick={() => setDashboardState("matched")}
            >
              Find Matching Jobs
            </button>
          </div>
        )}

        {dashboardState === "matched" && (
          <div className="dashboard-card">
            <div className="section-header">
              <div>
                <h2>Recommended Jobs</h2>
                <p>Best jobs based on your extracted skills and profile.</p>
              </div>

              <span className="success-badge">3 Matches</span>
            </div>

            <div className="jobs-list">
              {matchedJobs.map((job, index) => (
                <JobMatchCard key={index} job={job} />
              ))}
            </div>
          </div>
        )}
      </main>
    </section>
  );
}

export default Dashboard;