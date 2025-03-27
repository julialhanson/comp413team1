import React from "react";

type ImageUploadProps = {
  resetImage: () => void;
  imgFile: File | null;
};

const ImageUpload = ({ resetImage, imgFile }: ImageUploadProps) => {
  return (
    <>
      {imgFile && (
        <div className="relative">
          <img alt="" src={URL.createObjectURL(imgFile)} className="p-3" />

          <button
            className="btn size-9 grey-btn absolute right-0 top-0"
            onClick={() => {
              resetImage();
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}
    </>
  );
};

export default ImageUpload;
