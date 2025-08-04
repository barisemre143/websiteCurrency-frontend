import React, { useState, useEffect } from "react";
import "./Rates.css";
import {
  fetchExchangeRates,
  fetchAllCountries,
} from "../../utils/api"; // Ortak API fonksiyonları

const ExchangeRates = () => {
  const [rates, setRates] = useState(null);
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [currencies, setCurrencies] = useState([]);
  const [currencyNames, setCurrencyNames] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getExchangeData(baseCurrency);
  }, [baseCurrency]);

  const getExchangeData = async (base) => {
    try {
      const exchangeRates = await fetchExchangeRates(base);
      setRates(exchangeRates);
      setCurrencies(Object.keys(exchangeRates));
    } catch (error) {
      console.error("Döviz kurları alınamadı:", error);
    }

    try {
      const allCountries = await fetchAllCountries();
      const currencyMap = {};
      allCountries.forEach((country) => {
        if (country.currencies) {
          Object.entries(country.currencies).forEach(([code, details]) => {
            currencyMap[code] = details.name;
          });
        }
      });
      setCurrencyNames(currencyMap);
    } catch (error) {
      console.error("Para birimi isimleri çekilemedi:", error);
    }
  };

  const filteredRates = rates
    ? Object.entries(rates).filter(([code]) =>
        code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (currencyNames[code] && currencyNames[code].toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  return (
    <div className="exchange-container">
      <h1>Live Currency Rates</h1>

      <div className="currency-selector">
        <label htmlFor="base-currency">Base Currency:</label>
        <select
          id="base-currency"
          value={baseCurrency}
          onChange={(e) => setBaseCurrency(e.target.value)}
        >
          {currencies.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
      </div>

      <input
        type="text"
        className="search-input"
        placeholder="Search currency..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {rates ? (
        <table className="exchange-table">
          <thead>
            <tr>
              <th>Currency</th>
              <th>Rate ({baseCurrency})</th>
            </tr>
          </thead>
          <tbody>
            {filteredRates.map(([currency, value]) => (
              <tr key={currency}>
                <td>{currency} - {currencyNames[currency] || "Unknown"}</td>
                <td>{value.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="loading-text">Loading data...</p>
      )}
    </div>
  );
};

export default ExchangeRates;
