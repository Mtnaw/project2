'use client'

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

export default function AddAdSection() {
  const [showModal, setShowModal] = useState(false);
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { data: session, status } = useSession() as { data: Session | null; status: string };

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/signin');
    }
  }, [session, status, router]);

  const openModal = () => setShowModal(true);

  const closeModal = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    // Clean up additional files
    additionalPreviews.forEach(url => URL.revokeObjectURL(url));
    setAdditionalFiles([]);
    setAdditionalPreviews([]);
    setShowModal(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(file);
      const newUrl = URL.createObjectURL(file);
      setPreviewUrl(newUrl);
      e.target.value = ''; // Reset input to allow re-selection if needed
    }
  };

  const triggerFileInput = () => {
    if (!selectedFile) {
      fileInputRef.current?.click();
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

  const triggerAdditionalFileInput = () => {
    additionalFileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'price') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      // Append all form fields
      Object.keys(formData).forEach(key => {
        submitData.append(key, String(formData[key as keyof typeof formData]));
      });
       // Append main file if selected (overrides the string img)
       if (!selectedFile) {
         alert('Please select a main image');
         return;
       }
       submitData.append('img', selectedFile);

       // Append additional files
       additionalFiles.forEach((file, index) => {
         submitData.append('additionalFiles', file);
       });

      const response = await fetch('/api/ads/create', {
        method: 'POST',
        body: submitData
      });

      if (response.ok) {
        closeModal();
        // Dispatch event to notify other components
        window.dispatchEvent(new Event('adCreated'));
      } else {
        console.error('Failed to create ad');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <nav className="flex justify-between items-center p-2 h-12 bg-white shadow">
        <div></div> {/* Empty spacer div to balance flex layout */}
        <div className="flex space-x-6">
          <button
            onClick={openModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-bold"
          >
            + Create New Post
          </button>
        </div>
      </nav>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="mb-4">
                    {selectedFile ? (
                      <div className="flex items-center space-x-2">
                        <img
                          src={previewUrl || ''}
                          alt="Selected image preview"
                          className="w-32 h-32 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            if (previewUrl) {
                              URL.revokeObjectURL(previewUrl);
                              setPreviewUrl(null);
                            }
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={triggerFileInput}
                        className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                      >
                        <span className="text-gray-500 text-sm">Upload Photo</span>
                      </div>
                    )}
                     <input
                       type="file"
                       ref={fileInputRef}
                       onChange={handleImageSelect}
                       accept="image/*"
                       style={{ display: 'none' }}
                     />
                   </div>

                   {/* Additional Images and Videos Upload */}
                   <div className="mb-4">
                     <label className="block text-sm font-medium text-gray-700 mb-2">Additional Images & Videos (Optional)</label>
                     <div className="flex flex-wrap gap-2 mb-2">
                       {additionalPreviews.map((preview, index) => (
                         <div key={index} className="relative">
                           {additionalFiles[index]?.type.startsWith('video/') ? (
                             <video
                               src={preview}
                               className="w-20 h-20 object-cover rounded border"
                               muted
                             />
                           ) : (
                             <img
                               src={preview}
                               alt={`Additional ${index + 1}`}
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
                         onClick={triggerAdditionalFileInput}
                         className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                       >
                         <span className="text-gray-500 text-2xl">+</span>
                       </div>
                     </div>
                     <input
                       type="file"
                       ref={additionalFileInputRef}
                       onChange={handleAdditionalFileSelect}
                       accept="image/*,video/*"
                       multiple
                       style={{ display: 'none' }}
                     />
                     <p className="text-xs text-gray-500">You can upload multiple images and videos</p>
                   </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                    <input
                      type="text"
                      name="supplierName"
                      value={formData.supplierName}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          supplierName: value,
                          title: value ? `${value} Service` : ''
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          email: value,
                          contact: value
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="Construction">Construction</option>
                      <option value="Decoration">Decoration</option>
                      <option value="Computer Service">Computer Service</option>
                      <option value="Home Keeping">Home Keeping</option>
                      <option value="Education">Education</option>
                      <option value="Restaurant">Restaurant</option>
                    </select>
                  </div>
                </div>
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}