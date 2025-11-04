'use client';

import { updateProfile } from "@/lib/actions/profile";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function AdminProfilePage() {
  const { data: session } = useSession();
  const [showPassword, setShowPassword] = useState(false);

  if (!session || session.user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p>Please sign in as admin to edit profile.</p>
          <Link href="/admin/signin" className="text-blue-500 underline">Go to Sign In</Link>
        </div>
      </div>
    );
  }

  const user = session.user;

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : 'A';


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Edit Profile</h1>
        
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-xl font-bold text-gray-700 mx-auto">
              {user.image ? (
                <img 
                  src={user.image} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover" 
                />
              ) : (
                initials
              )}
            </div>
          </div>
          <div className="flex space-x-2 mb-2">
            <button
              type="button"
              className="text-blue-600 underline text-sm hover:no-underline"
            >
              Delete
            </button>
          </div>
          <input
            type="file"
            name="image"
            accept="image/*"
            className="border border-gray-300 px-3 py-1 rounded w-full text-sm"
          />
        </div>

        {/* Form Fields */}
        <form action={updateProfile} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              defaultValue={user.name || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              defaultValue={user.email || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter new password"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
          </div>

          <div className="flex justify-between pt-4">
            <Link 
              href="/admin/dashboard" 
              className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}