'use client';

import { useEffect } from 'react';
import ProfileSidebar from '@/app/components/ProfileSidebar';
import { useSidebar } from '@/app/components/SidebarContext';

export default function AboutPage() {
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
    <div className="flex gap-6 p-6">
      <main className={`flex-1 max-w-8xl text-center transition-all duration-300 ${isSidebarOpen ? 'lg:mr-64' : ''}`}>
        <h1 className="text-3xl font-bold mb-6">About Our Advertising Platform</h1>
        <p className="mb-4">
          Welcome to Online Services Advertising System, the premier platform for connecting service providers with customers.
          Our mission is to create a trusted marketplace where quality services meet eager customers.
        </p>

        <h2 className="text-2xl font-semibold mb-3">Our Story</h2>
        <p className="mb-4">
          Founded in 2023, our platform was created to solve the problem of fragmented service advertising.
          We noticed that finding reliable services online was challenging, and service providers struggled to reach their audience.
        </p>

        <h2 className="text-2xl font-semibold mb-3">How It Works</h2>
        <p className="mb-4">
          Service providers create listings showcasing their offerings.
          Customers search and filter services by category, location, and price.
          Secure messaging connects customers with providers.
          Rating system ensures quality and trust.
        </p>

        <h2 className="text-2xl font-semibold mb-3">Our Team</h2>
        <p>
          We are a dedicated team of developers, designers, and customer service professionals committed to
          making service advertising simple, effective, and trustworthy.
        </p>
      </main>

      <ProfileSidebar isOpen={isSidebarOpen} />
    </div>
  );
}