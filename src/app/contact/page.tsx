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
        <h1 className="text-3xl font-bold mb-4 py-5">Contact Us</h1>
        <h2 className="text-2xl font-bold mb-6">Welcome to Our Web Page</h2>
        <div className="text-center space-y-4">
          <div className="text-lg font-semibold space-y-2">
            <div>ကျွန်တော်တို့ရဲ့ Web Site မှာဆိုရင် ၂၄ နာရီ ဝင်ကြည့်ပြီး Service center တွေကိုရှာဖွေနိုင်ပါတယ်။</div>
            <div>ကျွန်တော်တို့ရဲ့  Web Site မှာကြော်ငြာများထည့်သွင်းချင်ပါကအောက်ပါ phone, email များဖြင့်ဆက်သွယ်နိုင်ပါသည်။</div>
            <div>Phone ;-  09-992334543</div>
            <div>Email;-  Nawli@email.com</div>
          </div>
        </div>
      </main>

      <ProfileSidebar isOpen={isSidebarOpen} />
    </div>
  );
}