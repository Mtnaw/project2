'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

interface Session {
  user?: User;
}

export default function CreatePostPage() {
  const router = useRouter();
  const { data: session, status } = useSession() as { data: Session | null; status: string };
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/auth/signin');
    }
  }, [session, status, router]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    contact: '',
    supplierName: '',
    email: '',
    startDate: '',
    endDate: ''
  });
   const [isSubmitting, setIsSubmitting] = useState(false);
   const videoInputRef = useRef<HTMLInputElement>(null);
   const [isPhotoDragOver, setIsPhotoDragOver] = useState(false);
   const [isVideoDragOver, setIsVideoDragOver] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('category', formData.category);
      fd.append('price', formData.price.toString());
      fd.append('contact', formData.contact);
      fd.append('supplierName', formData.supplierName);
      fd.append('email', formData.email);
      fd.append('startDate', formData.startDate);
      fd.append('endDate', formData.endDate);

       const file = fileInputRef.current?.files?.[0];
       if (file) {
         fd.append('img', file);
       }

       const videoFile = videoInputRef.current?.files?.[0];
       if (videoFile) {
         fd.append('video', videoFile);
       }

      const response = await fetch('/api/ads/create', {
        method: 'POST',
        body: fd
      });

      if (response.ok) {
        router.push('/admin/dashboard');
      } else {
        console.error('Failed to create post');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsPhotoDragOver(true);
  };

  const handlePhotoDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsPhotoDragOver(false);
  };

  const handleVideoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsVideoDragOver(true);
  };

  const handleVideoDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsVideoDragOver(false);
  };

  const handlePhotoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsPhotoDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      const dt = new DataTransfer();
      dt.items.add(files[0]);
      if (fileInputRef.current) {
        fileInputRef.current.files = dt.files;
      }
    }
  };

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsVideoDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('video/')) {
      const dt = new DataTransfer();
      dt.items.add(files[0]);
      if (videoInputRef.current) {
        videoInputRef.current.files = dt.files;
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white-100 p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Create New Post</h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Supplier Name</label>
            <input
              type="text"
              name="supplierName"
              value={formData.supplierName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Contact</label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select a category</option>
              <option value="Construction">Construction</option>
              <option value="Decoration">Decoration</option>
              <option value="Computer Service">Computer Service</option>
              <option value="Home Keeping">Home Keeping</option>
              <option value="Education">Education</option>
              <option value="Restaurant">Restaurant</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Price ($)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="mb-4 md:col-span-2">
            <label className="block text-gray-700 mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="mb-4 md:col-span-2">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              rows={3}
              required
            />
          </div>

            <div className="mb-4 md:col-span-2">
              <label className="block text-gray-700 mb-2">Photo</label>
              <div
                onDragOver={handlePhotoDragOver}
                onDragLeave={handlePhotoDragLeave}
                onDrop={handlePhotoDrop}
                className={`w-full px-3 py-2 border-2 border-dashed rounded transition-colors ${
                  isPhotoDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  name="img"
                  accept="image/*"
                  className="w-full"
                  style={{ background: 'transparent', border: 'none' }}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Drag and drop an image here or click to select</p>
              </div>
            </div>

            <div className="mb-4 md:col-span-2">
              <label className="block text-gray-700 mb-2">Video Clip</label>
              <div
                onDragOver={handleVideoDragOver}
                onDragLeave={handleVideoDragLeave}
                onDrop={handleVideoDrop}
                className={`w-full px-3 py-2 border-2 border-dashed rounded transition-colors ${
                  isVideoDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                }`}
              >
                <input
                  type="file"
                  ref={videoInputRef}
                  name="video"
                  accept="video/*"
                  className="w-full"
                  style={{ background: 'transparent', border: 'none' }}
                />
                <p className="text-sm text-gray-500 mt-1">Drag and drop a video here or click to select</p>
              </div>
            </div>

          <div className="md:col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}