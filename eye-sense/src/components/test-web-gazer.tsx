import { useEffect, useRef, useState } from "react";
import { getHeatmapFromGazeData } from "../controllers/heatmap-controller";
import "../web-gazer.scss";
import "../App.scss";
import { GazeDataCoordinate } from "../types";

import webgazer from "webgazer";
import {
  generateUniqueFilename,
  getFilenameFromSignedUrl,
} from "../utils/func-utils";
import { uploadMediaToGCP } from "../controllers/gcp-controller";
window.webgazer = webgazer;

const TestWebGazer = ({
  imageUrl,
  closeWebGazer,
  assignHeatmapToCurrentQuestion: assignHeatmapToQuestion,
}: {
  imageUrl: string | undefined;
  closeWebGazer: () => void;
  assignHeatmapToCurrentQuestion: (heatmapUrl: string) => void;
}) => {
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
  const [instructionsText, setInstructionsText] = useState<string>();
  const [isCalibrationComplete, setIsCalibrationComplete] =
    useState<boolean>(true);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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

  const loadWebGazer = () => {
    setInstructionsText(
      "You will get 10 seconds to view the image. Please wait while the eye tracker loads..."
    );
    setIsLoading(true);

    window.webgazer
      .showVideoPreview(true)
      .showPredictionPoints(false) // do not show gaze dot
      .setRegression("weightedRidge")
      .begin();

    setTimeout(() => {
      startTrackingPhase();
    }, 5000);
  };

  function startTrackingPhase() {
    setIsLoading(false);
    setInstructionsText("Starting tracking...");
    setIsTracking(true);

    // Start WebGazer so that the webcam is active (HTTPS/localhost required)
    window.webgazer.clearGazeListener();
    window.webgazer.setGazeListener((data, timestamp: number) => {
      console.log(data);
      if (data) {
        gazeDot.current.style.left = `${data.x}px`;
        gazeDot.current.style.top = `${data.y}px`;
        gazeData.push({ x: data.x, y: data.y - 48 - 230, time: timestamp });
        // -48 to account for header margin
        // -230 to account for webcam height
      }
    });

    console.log(window.webgazer);

    setTimeout(() => {
      stopTrackingPhase();
    }, 10000); // Track for 10 seconds
  }

  async function stopTrackingPhase() {
    console.log("stopping tracking");
    setIsTracking(false);
    setInstructionsText("Finished tracking. Processing heatmap...");

    window.webgazer.clearGazeListener();
    window.webgazer.end();
    // window.webgazer.pause().showVideo(false).showPredictionPoints(false);

    try {
      const width = trackingImage.current.scrollWidth;
      const height = trackingImage.current.scrollHeight;

      console.log("imageUrl:", imageUrl);
      const filename = getFilenameFromSignedUrl(imageUrl);

      const response = await getHeatmapFromGazeData({
        gazeData,
        width,
        height,
        filename,
      });

      const heatmapBlob = response.heatmapBlob;

      const heatmapUrl = URL.createObjectURL(heatmapBlob);
      setHeatmapUrl(heatmapUrl);
      console.log("heatmapUrl:", heatmapUrl);
      // assignHeatmapToQuestion(response.heatmapUrl);

      const heatmapFilename = `heatmap-${filename}`;
      const uniqueHeatmapFilename = generateUniqueFilename(heatmapFilename);
      const heatmapFile = new File([heatmapBlob], uniqueHeatmapFilename, {
        type: "image/png",
      });
      uploadMediaToGCP(heatmapFile, uniqueHeatmapFilename, true);

      setInstructionsText("Heatmap generated!");
    } catch (err) {
      console.error("Error generating heatmap:", err);
      setInstructionsText("Error generating heatmap.");
    }
  }

  const stopCamera = () => {
    const videoContainer: HTMLDivElement = document.getElementById(
      "webgazerVideoContainer"
    );

    // Check if the video element has a srcObject (MediaStream)
    if (videoContainer) {
      // const videoFeed: HTMLVideoElement | null =
      //   document.getElementById("webgazerVideoFeed");
      // console.log("videoFeed:", videoFeed);

      // if (videoFeed && videoFeed.srcObject) {
      //   const stream = videoFeed.srcObject;

      //   console.log("stream:", stream);

      //   // Loop through all tracks and stop them
      //   stream.getTracks().forEach((track) => track.stop());

      //   // Optionally, you can also clear the srcObject to ensure the camera is fully stopped
      //   videoFeed.srcObject = null;
      // }

      videoContainer.remove();
    }
  };

  useEffect(() => {
    // startTrackingPhase();
    loadWebGazer();

    // console.log("webgazer is ready");
    // startTrackingPhase();

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
        <div id="activities">
          <div id="instructions">
            <p>
              <span className="font-bold">Note:</span>{" "}
              {instructionsText
                ? instructionsText
                : isCalibrationComplete
                ? "Calibration complete. Starting tracking..."
                : "Click all 9 dots to calibrate..."}
            </p>
          </div>

          <div id="activity-buttons">
            {heatmapUrl && (
              <button
                onClick={() => {
                  stopCamera();
                  closeWebGazer();
                }}
                className="btn grey-btn"
              >
                Close Eye Tracker
              </button>
            )}
          </div>
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

        {isTracking && <div ref={gazeDot} id="gaze-dot"></div>}

        <div id="tracking-image-container">
          {!isLoading && (
            <img
              ref={trackingImage}
              id="tracking-image"
              src={!heatmapUrl ? imageUrl : heatmapUrl}
              alt="Tracking Image"
            />
          )}
        </div>
      </div>
    </>
  );
};

export default TestWebGazer;
