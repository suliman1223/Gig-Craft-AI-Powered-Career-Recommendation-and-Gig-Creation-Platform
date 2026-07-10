import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Companies from "../components/Companies";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";
import Footer from "../components/Footer";
import "../css/global.css";



function Home() {
  return (
    <div className="home-container">
      <Navbar isAuthenticated={false} />
      <Hero />
      <Companies />
      <HowItWorks />
      <Features />
      <Footer />
    </div>
  );
}

export default Home;