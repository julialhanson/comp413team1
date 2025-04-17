import React, { useState } from "react";
import { uploadGCPImage } from "../controllers/gcp-controller";

interface ImageUploadProps {
  onImageUploaded?: (imageUrl: string) => void;
  resetImage?: () => void;
  imgFile?: File | null;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  resetImage,
  imgFile,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setError(null);

      uploadGCPImage(selectedFile).then((data) => {
        if (onImageUploaded) {
          onImageUploaded(data.imageUrl);
        }
      });
    } catch (error) {
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      {imgFile ? (
        <div className="relative">
          <img
            src={URL.createObjectURL(imgFile)}
            alt="Preview"
            className="max-w-full h-auto rounded-lg"
          />
          {resetImage && (
            <button
              onClick={resetImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          )}
        </div>
      ) : (
        <div className="w-full">
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 transition-colors"
          >
            {isUploading ? (
              <span>Uploading...</span>
            ) : (
              <>
                <i className="fa-solid fa-cloud-upload-alt text-2xl mb-2"></i>
                <span className="block">Click to upload an image</span>
              </>
            )}
          </label>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
