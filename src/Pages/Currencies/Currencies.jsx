import React, { useState, useEffect } from "react";
import "./Currencies.css";
import { fetchAllCountries } from "../../utils/api"; // Ortak API fonksiyonu

const Currencies = () => {
  const [countries, setCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContinent, setSelectedContinent] = useState(null);
  const [continents, setContinents] = useState([]);

  useEffect(() => {
    fetchAllCountries()
      .then((data) => {
        const sortedCountries = data.sort((a, b) =>
          a.name.common.localeCompare(b.name.common)
        );
        setCountries(sortedCountries);

        const uniqueContinents = [
          "World", // 🌍 World filtresi en başta
          ...new Set(data.map((country) => country.region).filter(Boolean)),
        ];
        setContinents(uniqueContinents);
      })
      .catch((error) => console.error("Veri çekme hatası:", error));
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleContinentSelect = (continent) => {
    setSelectedContinent(continent === "World" ? null : continent); // 🌍 World için null kullanılır
    setSearchTerm("");
  };

  const filteredCountries = countries.filter(
    (country) =>
      (!selectedContinent || country.region === selectedContinent) &&
      country.name.common.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="currencies-container">
      <div className="continent-section">
        <h2>Select Continent</h2>
        <div className="continent-buttons">
          {continents.map((continent) => (
            <button
              key={continent}
              className={`continent-btn ${selectedContinent === continent || (continent === "World" && selectedContinent === null)
                ? "active"
                : ""
                }`}
              onClick={() => handleContinentSelect(continent)}
            >
              {continent}
            </button>
          ))}
        </div>
      </div>

      <div className="search-section">
        <input
          type="text"
          className="search-box"
          placeholder="Search country..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="list-container">
        {filteredCountries.map((country) => {
          const currencyData = country.currencies
            ? Object.entries(country.currencies)[0]
            : null;

          return (
            <div key={country.cca3} className="country-card">
              <img
                src={`https://flagcdn.com/w320/${country.cca2.toLowerCase()}.png`}
                alt={`${country.name.common} flag`}
                className="country-flag"
              />
              <span className="country-name">{country.name.common}</span>
              <span className="currency-name">
                {currencyData ? `${currencyData[0]} - ${currencyData[1].name}` : "Unknown"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Currencies;
