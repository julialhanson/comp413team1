import React, { useState } from "react";
import { generateHeatmap } from "../controllers/heatmap-controller";

type ImageUploadProps = {
  resetImage: () => void;
  imgFile: File | null;
};

const ImageUpload = ({ resetImage, imgFile }: ImageUploadProps) => {
  const [heatmapImg, setHeatmapImg] = useState<string | null>(null);

  const predictHeatmap = (imgFile: File) => {
    generateHeatmap(imgFile);
  };

  return (
    <>
      {imgFile && (
        <div className="relative">
          <img alt="" src={URL.createObjectURL(imgFile)} className="p-3" />

          <button
            className="circle-btn size-9 grey-btn absolute right-0 top-0"
            onClick={() => {
              resetImage();
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>

          <button
            className="btn blue-btn float-right"
            onClick={() =>
              generateHeatmap(imgFile).then((generatedHeatmap) => {
                setHeatmapImg(generatedHeatmap);
              })
            }
          >
            Predict
          </button>
        </div>
      )}

      {heatmapImg && <img src={heatmapImg} />}
    </>
  );
};

export default ImageUpload;
