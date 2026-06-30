import React from "react";

function JobMatchCard({ job }) {
  return (
    <div className="job-match-card">
      <div className="job-main-info">
        <div>
          <h3>{job.title}</h3>
          <p>
            {job.company} • {job.location} • {job.type}
          </p>
        </div>

        <div className="match-score">
          <h2>{job.match}%</h2>
          <span>Match</span>
        </div>
      </div>

      <div className="match-progress">
        <div style={{ width: `${job.match}%` }}></div>
      </div>

      <div className="job-skills">
        <div>
          <h4>Matched Skills</h4>
          <div className="skill-tags">
            {job.matchedSkills.map((skill, index) => (
              <span className="matched" key={index}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4>Missing Skills</h4>
          <div className="skill-tags">
            {job.missingSkills.map((skill, index) => (
              <span className="missing" key={index}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button className="apply-btn">View Details</button>
    </div>
  );
}

export default JobMatchCard;