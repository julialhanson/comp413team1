import { useEffect, useRef, useState } from "react";
import { getHeatmapFromGazeData } from "../controllers/heatmap-controller";
import "../web-gazer-styles.scss";
import { GazeDataCoordinate } from "../types";
import { loadImageAsBase64 } from "../utils/func-utils";

import webgazer from "webgazer";
window.webgazer = webgazer;

const TestWebGazer = ({ imageUrl }: { imageUrl: string | undefined }) => {
  const calibrationPoints = [
    [10, 10],
    [50, 10],
    [90, 10],
    [10, 50],
    [50, 50],
    [90, 50],
    [10, 90],
    [50, 90],
    [90, 90],
  ];
  const clicksRequired = 1;
  const gazeData: GazeDataCoordinate[] = [];

  const [currentClicks, setCurrentClicks] = useState<number[]>(
    Array(9).fill(0) // Initialize all clicks to 0
  );
  const [dotsVisible, setDotsVisible] = useState<boolean[]>(
    Array(9).fill(true)
  );
  const [isCalibrationComplete, setIsCalibrationComplete] =
    useState<boolean>(true);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [heatmapUrl, setHeatmapUrl] = useState<string | null>(null);

  const gazeDot = useRef<HTMLDivElement>(null);
  const trackingImage = useRef<HTMLImageElement>(null);

  const clickDot = (index: number, xPercent: number, yPercent: number) => {
    const x = window.innerWidth * (xPercent / 100);
    const y = window.innerHeight * (yPercent / 100);
    window.webgazer.recordScreenPosition(x, y, "click");

    const newCurrentClicks = [...currentClicks];
    newCurrentClicks[index]++;
    setCurrentClicks(newCurrentClicks);

    if (currentClicks[index] >= clicksRequired) {
      setDotsVisible((prevDotsVisible) => {
        const newDotsVisible = [...prevDotsVisible];
        newDotsVisible[index] = false;
        return newDotsVisible;
      });
    }

    if (dotsVisible.every((dot) => dot === true)) {
      setIsCalibrationComplete(true);
      setTimeout(startTrackingPhase, 10000);
    }
  };

  function startTrackingPhase() {
    console.log("starting tracking");
    setIsTracking(true);

    window.webgazer.clearGazeListener();
    window.webgazer
      .setRegression("weightedRidge")
      .setGazeListener((data, timestamp: number) => {
        console.log(data);
        if (data) {
          gazeDot.current.style.left = `${data.x}px`;
          gazeDot.current.style.top = `${data.y}px`;
          gazeData.push({ x: data.x, y: data.y, time: timestamp });
        }
      });
    // window.webgazer.showVideo(false).showPredictionPoints(false);

    setTimeout(() => {
      stopTrackingPhase();
    }, 10000);
  }

  async function stopTrackingPhase() {
    console.log("stopping tracking");
    setIsTracking(false);

    window.webgazer.clearGazeListener();
    document.getElementById("instructions").innerText = "Processing heatmap...";

    try {
      const width = trackingImage.current.clientWidth;
      const height = trackingImage.current.clientHeight;

      console.log("imageUrl:", imageUrl);

      const imageBase64 = await loadImageAsBase64(imageUrl);
      console.log("imageBase64:", imageBase64);

      const response = await getHeatmapFromGazeData({
        gazeData,
        width,
        height,
        imageBase64,
      });

      setHeatmapUrl(response.heatmapUrl);

      document.getElementById("instructions").innerText = "Heatmap generated!";
    } catch (err) {
      console.error("Error generating heatmap:", err);
      document.getElementById("instructions").innerText =
        "Error generating heatmap.";
    }
  }

  useEffect(() => {
    // Start WebGazer so that the webcam is active (HTTPS/localhost required)
    webgazer.begin();
    webgazer.showVideo(true).showPredictionPoints(true);

    startTrackingPhase();

    // return () => {
    //   window.webgazer.clearGazeListener();
    //   window.webgazer.pause();
    //   window.webgazer.stopVideo();
    // };
  }, []);

  return (
    <div className="web-gazer-container">
      <div id="instructions">
        <p>
          {isCalibrationComplete
            ? "Calibration complete. Starting tracking..."
            : "Click all 9 dots to calibrate..."}
        </p>
      </div>

      {!isCalibrationComplete &&
        calibrationPoints.map(([xPercent, yPercent], i) => {
          return (
            <div
              className={`calibration-dot` + (dotsVisible[i] ? "" : " hidden")}
              style={{
                left: `calc(${xPercent}% - 15px)`,
                top: `calc(${yPercent}% - 15px)`,
              }}
              data-id={i}
              onClick={() => clickDot(i, xPercent, yPercent)}
            ></div>
          );
        })}

      <div
        ref={gazeDot}
        id="gazeDot"
        className={isTracking ? "block" : "hidden"}
      ></div>

      {!heatmapUrl ? (
        <img
          ref={trackingImage}
          id="trackingImage"
          src={imageUrl}
          alt="Tracking Image"
        />
      ) : (
        <img id="heatmapImg" alt="Heatmap" src={heatmapUrl} />
      )}
    </div>
  );
};

export default TestWebGazer;
