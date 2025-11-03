"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";
import { useSession } from "next-auth/react";
import { useSidebar } from "./SidebarContext";
import { useState, useEffect } from "react";

export default function NavBar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdmin = session?.user?.role === "admin";
  const isHomePage = pathname === "/";
  const { toggleSidebar } = useSidebar();
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    const savedImage = localStorage.getItem('profileImage');
    setProfileImage(savedImage || undefined);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center py-4 h-16 bg-white shadow-lg" style={{ backgroundImage: 'url(/uploads/2n.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      <div className="flex items-center gap-4 px-8">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Online Services Advertising
        </Link>
      </div>
      <div className="flex space-x-6 px-8">
        <Link href="/" className="text-blue-600 hover:text-blue-900 text-base">
          Home
        </Link>
        
        <>
          <Link href="/contact" className="text-blue-600 hover:text-blue-900 text-base">
            Contact Us
          </Link>
          <Link href="/about" className="text-blue-600 hover:text-blue-900 text-base">
            About Us
          </Link>
        </>

        {isAdmin && (
           <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800 text-base">
             Dashboard
           </Link>
         )}

        {isAdmin && (
          <button
            onClick={toggleSidebar}
            className="text-base w-8 h-8 rounded-full flex items-center justify-center font-bold text-blue-600 hover:bg-blue-200 transition-colors"
            title="Profile"
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <span className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center">O</span>
            )}
          </button>
        )}
      </div>
    </nav>
    
  );
}