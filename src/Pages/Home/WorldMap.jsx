import React, { useState, useEffect, useRef } from "react"; // useRef ekle
import { ComposableMap, Geographies, Geography, Graticule, Marker } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import "./WorldMap.css";
import {
  fetchAllCountries,
  fetchCountriesByRegion,
  fetchCountryByName,
  fetchBackendRates,
} from "../../utils/api"; // Ortak API fonksiyonları

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";
const width = 800;
const height = 500;

const regionSettings = {
  World: { center: [20, 20], scale: 120 },
  Europe: { center: [10, 50], scale: 200 },
  Asia: { center: [100, 35], scale: 150 },
  "North America": { center: [-100, 40], scale: 150 },
  "South America": { center: [-60, -15], scale: 100 },
  Africa: { center: [20, 0], scale: 150 },
  Oceania: { center: [140, -25], scale: 150 },
};

export default function WorldMap() {
  const [selectedRegion, setSelectedRegion] = useState("World");
  const { center, scale } = regionSettings[selectedRegion] || regionSettings["World"];
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContinent, setSelectedContinent] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [continents, setContinents] = useState([]);
  const [countries, setCountries] = useState([]);
  const [countryInfo, setCountryInfo] = useState(null);
  const [countryCurrencies, setCountryCurrencies] = useState([]);
  const [exchangeRates, setExchangeRates] = useState(null);
  const [selectedBaseCurrency, setSelectedBaseCurrency] = useState("USD");
  const [amount, setAmount] = useState(1);
  const regionCache = useRef({}); // kıta -> ülke listesi cache'i
  const unsupportedCountries = ["Dem. Rep. Congo", "Western Sahara", "Antarctica", "Kosovo"];
  const [isLoadingCountry, setIsLoadingCountry] = useState(false);
  const countryCache = useRef({}); // countryName -> countryInfo

  const [showGuide, setShowGuide] = useState(false);

  // Kıtaları yükle
  useEffect(() => {
    fetchAllCountries().then((data) => {
      const continentData = {};
      data.forEach((country) => {
        if (country.region) {
          if (!continentData[country.region]) {
            continentData[country.region] = [];
          }
          continentData[country.region].push(country);
        }
      });
      setContinents(Object.keys(continentData));
    });
  }, []);

  useEffect(() => {
    if (!selectedContinent) return;
  
    if (regionCache.current[selectedContinent]) {
      console.log(`[CACHE] Data served from cache for region: ${selectedContinent}`);
      setCountries(regionCache.current[selectedContinent]);
      return;
    }
  
    console.log(`[API] Fetching data from API for region: ${selectedContinent}`);
    fetchCountriesByRegion(selectedContinent).then((data) => {
      regionCache.current[selectedContinent] = data;
      setCountries(data);
    });
  }, [selectedContinent]);
  
  
  // Seçilen ülkeye göre para birimlerini getir
  useEffect(() => {
    if (selectedCountry) {
      fetchCountryByName(selectedCountry).then((country) => {
        if (country && country.currencies) {
          const currencyList = Object.keys(country.currencies).map(
            (code) => `${code} - ${country.currencies[code].name}`
          );
          setCountryCurrencies(currencyList);
        }
      });
    }
  }, [selectedCountry]);

  // Seçilen ülke değişince ilk para birimini otomatik seç
  useEffect(() => {
    if (selectedCountry && countryCurrencies.length > 0) {
      setSelectedCurrency(countryCurrencies[0]);
    }
  }, [selectedCountry, countryCurrencies]);

  // Döviz kurlarını backend'den al
  useEffect(() => {
    fetchBackendRates()
      .then((rates) => {
        console.log("Gelen döviz kurları:", rates);
        setExchangeRates(rates);
      })
      .catch((error) => console.error("Döviz kurları alınırken hata oluştu:", error));
  }, []);

  // Kıta veya ülke değişince para birimi listesini sıfırla
  useEffect(() => {
    setCountryCurrencies([]);
  }, [selectedContinent, selectedCountry]);

  const closeModal = () => {
    setModalVisible(false);
    setAmount(1);
  };

  const handleCurrencyChange = (e) => {
    const newCurrency = e.target.value;
    console.log("Seçilen yeni para birimi:", newCurrency);
    setSelectedCurrency(newCurrency);
  };

  const handleCountryClick = async (countryName) => {
    setCountryInfo(null);
    setIsLoadingCountry(true);
    setModalVisible(true);
  
    if (countryCache.current[countryName]) {
      console.log(`[CACHE] Data served from cache for country: ${countryName}`);
      const cachedCountry = countryCache.current[countryName];
      const currencyCode = cachedCountry.currency.split(" - ")[0];
  
      let exchangeRateText = "Exchange rate not available";
      if (exchangeRates && exchangeRates[currencyCode]) {
        const exchangeRate = exchangeRates[currencyCode] * amount;
        exchangeRateText = `${amount} ${selectedBaseCurrency} = ${exchangeRate.toFixed(2)} ${currencyCode}`;
      }
  
      setCountryInfo({ ...cachedCountry, exchangeRate: exchangeRateText });
      setIsLoadingCountry(false);
      return;
    }
  
    if (unsupportedCountries.includes(countryName)) {
      const fallbackInfo = {
        name: countryName,
        capital: "Unknown",
        population: "Unknown",
        currency: "Unknown",
        languages: "Unknown",
        exchangeRate: "Unknown",
        flag: "",
      };
      setCountryInfo(fallbackInfo);
      countryCache.current[countryName] = fallbackInfo;
      setIsLoadingCountry(false);
      return;
    }
  
    try {
      const country = await fetchCountryByName(countryName);
  
      if (country) {
        const currencyCode = country.currencies ? Object.keys(country.currencies)[0] : "Unknown";
        const currencyName = country.currencies ? country.currencies[currencyCode].name : "Unknown";
        const languages = country.languages ? Object.values(country.languages).join(", ") : "Unknown";
  
        const basicCountryData = {
          name: country.name.common,
          capital: country.capital ? country.capital[0] : "Unknown",
          population: country.population.toLocaleString(),
          currency: `${currencyCode} - ${currencyName}`,
          languages,
          flag: country.flags?.png || "",
        };
  
        let exchangeRateText = "Exchange rate not available";
        if (exchangeRates && exchangeRates[currencyCode]) {
          const exchangeRate = exchangeRates[currencyCode] * amount;
          exchangeRateText = `${amount} ${selectedBaseCurrency} = ${exchangeRate.toFixed(2)} ${currencyCode}`;
        }
  
        setCountryInfo({ ...basicCountryData, exchangeRate: exchangeRateText });
        countryCache.current[countryName] = basicCountryData;
      } else {
        throw new Error("Country data not found");
      }
    } catch (error) {
      console.error("Failed to fetch country data:", error);
      setCountryInfo({
        name: countryName,
        capital: "Unknown",
        population: "Unknown",
        currency: "Unknown",
        languages: "Unknown",
        exchangeRate: "Exchange rate not available",
        flag: "",
      });
    } finally {
      setIsLoadingCountry(false);
    }
  };
  
  
  
  


  
  

  return (
    <div className="home-scroll-wrapper">
    <div className="home-container">
    <div className="map-container" style={{ textAlign: "center", position: "relative", backgroundColor: "black" }}>
      <div className="selection-bar">
        <p className="selection-text">Please select a currency:</p>
  
        <select onChange={(e) => setSelectedContinent(e.target.value)} value={selectedContinent}>
          <option value="" disabled>Select Continent</option>
          {continents.map((continent) => (
            <option key={continent} value={continent}>{continent}</option>
          ))}
        </select>
  
        <select onChange={(e) => setSelectedCountry(e.target.value)} value={selectedCountry} disabled={!selectedContinent}>
          <option value="" disabled>Select Country</option>
          {countries.map((country) => (
            <option key={country.cca3} value={country.name.common}>{country.name.common}</option>
          ))}
        </select>
  
        <select onChange={handleCurrencyChange} value={selectedCurrency} disabled={!selectedCountry}>
          <option value="" disabled>Select Currency</option>
          {countryCurrencies.map((currency) => (
            <option key={currency} value={currency}>{currency}</option>
          ))}
        </select>
  
        {/* Seçilen Para Birimi Bilgisi Kutusu */}
        {selectedCurrency && (
          <div className="selected-currency-box">
            Your Selected Currency: <span>{selectedCurrency}</span>
          </div>
        )}
      </div>
      
      <div className="instruction-text">
  <p>💱 <strong>Compare your selected currency</strong><br />In this page, you can see how your selected currency compares to other countries' currencies.</p>
  <p>🌍 <strong>Select a country</strong><br />After choosing a currency, click on any country to view its population, capital, language, and exchange rate.</p>
  <p>📊 <strong>Accurate data</strong><br />All the information is sourced from official and reliable data providers.</p>
</div>



      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale, center }}
        width={width}
        height={height}
        style={{ backgroundColor: "#cce7ff", marginLeft: "100px" }} // örnek sağa kaydırma
      >
        {/* Sphere kaldırıldı ve Grid eklendi */}
        <Graticule stroke="#ffffff" strokeWidth={0.5} />
  
        <Geographies geography={geoUrl}>
  {({ geographies }) => (
    <>
      {geographies.map((geo) => {
        const countryName = geo.properties.name;
        const centroid = geoCentroid(geo);

        const countryData = countries.find((c) => c.name.common === countryName);
        const area = countryData?.area || 0; // km² cinsinden yüzölçümü
        const isLarge = area > 300000; // ✅ Büyük ülke filtresi (eşiği artırıp azaltabilirsin)

        const targetCurrencyCode = countryData?.currencies
          ? Object.keys(countryData.currencies)[0]
          : null;
        const baseCurrencyCode = selectedCurrency?.split(" - ")[0];

        const rate =
          targetCurrencyCode &&
          baseCurrencyCode &&
          exchangeRates?.[baseCurrencyCode] &&
          exchangeRates?.[targetCurrencyCode]
            ? exchangeRates[targetCurrencyCode] / exchangeRates[baseCurrencyCode]
            : null;

        return (
          <g key={geo.rsmKey}>
            <Geography
              geography={geo}
              onClick={() => handleCountryClick(countryName)}
              style={{
                default: { fill: "#7FA6C7", stroke: "#1B4965", strokeWidth: 0.5 },
                hover: { fill: "#0F3057", stroke: "#000", strokeWidth: 0.8 },
                pressed: { fill: "#5A8BB0", stroke: "#1B4965", strokeWidth: 0.5 },
              }}
            />
          </g>
        );
      })}
    </>
  )}
</Geographies>



      </ComposableMap>
  
      {modalVisible && (
  <div className="modal-container" onClick={closeModal}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      {isLoadingCountry || !countryInfo ? (
        <p style={{ textAlign: "center", color: "#fff", fontSize: "18px" }}>Loading...</p>
      ) : (
        <>
{countryInfo.flag && (
  <div style={{ display: "flex", alignItems: "center", marginBottom: "10px", gap: "10px" }}>
    <img
      src={countryInfo.flag}
      alt={`${countryInfo.name} flag`}
      style={{ width: "50px", height: "auto", borderRadius: "4px" }}
    />
    <h3 style={{ margin: 0 }}>{countryInfo.name}</h3>
  </div>
)}

          <p><strong>Capital:</strong> {countryInfo.capital}</p>
          <p><strong>Population:</strong> {countryInfo.population}</p>
          <p><strong>Currency:</strong> {countryInfo.currency}</p>
          <p><strong>Languages:</strong> {countryInfo.languages}</p>

          <div>
            <label><strong>Amount:</strong></label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
            />
          </div>

          <p>
            <strong>{selectedCurrency} Value in Denominations:</strong>{" "}
            {exchangeRates &&
            selectedCurrency &&
            exchangeRates[selectedCurrency.split(" - ")[0]] &&
            exchangeRates[countryInfo.currency.split(" - ")[0]]
              ? `${amount} ${selectedCurrency.split(" - ")[0]} = ${(
                  amount *
                  (exchangeRates[countryInfo.currency.split(" - ")[0]] /
                    exchangeRates[selectedCurrency.split(" - ")[0]])
                ).toFixed(2)} ${countryInfo.currency.split(" - ")[0]}`
              : "Exchange rate unavailable or unsupported"}
          </p>

          <button onClick={closeModal} className="close-button">Close</button>
        </>
      )}
    </div>
  </div>
  
)}

</div>
    </div>
    </div>
  );
}
