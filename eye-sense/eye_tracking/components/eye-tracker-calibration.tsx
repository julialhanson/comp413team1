import React, { useEffect } from "react";
import "../eye-tracker.scss";

const EyeTrackerCalibration = () => {
  useEffect(() => {
    // Add eye tracker libraries
    const script = document.createElement("script");

    script.src = "https://webgazer.cs.brown.edu/webgazer.js";
    document.body.appendChild(script);

    script.src = "https://cdn.jsdelivr.net/pyodide/v0.21.3/full/pyodide.js";
    document.body.appendChild(script);

    try {
      loadImageAsBase64("mountains.jpg").then((backgroundImageBase64) => {
        console.log(
          "Background image Base64 length:",
          backgroundImageBase64.length
        );

        createCalibrationDots();
        // Start WebGazer so that the webcam is active (HTTPS/localhost required)
        webgazer.begin();
        webgazer.showVideo(true).showPredictionPoints(true);
      });
    } catch (err) {
      console.error("Error loading background image:", err);
    }
  }, []);

  return (
    <>
      <div id="instructions">Click all 9 dots to calibrate...</div>
      <div id="gazeDot"></div>
      <div id="imagePhase">
        <img id="trackingImage" src="mountains.jpg" alt="Tracking Image" />
      </div>
      <img id="heatmapImg" alt="Heatmap" />
    </>
  );
};

export default EyeTrackerCalibration;
