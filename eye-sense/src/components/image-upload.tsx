import React, { useState } from 'react';
import { Storage } from '@google-cloud/storage';

// Initialize Google Cloud Storage
const storage = new Storage();
const bucketName = 'your-bucket-name'; // Replace with your actual bucket name

async function uploadImage(file: File): Promise<string> {
  const bucket = storage.bucket(bucketName);
  const blob = bucket.file(file.name);

  const stream = blob.createWriteStream({
    resumable: false,
    contentType: file.type,
  });

  return new Promise((resolve, reject) => {
    stream.on('error', (err) => {
      console.error('Upload error:', err);
      reject(err);
    });

    stream.on('finish', () => {
      console.log('Upload complete:', file.name);
      resolve(`https://storage.googleapis.com/${bucketName}/${file.name}`);
    });

    stream.end(file); // Assuming file is a Blob or Buffer
  });
}

const ImageUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (file) {
      try {
        const imageUrl = await uploadImage(file);
        console.log('Image uploaded to:', imageUrl);
        // Handle the image URL (e.g., save it to your database)
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={handleFileChange} accept="image/*" required />
      <button type="submit">Upload Image</button>
    </form>
  );
};

export default ImageUpload;
