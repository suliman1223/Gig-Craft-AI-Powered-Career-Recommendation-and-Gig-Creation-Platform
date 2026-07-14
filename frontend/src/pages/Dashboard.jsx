import React, { useState, useEffect } from "react";
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
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [resumeSummary, setResumeSummary] = useState({ education: "", experience: "", projects: "" });
  const [loading, setLoading] = useState(false);

  const parseSectionText = (field, fallback) => {
    if (!field || (Array.isArray(field) && field.length === 0)) return fallback;
    if (Array.isArray(field)) {
      const firstItem = field[0];
      if (typeof firstItem === "object" && firstItem !== null) {
        return firstItem.degree || firstItem.title || firstItem.role || firstItem.name || JSON.stringify(firstItem);
      }
      return String(firstItem);
    }
    return String(field);
  };

  const normalizeSkills = (skillsArray) => {
    if (!Array.isArray(skillsArray)) return [];
    return skillsArray.map((skill) => {
      if (typeof skill === "object" && skill !== null) {
        return {
          name: skill.name || "Unknown Skill",
          level: skill.level || "Intermediate",
          category: skill.category || "General"
        };
      }
      return { name: String(skill), level: "Intermediate", category: "General" };
    });
  };

  const updateDashboardData = (resumeData, jobsData) => {
    if (resumeData) {
      const cleanSkills = normalizeSkills(resumeData.skills);
      setExtractedSkills(cleanSkills);
      setResumeSummary({
        education: parseSectionText(resumeData.education, "BS Computer Science"),
        experience: parseSectionText(resumeData.experience, "Frontend Developer Intern"),
        projects: parseSectionText(resumeData.projects, "Career Recommendation Web App")
      });

      const activeJobs = jobsData || [];
      setMatchedJobs(activeJobs);
      
      if (activeJobs.length > 0) {
        setDashboardState("matched");
      } else if (cleanSkills.length > 0) {
        setDashboardState("extracted");
      }
    }
  };

  useEffect(() => {
    async function fetchUserDashboardData() {
      setLoading(true);
      try {
        const response = await axios.post(`${API_URL}/jobs/recommend`, {}, { withCredentials: true });
        if (response.data && response.data.resume) {
          updateDashboardData(response.data.resume, response.data.recommended_jobs);
        }
      } catch (error) {
        console.error("Failed to load pipeline data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUserDashboardData();
  }, []);

  // 🚀 FIX: This now explicitly updates the screen view right away!
  const handleFindMatchesClick = async () => {
    setLoading(true);
    setDashboardState("matched"); // Instantly shift the layout view tab
    try {
      const response = await axios.post(`${API_URL}/jobs/recommend`, {}, { withCredentials: true });
      if (response.data) {
        const jobs = response.data.recommended_jobs || [];
        setMatchedJobs(jobs);
      }
    } catch (error) {
      console.error("Error executing sheet calculation logic:", error);
    } finally {
      setLoading(false);
    }
  };

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
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div>
            <h1>Welcome Back</h1>
            <p>Track your resume, extracted skills and job recommendations.</p>
          </div>
          <button className="dash-primary-btn" onClick={() => navigate("/upload-cv")}>
            Upload New CV
          </button>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <span>Profile Completion</span>
            <h3>{matchedJobs.length > 0 ? "85%" : "30%"}</h3>
            <div className="progress-line">
              <div style={{ width: matchedJobs.length > 0 ? "85%" : "30%" }}></div>
            </div>
          </div>
          <div className="stat-card">
            <span>Extracted Skills</span>
            <h3>{extractedSkills.length}</h3>
            <p>Skills found from CV</p>
          </div>
          <div className="stat-card">
            <span>Job Matches</span>
            <h3>{matchedJobs.length}</h3>
            <p>AI recommended jobs</p>
          </div>
        </div>

        <div className="dashboard-state-tabs">
          <button className={dashboardState === "new" ? "active" : ""} onClick={() => setDashboardState("new")}>
            New User
          </button>
          <button className={dashboardState === "extracted" ? "active" : ""} onClick={() => setDashboardState("extracted")}>
            CV Extracted
          </button>
          <button className={dashboardState === "matched" ? "active" : ""} onClick={handleFindMatchesClick}>
            Matching Complete
          </button>
        </div>

        {loading && (
          <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
            Processing data pipelines with vector engine...
          </div>
        )}

        {!loading && dashboardState === "new" && (
          <div className="dashboard-grid">
            <div className="dashboard-card large-card">
              <h2>Upload Your CV</h2>
              <p>Upload your resume in PDF or DOCX format to parse profile data attributes.</p>
              <UploadBox 
                inputId="dashboard-cv-upload" 
                compact 
                showExtractButton={true}
                onExtractSuccess={(resumeData, jobMatches) => updateDashboardData(resumeData, jobMatches)}
              />
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
              <p>Upload your CV first to get AI-based job recommendations.</p>
            </div>
          </div>
        )}

        {!loading && dashboardState === "extracted" && (
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
                <p>{resumeSummary.education}</p>
              </div>
              <div>
                <h4>Experience</h4>
                <p>{resumeSummary.experience}</p>
              </div>
              <div>
                <h4>Projects</h4>
                <p>{resumeSummary.projects}</p>
              </div>
            </div>

            <h3 className="skills-heading">Extracted Skills</h3>
            {extractedSkills.length === 0 ? (
              <p style={{ color: "#777", margin: "10px 0" }}>No skills found.</p>
            ) : (
              <div className="skills-grid">
                {extractedSkills.map((skill, index) => (
                  <SkillCard key={index} name={skill.name} level={skill.level} category={skill.category} />
                ))}
              </div>
            )}

            <button className="dash-primary-btn find-btn" onClick={handleFindMatchesClick}>
              Find Matching Jobs
            </button>
          </div>
        )}

        {!loading && dashboardState === "matched" && (
          <div className="dashboard-card">
            <div className="section-header">
              <div>
                <h2>Recommended Jobs</h2>
                <p>Best jobs based on your extracted skills and profile.</p>
              </div>
              <span className="success-badge">{matchedJobs.length} Matches</span>
            </div>

            {matchedJobs.length === 0 ? (
              <p style={{ color: "#777", padding: "20px 0", textAlign: "center" }}>
                No job recommendations loaded. Please verify your FastAPI server connection or your Google Sheet dataset.
              </p>
            ) : (
              <div className="jobs-list">
                {matchedJobs.map((job, index) => (
                  <JobMatchCard key={job.id || index} job={job} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </section>
  );
}

export default Dashboard;