import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      {/* Sol Üstte Site İsmi */}
      <div className="logo">
  <Link to="/" className="logo-text">MoneyWeb</Link>
</div>


      {/* Navbar Linkleri */}
      <div className="nav-links">
        <Link to="/about" className="nav-link">About</Link>
        <Link to="/" className="nav-link">Map</Link>
        <Link to="/currencies" className="nav-link">Currencies</Link>
        <Link to="/exchange-rates" className="nav-link">Live Rates</Link>
      </div>
    </nav>
  );
};

export default Navbar;
