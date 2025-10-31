'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import LogoutButton from './LogoutButton';

export default function ProfileSidebar({ isOpen = true }: { isOpen?: boolean }) {
  const { data: session, update } = useSession();
  const user = session?.user;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    image: ''
  });
  const [ads, setAds] = useState([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      const savedImage = localStorage.getItem('profileImage');
      setUserProfile({
        name: user.name || '',
        email: user.email || '',
        image: savedImage || ''
      });
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: ''
      });
      setProfileImage(savedImage || undefined);
    }

    if (user?.role === 'admin') {
      fetch('/api/ads')
        .then(res => res.json())
        .then(data => setAds(data))
        .catch(error => console.error('Error fetching ads:', error));
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const initials = userProfile.name
    ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : 'U';

  const clientsMap = new Map();
  ads.forEach((ad: any) => {
    const adDate = ad.history?.[0]?.date || ad.endDate;
    if (!clientsMap.has(ad.email)) {
      clientsMap.set(ad.email, { name: ad.supplierName, email: ad.email, lastVisit: adDate, totalPosts: 1 });
    } else {
      const client = clientsMap.get(ad.email);
      client.totalPosts += 1;
      if (new Date(adDate) > new Date(client.lastVisit)) {
        client.lastVisit = adDate;
      }
    }
  });
  const clients = Array.from(clientsMap.values());

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileInput(file);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // Update name and email
    setUserProfile(prev => ({
      ...prev,
      name: formData.name,
      email: formData.email
    }));

    // Handle profile image
    if (fileInput) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        localStorage.setItem('profileImage', base64);
        setUserProfile(prev => ({ ...prev, image: base64 }));
        setProfileImage(base64);
      };
      reader.readAsDataURL(fileInput);
    }

    // Update admin data if admin user
    if (user?.role === 'admin') {
      try {
        const response = await fetch('/api/update-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password || undefined
          })
        });
        if (!response.ok) {
          console.error('Failed to update profile');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }

    // Update session
    await update({ name: formData.name, email: formData.email });

    console.log('Updated profile:', { ...formData, profileImage: fileInput || userProfile.image });

    setIsModalOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFileInput(null);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setFormData({
      name: userProfile.name,
      email: userProfile.email,
      password: ''
    });
    setProfileImage(userProfile.image || undefined);
    setFileInput(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = () => {
    localStorage.removeItem('profileImage');
    setUserProfile(prev => ({ ...prev, image: '' }));
    setProfileImage(undefined);
    setFileInput(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openModal = () => {
    setFormData({
      name: userProfile.name,
      email: userProfile.email,
      password: ''
    });
    setProfileImage(userProfile.image || undefined);
    setFileInput(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Profile Sidebar */}
      {isOpen && (
        <aside className="fixed right-0 top-16 h-full w-64 bg-white shadow-lg z-50 p-4 overflow-y-auto transform transition-transform duration-300 ease-in-out translate-x-0" style={{ backgroundRepeat: 'no-repeat' }}>
        <div className="mb-6 flex flex-col items-center">
          {userProfile.image ? (
            <img
              src={userProfile.image}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-blue-500"
            />
           ) : (
             <img
               src="/uploads/freebg11.jpg"
               alt="Profile"
               className="w-16 h-16 rounded-full object-cover mb-2 border-2 border-blue-500"
             />
           )}
           <p className="text-sm font-medium text-gray-700 mb-1">{formData.name}</p>
         </div>

         <button
          onClick={openModal}
          className="flex items-center space-x-2 text-left p-3 mb-4 rounded hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <span className="text-gray-600">✏️</span>
          <span className="text-blue-600 font-medium">Edit profile</span>
        </button>


        <div className="mt-auto">
          <LogoutButton />
        </div>
      </aside>
      )}

      {/* Edit Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6 text-center">Edit profile</h2>

            {/* Profile Picture Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-20 h-20 mb-3">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile preview"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                    👤
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="profile-pic"
                ref={fileInputRef}
              />
              <label htmlFor="profile-pic" className="text-blue-600 underline cursor-pointer mb-2">
                Choose from gallery
              </label>
               <div className="flex space-x-4 text-sm">
                 <a href="#" onClick={() => fileInputRef.current?.click()} className="text-blue-600 underline cursor-pointer">Change profile picture</a>
                 <a href="#" onClick={handleDelete} className="text-red-600 underline cursor-pointer">Delete</a>
               </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}