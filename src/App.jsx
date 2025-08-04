import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import Home from "./Pages/Home/WorldMap";
import Currencies from "./Pages/Currencies/Currencies";
import ExchangeRates from "./Pages/ExchangeRates/Rates";
import About from "./Pages/About/About";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  document.querySelector(".selection-bar")

  console.log("App bileşeni render edildi!");
  return (
    <ErrorBoundary>
      <Router>
        <div>
          {/* Navbar en üstte */}
          <Navbar />
          
          {/* Sayfa İçerikleri */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/currencies" element={<Currencies />} />
            <Route path="/exchange-rates" element={<ExchangeRates />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}