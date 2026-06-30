import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar border-bottom">

      <div className="logo" onClick={() => navigate("/")}>
        <img src="assets/logo/Logo.svg" alt="Logo image" className="logo"/>
      </div>

      <ul className="nav-links">
        <li onClick={() => navigate("/")}><a> Home</a></li>
        <li onClick={() => navigate("/dashboard")}><a>Dashboard</a></li>
        <li onClick={() => navigate("/upload-cv")}><a>Uplaod-CV</a></li>
        
      </ul>

      <div className="nav-buttons">
        <button
          className="nav-login-btn"
          onClick={() => navigate("/login")}
        >
        Login
        </button>

        <button
          className="nav-signup-btn"
          onClick={() => navigate("/signup")}
        >
          Get Started
        </button>
      </div>

    </nav>
  );
}

export default Navbar;