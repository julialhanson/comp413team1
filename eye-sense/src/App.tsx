import React, { useState } from "react";
import "./App.scss";
import ImageUpload from "./components/ImageUpload";

const App: React.FC = () => {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const handleUploadSuccess = (imageUrl: string) => {
    setUploadedImageUrl(imageUrl);
    console.log('Image uploaded successfully:', imageUrl);
  };

  const handleUploadError = (error: Error) => {
    console.error('Upload failed:', error);
    alert('Failed to upload image. Please try again.');
  };

  return (
    <div className="app-container">
      <h1>Eye Sense Image Upload</h1>
      <ImageUpload
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
      />
      {uploadedImageUrl && (
        <div className="uploaded-image">
          <h2>Uploaded Image:</h2>
          <img src={uploadedImageUrl} alt="Uploaded" />
        </div>
      )}
    </div>
  );
};

export default App;
