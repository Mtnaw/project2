'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  video?: string;
  additionalImages?: string[];
  additionalVideos?: string[];
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
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const [existingAdditionalImages, setExistingAdditionalImages] = useState<string[]>([]);
  const [existingAdditionalVideos, setExistingAdditionalVideos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/signin');
    }
  }, [session, status, router]);

  // Hide navbar on edit page
  useEffect(() => {
    /*const navbar = document.querySelector('nav');
    if (navbar) {
      navbar.style.display = 'none';
    }*/

    // Cleanup: show navbar when component unmounts
    return () => {
      const navbar = document.querySelector('nav');
      if (navbar) {
        navbar.style.display = '';
      }
    };
  }, []);

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
          setExistingAdditionalImages(ad.additionalImages || []);
          setExistingAdditionalVideos(ad.additionalVideos || []);
        } else {
          console.error('Failed to fetch ad:', response.status);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setNewImagePreview(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews: string[] = [];

    files.forEach(file => {
      const url = URL.createObjectURL(file);
      newPreviews.push(url);
    });

    setAdditionalFiles(prev => [...prev, ...files]);
    setAdditionalPreviews(prev => [...prev, ...newPreviews]);
    e.target.value = ''; // Reset input to allow re-selection
  };

  const removeAdditionalFile = (index: number) => {
    const fileToRemove = additionalFiles[index];
    const previewToRemove = additionalPreviews[index];

    // Revoke the object URL to free memory
    URL.revokeObjectURL(previewToRemove);

    setAdditionalFiles(prev => prev.filter((_, i) => i !== index));
    setAdditionalPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingFile = (type: 'image' | 'video', index: number) => {
    if (type === 'image') {
      setExistingAdditionalImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setExistingAdditionalVideos(prev => prev.filter((_, i) => i !== index));
    }
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

         // Delete old image if new one is uploaded
         if (currentImage) {
           try {
             const response = await fetch(`/api/ads/delete-image`, {
               method: 'POST',
               headers: {
                 'Content-Type': 'application/json',
               },
               body: JSON.stringify({ imagePath: currentImage }),
             });

             if (!response.ok) {
               console.error('Failed to delete old image');
             }
           } catch (error) {
             console.error('Error deleting old image:', error);
           }
         }
       }

       // Append additional files
       additionalFiles.forEach((additionalFile) => {
         fd.append('additionalFiles', additionalFile);
       });

       // Include existing additional files that weren't removed
       existingAdditionalImages.forEach((image) => {
         fd.append('existingAdditionalImages', image);
       });
       existingAdditionalVideos.forEach((video) => {
         fd.append('existingAdditionalVideos', video);
       });

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
    <div className="fixed inset-0 min-h-screen flex items-center justify-center bg-gray-200 bg-opacity-50 p-2 pt-25">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-center">Edit Ad</h1>
          <button
                onClick={() => router.push('/admin/dashboard')}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
          </button>
        </div>

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
              <option value="Construction">Construction</option>
              <option value="Decoration">Decoration</option>
              <option value="Computer Services">Computer Services</option>
              <option value="House Keeping">House Keeping</option>
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
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>

           {/* Additional Images and Videos Management */}
           <div className="mb-4 md:col-span-2">
             <label className="block text-sm font-medium text-gray-700 mb-2">Additional Images & Videos</label>

             {/* Existing files */}
             <div className="flex flex-wrap gap-2 mb-4">
               {existingAdditionalImages.map((image, index) => (
                 <div key={`existing-image-${index}`} className="relative">
                   <img
                     src={image}
                     alt={`Existing additional image ${index + 1}`}
                     className="w-20 h-20 object-cover rounded border"
                   />
                   <button
                     type="button"
                     onClick={() => removeExistingFile('image', index)}
                     className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                   >
                     ×
                   </button>
                 </div>
               ))}
               {existingAdditionalVideos.map((video, index) => (
                 <div key={`existing-video-${index}`} className="relative">
                   <video
                     src={video}
                     className="w-20 h-20 object-cover rounded border"
                     muted
                   />
                   <button
                     type="button"
                     onClick={() => removeExistingFile('video', index)}
                     className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                   >
                     ×
                   </button>
                 </div>
               ))}
             </div>

             {/* New files to upload */}
             <div className="flex flex-wrap gap-2 mb-2">
               {additionalPreviews.map((preview, index) => (
                 <div key={`new-${index}`} className="relative">
                   {additionalFiles[index]?.type.startsWith('video/') ? (
                     <video
                       src={preview}
                       className="w-20 h-20 object-cover rounded border"
                       muted
                     />
                   ) : (
                     <img
                       src={preview}
                       alt={`New additional ${index + 1}`}
                       className="w-20 h-20 object-cover rounded border"
                     />
                   )}
                   <button
                     type="button"
                     onClick={() => removeAdditionalFile(index)}
                     className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                   >
                     ×
                   </button>
                 </div>
               ))}
               <div
                 onClick={() => document.getElementById('additional-file-input')?.click()}
                 className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
               >
                 <span className="text-gray-500 text-2xl">+</span>
               </div>
             </div>
             <input
               id="additional-file-input"
               type="file"
               onChange={handleAdditionalFileSelect}
               accept="image/*,video/*"
               multiple
               style={{ display: 'none' }}
             />
             <p className="text-xs text-gray-500">Upload additional images and videos. Click × to remove files.</p>
           </div>

           <div className="md:col-span-2 flex justify-between mt-4">
            <button
              type="button"
              onClick={() => router.push('/admin/dashboard')}
              className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-400 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Updating...' : 'Update Ad'}
            </button>
           </div>
         </form>
       </div>
     </div>
   );
 }