import React from "react";

const LoadingScreen = ({ message = "Cargando..." }) => {
  return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <p>{message}</p>
    </div>
  );
};

export default LoadingScreen;
