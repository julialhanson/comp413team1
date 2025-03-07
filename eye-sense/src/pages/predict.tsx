import React, { useRef, useState } from "react";

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
      <div className="bg-white rounded-xl p-3">
        {/* Conditionally render the selected image if it exists */}
        {selectedImage && (
          <div>
            {/* Display the selected image */}
            <img
              alt=""
              width={"250px"}
              src={URL.createObjectURL(selectedImage)}
            />
            <br /> <br />
            {/* Button to remove the selected image */}
            <button
              onClick={() => {
                handleResetImage();
                setSelectedImage(null);
              }}
            >
              Remove
            </button>
          </div>
        )}

        <br />

        {/* Input element to select an image file */}
        <input
          type="file"
          ref={inputImage}
          name="predictImage"
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
