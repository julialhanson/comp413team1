import React, { useRef, useState } from "react";
import ImagePreview from "../components/image-preview";
import Container from "../components/container";
import { uploadMediaToGCP } from "../controllers/gcp-controller";
import { generateUniqueFilename } from "../utils/func-utils";
import { generateExpertHeatmap } from "../controllers/heatmap-controller";

const Predict = () => {
  const inputImage = useRef<HTMLInputElement | null>(null);
  // Define a state variable to store the selected image
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [predictedHeatmap, setPredictedHeatmap] = useState<string>();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleResetImage = () => {
    if (inputImage.current) {
      inputImage.current.value = "";
    }
    setSelectedImage(null);
    setPredictedHeatmap("");
  };

  const handlePredict = async (image: File) => {
    setIsProcessing(true);
    const newPredictedHeatmap = await generateExpertHeatmap(image);
    const heatmapUrl = newPredictedHeatmap?.heatmapUrl;
    console.log(heatmapUrl);
    setPredictedHeatmap(heatmapUrl);
    setIsProcessing(false);
  };

  return (
    <Container>
      <div className="bg-white rounded-xl p-6 flex flex-col">
        <div className="mb-2 text-center">
          <h1 className="font-bold text-xl">Generate a heatmap</h1>
          <h2 className="dark-grey">
            Upload an image of a skin lesion to visualize the most indicative
            regions, predicted with data from expert dermatologists.
          </h2>
        </div>

        <ImagePreview
          // isDisplayed={selectedImage !== null}
          resetImage={predictedHeatmap ? undefined : handleResetImage}
          imgFile={predictedHeatmap ? predictedHeatmap : selectedImage}
        />

        {!selectedImage ? (
          <label className="mt-2 cursor-pointer w-full h-96 border-dashed border-3 border-gray-300 dark-grey rounded-2xl flex flex-col items-center justify-center transition duration-200 hover:border-blue-300">
            <i className="fa-solid fa-file-image mb-3 text-3xl"></i>
            <p>Browse files to upload an image</p>
            {/* Input element to select an image file */}
            <input
              type="file"
              ref={inputImage}
              name="predictImage"
              className="btn lighter-grey-bg size-full"
              // Event handler to capture file selection and update the state
              onChange={(event) => {
                if (event.target.files) {
                  console.log(event.target.files[0]); // Log the selected file
                  setSelectedImage(event.target.files[0]); // Update the state with the selected file
                }
              }}
              hidden
            />
          </label>
        ) : (
          <div className="flex justify-between items-center">
            <p
              className={`px-3 py-1 rounded-lg text-white
                ${
                  isProcessing
                    ? "bg-orange-400"
                    : predictedHeatmap
                    ? "bg-emerald-600"
                    : ""
                }`}
            >
              {isProcessing
                ? "PROCESSING"
                : predictedHeatmap
                ? "GENERATED"
                : ""}
            </p>

            <button
              onClick={() =>
                // uploadImageToGCP(
                //   selectedImage,
                //   generateUniqueFilename(selectedImage.name)
                // )
                {
                  if (predictedHeatmap) {
                    handleResetImage();
                  } else {
                    handlePredict(selectedImage);
                  }
                }
              }
              className="btn blue-btn"
            >
              {predictedHeatmap ? "Predict again" : "Predict"}
            </button>
          </div>
        )}
      </div>
    </Container>
  );
};

export default Predict;
