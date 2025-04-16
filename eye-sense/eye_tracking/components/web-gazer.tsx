import React, { useEffect, useState } from "react";
import "../eye-tracker.scss";
import { loadScript } from "../utils/load-script";
import EyeTracker from "../utils/eye-tracker";
import { loadPyodide } from "pyodide";

const WebGazer = () => {
  // const [pyodide, setPyodide] = useState<any>();

  useEffect(() => {
    let webgazerInstance;

    const init = async () => {
      const webgazer = await loadScript(
        "https://webgazer.cs.brown.edu/webgazer.js",
        "webgazer"
      );

      webgazerInstance = webgazer;
      webgazerInstance
        .setGazeListener((data, timestamp) => {
          // if (data) {
          //   console.log("Gaze data:", data);
          // }
        })
        .begin();

      let pyodideInstance;
      try {
        pyodideInstance = await loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/",
        });
        // setPyodide(pyodideInstance);
      } catch (error) {
        console.error("Error loading Pyodide", error);
      }

      return [webgazerInstance, pyodideInstance];
    };

    init().then(([webgazerInstance, pyodideInstance]) => {
      const eyeTracker = new EyeTracker(webgazerInstance, pyodideInstance);
      try {
        eyeTracker
          .loadImageAsBase64("mountains.jpg")
          .then((backgroundImageBase64) => {
            console.log(
              "Background image Base64 length:",
              backgroundImageBase64.length
            );

            eyeTracker.loadPyodideAndPackages().then(async () => {
              eyeTracker.createCalibrationDots();
              eyeTracker.startTrackingPhase();
              eyeTracker.beginWebgazer();
            });
          });
      } catch (err) {
        console.error("Error loading background image:", err);
      }
    });

    return () => {
      if (webgazerInstance) {
        webgazerInstance.end(); // Clean up on unmount
      }
    };
  }, []);

  // useEffect(() => {
  //   // Add eye tracker libraries
  //   const script = document.createElement("script");

  //   // script.src = "https://webgazer.cs.brown.edu/webgazer.js";
  //   // document.body.appendChild(script);

  //   script.src = "https://cdn.jsdelivr.net/pyodide/v0.21.3/full/pyodide.js";
  //   document.body.appendChild(script);

  //   try {
  //     loadImageAsBase64("mountains.jpg").then((backgroundImageBase64) => {
  //       console.log(
  //         "Background image Base64 length:",
  //         backgroundImageBase64.length
  //       );

  //       createCalibrationDots();
  //       // Start WebGazer so that the webcam is active (HTTPS/localhost required)
  //       webgazer.begin();
  //       webgazer.showVideo(true).showPredictionPoints(true);
  //     });
  //   } catch (err) {
  //     console.error("Error loading background image:", err);
  //   }
  // }, []);

  return (
    <div className="web-gazer-container">
      <div id="instructions">Click all 9 dots to calibrate...</div>
      <div id="gazeDot"></div>
      <div id="imagePhase">
        <img id="trackingImage" src="mountains.jpg" alt="Tracking Image" />
      </div>
      <img id="heatmapImg" alt="Heatmap" />
    </div>
  );
};

export default WebGazer;
