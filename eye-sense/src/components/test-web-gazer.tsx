import { useEffect, useRef, useState } from "react";
import { getHeatmapFromGazeData } from "../controllers/heatmap-controller";
import "../web-gazer.scss";
import "../App.scss";
import { GazeDataCoordinate } from "../types";

import webgazer from "webgazer";
import { getFilenameFromSignedUrl } from "../utils/func-utils";
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

  const checkWebGazerIsReady = () => {
    if (window.webgazer.isReady()) {
      startTrackingPhase(); // Start tracking once ready
    } else {
      console.log("waiting");
      setTimeout(checkWebGazerIsReady, 100); // Retry every 100ms if not ready
    }
  };

  function startTrackingPhase() {
    // Start WebGazer so that the webcam is active (HTTPS/localhost required)
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
      })
      .showVideo(true)
      .showPredictionPoints(true)
      .begin();

    console.log("starting tracking");
    console.log(window.webgazer);
    setIsTracking(true);

    setTimeout(() => {
      stopTrackingPhase();
    }, 10000);
  }

  async function stopTrackingPhase() {
    console.log("stopping tracking");
    setIsTracking(false);

    window.webgazer.clearGazeListener();
    window.webgazer.showVideo(false).showPredictionPoints(false);

    document.getElementById("instructions").innerText = "Processing heatmap...";

    try {
      const width = trackingImage.current.clientWidth;
      const height = trackingImage.current.clientHeight;

      console.log("imageUrl:", imageUrl);
      const filename = getFilenameFromSignedUrl(imageUrl);

      const response = await getHeatmapFromGazeData({
        gazeData,
        width,
        height,
        filename,
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
    // while (!window.webgazer.isReady()) {
    //   setTimeout(() => {
    //     console.log("waiting");
    //   }, 1000);
    // }
    console.log("webgazer is ready");
    startTrackingPhase();
    // checkWebGazerIsReady();

    // return () => {
    //   window.webgazer.clearGazeListener();
    //   window.webgazer.pause();
    //   window.webgazer.stopVideo();
    // };
  }, []);

  return (
    <>
      <div className="w-screen h-screen absolute top-0 left-0 transparent-black-bg"></div>

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
                className={
                  `calibration-dot` + (dotsVisible[i] ? "" : " hidden")
                }
                style={{
                  left: `calc(${xPercent}% - 15px)`,
                  top: `calc(${yPercent}% - 15px)`,
                }}
                data-id={i}
                onClick={() => clickDot(i, xPercent, yPercent)}
              ></div>
            );
          })}

        {isTracking && <div ref={gazeDot} id="gazeDot"></div>}

        <img
          ref={trackingImage}
          id="trackingImage"
          src={!heatmapUrl ? imageUrl : heatmapUrl}
          alt="Tracking Image"
        />
      </div>
    </>
  );
};

export default TestWebGazer;
