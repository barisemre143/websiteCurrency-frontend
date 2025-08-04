import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";  // Eğer CSS import eksikse buraya ekle

console.log("main.jsx çalışıyor!"); // ✅ Test için ekledik

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
