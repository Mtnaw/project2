'use client';

import { useEffect } from 'react';
import ProfileSidebar from '@/app/components/ProfileSidebar';
import { useSidebar } from '@/app/components/SidebarContext';

export default function ContactPage() {
  const { isSidebarOpen, closeSidebar } = useSidebar();

  useEffect(() => {
      closeSidebar();
  }, []);

  // Prevent scrolling when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isSidebarOpen]);
  return (
    <div className="flex gap-6 px-6 pb-6">
      <main className={`flex-1 max-w-8xl flex flex-col items-center transition-all duration-300 ${isSidebarOpen ? 'lg:mr-64' : ''}`}>
        <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
        <h2 className="text-2xl mb-6">Welcome</h2>
        <div className="text-center space-y-4">
          <div>
            <p className="text-lg font-semibold">
              For advertising inquiries, please contact us at<br />
              Email: osa2025@gmail.com<br />
              or<br />
              Phone: 18726354901
            </p>
          </div>
        </div>
      </main>

      <ProfileSidebar isOpen={isSidebarOpen} />
    </div>
  );
}