import React, { useState } from "react";
import { uploadImageToGCP } from "../controllers/gcp-controller";

interface ImagePreviewProps {
  onImageUploaded?: (imageUrl: string) => void;
  resetImage?: () => void;
  imgFile?: File | string | null;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  // onImageUploaded,
  resetImage,
  imgFile: imgFile,
}) => {
  // const [isUploading, setIsUploading] = useState(false);
  // const [error, setError] = useState<string | null>(null);

  // const handleFileChange = async (
  //   event: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   const selectedFile = event.target.files?.[0];
  //   if (!selectedFile) return;

  //   try {
  //     setIsUploading(true);
  //     setError(null);

  //     uploadImageToGCP(selectedFile).then((data) => {
  //       if (onImageUploaded) {
  //         onImageUploaded(data.imageUrl);
  //       }
  //     });
  //   } catch (error) {
  //     setError("Failed to upload image. Please try again.");
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  return (
    <div className="w-full">
      {imgFile ? (
        <div className="relative">
          <img
            src={
              imgFile instanceof File ? URL.createObjectURL(imgFile) : imgFile
            }
            alt="Preview"
            className="p-3"
          />

          <button
            onClick={resetImage}
            className="circle-btn size-9 grey-btn absolute right-0 top-0"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      ) : (
        // <div className="w-full">
        //   <input
        //     type="file"
        //     onChange={handleFileChange}
        //     accept="image/*"
        //     className="hidden"
        //     id="image-upload"
        //   />
        //   <label
        //     htmlFor="image-upload"
        //     className="cursor-pointer block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 transition-colors"
        //   >
        //     {isUploading ? (
        //       <span>Uploading...</span>
        //     ) : (
        //       <>
        //         <i className="fa-solid fa-cloud-upload-alt text-2xl mb-2"></i>
        //         <span className="block">Click to upload an image</span>
        //       </>
        //     )}
        //   </label>

        //   {error && <p className="text-red-500 mt-2">{error}</p>}
        // </div>
        <></>
      )}
    </div>
  );
};

export default ImagePreview;
