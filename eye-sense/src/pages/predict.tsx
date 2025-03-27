import React, { useRef, useState } from "react";
import ImageUpload from "../components/image-upload";

const Predict = () => {
  const inputImage = useRef<HTMLInputElement | null>(null);
  // Define a state variable to store the selected image
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleResetImage = () => {
    if (inputImage.current) {
      inputImage.current.value = "";
    }
  };

  return (
    <div className="max-w-2xl ml-auto mr-auto p-5">
      <div className="bg-white rounded-xl p-6 flex flex-col items-center">
        <div className="mb-2 text-center">
          <h1 className="font-bold text-xl">Generate a heatmap</h1>
          <h2 className="dark-grey">
            Upload an image of a skin lesion to visualize the most indicative
            regions, predicted with data from expert dermatologists.
          </h2>
        </div>

        <ImageUpload
          // isDisplayed={selectedImage !== null}
          resetImage={() => {
            handleResetImage();
            setSelectedImage(null);
          }}
          imgFile={selectedImage}
        />

        {!selectedImage && (
          <label className="mt-2 cursor-pointer w-full h-96 border-dashed border-3 border-gray-300 dark-grey rounded-2xl flex flex-col items-center justify-center transition duration-200 hover:border-blue-300">
            <i className="fa-solid fa-file-image mb-3 text-3xl"></i>
            <p>Drag and drop or browse to upload an image</p>
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
        )}
      </div>
    </div>
  );
};

export default Predict;
