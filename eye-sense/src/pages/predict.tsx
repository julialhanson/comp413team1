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
      <div className="bg-white rounded-xl p-4 flex flex-col items-center">
        <ImageUpload
          // isDisplayed={selectedImage !== null}
          resetImage={() => {
            handleResetImage();
            setSelectedImage(null);
          }}
          imgFile={selectedImage}
        />

        {/* Input element to select an image file */}
        <input
          type="file"
          ref={inputImage}
          name="predictImage"
          className="btn lighter-grey-bg"
          // Event handler to capture file selection and update the state
          onChange={(event) => {
            if (event.target.files) {
              console.log(event.target.files[0]); // Log the selected file
              setSelectedImage(event.target.files[0]); // Update the state with the selected file
            }
          }}
        />
      </div>
    </div>
  );
};

export default Predict;
