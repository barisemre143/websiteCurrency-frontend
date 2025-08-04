// src/utils/api.js
import axios from "axios";

// Tüm ülkeleri getir
export const fetchAllCountries = async () => {
  try {
    const response = await axios.get("https://restcountries.com/v3.1/all?fields=name,cca2,cca3,region,capital,population,currencies,languages,flags,area");
    return response.data;
  } catch (error) {
    console.error("Error fetching countries:", error);
    throw new Error("Failed to fetch countries data");
  }
};

// Belirli kıtadaki ülkeleri getir
export const fetchCountriesByRegion = async (region) => {
  try {
    const response = await axios.get(`https://restcountries.com/v3.1/region/${region}?fields=name,cca2,cca3,region,capital,population,currencies,languages,flags,area`);
    return response.data;
  } catch (error) {
    console.error("Error fetching countries by region:", error);
    throw new Error(`Failed to fetch countries for region: ${region}`);
  }
};

// Belirli ülkenin detaylı bilgilerini getir
export const fetchCountryByName = async (countryName) => {
  try {
    const response = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true&fields=name,cca2,cca3,region,capital,population,currencies,languages,flags,area`);
    return response.data[0];
  } catch (error) {
    console.error("Error fetching country by name:", error);
    throw new Error(`Failed to fetch data for country: ${countryName}`);
  }
};

// Belirli baz dövize göre döviz kurlarını getir
export const fetchExchangeRates = async (base = "USD") => {
  try {
    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${base}`);
    return response.data.rates;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    throw new Error(`Failed to fetch exchange rates for base currency: ${base}`);
  }
};

// Backend'den döviz kurları al
export const fetchBackendRates = async () => {
  try {
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const response = await axios.get(`${API_URL}/api/currency/rates`);
    return response.data.rates;
  } catch (error) {
    console.error("Error fetching backend rates:", error);
    throw new Error("Failed to fetch exchange rates from backend");
  }
};
