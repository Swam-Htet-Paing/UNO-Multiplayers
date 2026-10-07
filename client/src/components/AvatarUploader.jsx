import React, { useState } from 'react';
import { Upload, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function AvatarUploader({ userId, currentAvatarUrl, onAvatarUpdated }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentAvatarUrl);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview immediately
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('userId', userId);

    try {
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      const res = await axios.post(`${serverUrl}/api/upload/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.avatarUrl) {
        onAvatarUpdated(res.data.avatarUrl);
      }
    } catch (err) {
      alert('Avatar upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative group w-24 h-24">
        <img
          src={preview || 'https://res.cloudinary.com/demo/image/upload/v1/default_avatar.png'}
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500/50 shadow-xl"
        />
        <label className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          <Camera className="w-6 h-6 text-white mb-1" />
          <span className="text-[10px] font-bold text-white uppercase">Upload</span>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
      </div>
      {uploading && <p className="text-xs text-indigo-400 font-bold animate-pulse">Uploading to Cloud Storage...</p>}
    </div>
  );
}