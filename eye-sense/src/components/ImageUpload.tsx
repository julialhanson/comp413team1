import React, { useState, ChangeEvent } from 'react';
import './ImageUpload.scss';

interface ImageUploadProps {
    onUploadSuccess: (imageUrl: string) => void;
    onUploadError: (error: Error) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUploadSuccess, onUploadError }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert('Please select a file first!');
            return;
        }

        setUploading(true);

        try {
            // Create FormData object
            const formData = new FormData();
            formData.append('file', selectedFile);

            // TODO: Replace with your backend API endpoint
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            onUploadSuccess(data.imageUrl);
            setSelectedFile(null);
        } catch (error) {
            console.error('Error uploading file:', error);
            onUploadError(error as Error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="image-upload">
            <div className="upload-container">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploading}
                    className="file-input"
                />
                {selectedFile && (
                    <div className="selected-file">
                        <p>Selected: {selectedFile.name}</p>
                        <img
                            src={URL.createObjectURL(selectedFile)}
                            alt="Preview"
                            className="preview-image"
                        />
                    </div>
                )}
                <button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className="upload-button"
                >
                    {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
            </div>
        </div>
    );
};

export default ImageUpload; 