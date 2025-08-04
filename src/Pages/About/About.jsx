import React from "react";
import "./About.css";
import { useNavigate } from "react-router-dom";
import {
  FaMoneyBillWave,
  FaMapMarkedAlt,
  FaGlobeEurope,
  FaGlobe,
  FaCoins,
  FaSyncAlt
} from "react-icons/fa";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="a">
      <div className="about-container">
        <div className="about-hero">
          <h1>Welcome to RateExplorer</h1>
          <p>
          RateExplorer is an interactive platform that visualizes global exchange rates and allows you to make comparisons across countries.
          </p>
        </div>

        <div className="features-grid">
          {/* 1 - ExchangeRates */}
          <div className="feature-card">
            <FaMoneyBillWave className="feature-icon" />
            <h3>Live Rates Page</h3>
            <p>View up-to-date exchange rates.</p>
            <button className="feature-button" onClick={() => navigate("/exchange-rates")}>Go to Page</button>
          </div>

          {/* 2 - Home Page (Map) */}
          <div className="feature-card">
            <FaMapMarkedAlt className="feature-icon" />
            <h3>World Map</h3>
            <p>Select countries and analyze visually.</p>
            <button className="feature-button" onClick={() => navigate("/")}>Go to Page</button>
          </div>

          {/* 3 - Currencies */}
          <div className="feature-card">
            <FaGlobeEurope className="feature-icon" />
            <h3>Currency Guide</h3>
            <p>Explore countries and currencies by continent.</p>
            <button className="feature-button" onClick={() => navigate("/currencies")}>Go to Page</button>
          </div>

          {/* 4 - Feature 1 */}
          <div className="feature-card">
            <FaGlobe className="feature-icon" />
            <h3>195+ Countries Supported</h3>
            <p>Includes currency, population, language, and more.</p>
          </div>

          {/* 5 - Feature 2 */}
          <div className="feature-card">
            <FaCoins className="feature-icon" />
            <h3>160+ Currencies</h3>
            <p>Over 160 supported currencies worldwide.</p>
          </div>

          {/* 6 - Feature 3 */}
          <div className="feature-card">
            <FaSyncAlt className="feature-icon" />
            <h3>Real-Time Data</h3>
            <p>Provides live exchange rate data via API.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
