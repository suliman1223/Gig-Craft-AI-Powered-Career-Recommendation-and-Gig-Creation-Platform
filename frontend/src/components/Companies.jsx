import React from "react";
import "../css/Companies.css";
import {
  FaGoogle,
  FaMicrosoft,
  FaAmazon,
  FaLinkedin,
  FaFacebook,
} from "react-icons/fa";

function Companies() {
  const companies = [
    {
      icon: <FaGoogle />,
      url: "https://www.google.com",
    },
    {
      icon: <FaMicrosoft />,
      url: "https://www.microsoft.com",
    },
    {
      icon: <FaAmazon />,
      url: "https://www.amazon.com",
    },
    {
      icon: <FaLinkedin />,
      url: "https://www.linkedin.com",
    },
    {
      icon: <FaFacebook />,
      url: "https://www.facebook.com",
    },
  ];

  return (
    <section className="companies-section">
      <h2 className="companies-title">
        Through our site you will get job easily in high tech companies
      </h2>

      <p className="companies-subtitle">
        Students and freelancers use GigCraft AI to grow their careers
      </p>

      <div className="companies-grid">
        {companies.map((company, index) => (
          <a
            key={index}
            href={company.url}
            target="_blank"
            rel="noopener noreferrer"
            className="company-card"
          >
            {company.icon}
          </a>
        ))}
      </div>
    </section>
  );
}

export default Companies;