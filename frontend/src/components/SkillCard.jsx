import React from "react";

function SkillCard({ name, level, category }) {
  return (
    <div className="skill-card">
      <div>
        <h4>{name}</h4>
        <p>{category}</p>
      </div>

      <span>{level}</span>
    </div>
  );
}

export default SkillCard;