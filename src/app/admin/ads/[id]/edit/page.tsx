'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

interface Ad {
  id: string;
  title: string;
  description: string;
  img: string;
  category: string;
  price: number;
  contact: string;
  supplierName: string;
  email: string;
  startDate: string;
  endDate: string;
  views: number;
}

export default function EditAdPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession() as { data: Session | null; status: string };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const adId = params.id as string;

  const [formData, setFormData] = useState<Partial<Ad>>({
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
  const [currentImage, setCurrentImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/signin');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (!adId) return;

    async function fetchAd() {
      try {
        const response = await fetch(`/api/ads/${adId}`);
        if (response.ok) {
          const ad: Ad = await response.json();
          setFormData({
            title: ad.title,
            description: ad.description,
            category: ad.category,
            price: ad.price,
            contact: ad.contact,
            supplierName: ad.supplierName,
            email: ad.email,
            startDate: ad.startDate,
            endDate: ad.endDate
          });
          setCurrentImage(ad.img);
        } else {
          console.error('Failed to fetch ad');
          router.push('/admin/dashboard');
        }
      } catch (error) {
        console.error('Error fetching ad:', error);
        router.push('/admin/dashboard');
      } finally {
        setLoading(false);
      }
    }

    fetchAd();
  }, [adId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('title', formData.title || '');
      fd.append('description', formData.description || '');
      fd.append('category', formData.category || '');
      fd.append('price', (formData.price || 0).toString());
      fd.append('contact', formData.contact || '');
      fd.append('supplierName', formData.supplierName || '');
      fd.append('email', formData.email || '');
      fd.append('startDate', formData.startDate || '');
      fd.append('endDate', formData.endDate || '');

      const file = fileInputRef.current?.files?.[0];
      if (file && file.size > 0) {
        fd.append('img', file);
      }

      const response = await fetch(`/api/ads/${adId}`, {
        method: 'PUT',
        body: fd
      });

      if (response.ok) {
        router.push('/admin/dashboard');
      } else {
        console.error('Failed to update ad');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Edit Ad</h1>
        
        {currentImage && (
          <div className="mb-4 text-center">
            <img
              src={currentImage}
              alt="Current ad image"
              className="w-32 h-32 object-cover rounded mx-auto mb-2"
            />
            <p className="text-sm text-gray-500">Current image</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Supplier Name</label>
            <input
              type="text"
              name="supplierName"
              value={formData.supplierName || ''}
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
              value={formData.contact || ''}
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
              value={formData.email || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Category</label>
            <select
              name="category"
              value={formData.category || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select a category</option>
              <option value="IT Services">IT Services</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Home Services">Home Services</option>
              <option value="Education">Education</option>
              <option value="Health & Wellness">Health & Wellness</option>
              <option value="House Keeping">House Keeping</option>
              <option value="Construction">Construction</option>
              <option value="Decoration">Decoration</option>
              <option value="Computer Services">Computer Services</option>
              <option value="Restaurant">Restaurant</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate || ''}
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
              value={formData.endDate || ''}
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
              value={formData.price || ''}
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
              value={formData.title || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="mb-4 md:col-span-2">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              rows={3}
              required
            />
          </div>

          <div className="mb-4 md:col-span-2">
            <label className="block text-gray-700 mb-2">New Image (optional)</label>
            <input
              type="file"
              ref={fileInputRef}
              name="img"
              accept="image/*"
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>

          <div className="md:col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Updating...' : 'Update Ad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}