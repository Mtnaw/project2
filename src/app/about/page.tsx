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
        <h1 className="text-3xl font-bold mb-6">About Us</h1>
        <p className="mb-4">
        ကျွန်တော်တို့ရဲ့  ဝက်ဆိုဒ် ကို ၂၀၂၅ ခုနှစ်ကစတင်ခဲ့တာဖြစ်ပါတယ်။ စတင်ခဲ့ရတဲ့ ရည်ရယ်ချက် ကတော့ မိုင်ဂျာယန် မြို့အတွင်း ကောင်းမွန်သော services center တွေကိုရရှိစေရန် ရည်ရွယ်ပြီး တည်ဆောက်ထားခြင်းဖြစ်ပါသည်။
        အင်တာနက်ကို အသုံးပြုပြီး ကြော်ငြာများကို ဤဝက်ဆိုဒ်တွင် အခမဲ့ ဝင်ကြည့်နိုင်ပါသည်။ 

        </p>

        <h2 className="text-2xl font-semibold mb-3">Expectations and Values</h2>
        <p className="mb-4">
          မျှော်မှန်းချက် - ဒီကြော်ငြာကို လုပ်ငန်းတိုင်း နှင့် မြို့တွင်းရှိပြည်သူတိုင်း လွယ်ကူစွာ အသုံးပြုနိုင်စေရန်။
          တန်ဖိုးများ - ကြော်ငြာများကို လွယ်ကူစွာ ရှာဖွေ၊ ကြည့်ရှနိုင်ဖို့ ရိုးရှင်းတဲ့ ဒီဇိုင်းပုံစံဆွဲထားပါတယ်။

        </p>

        <h2 className="text-2xl font-semibold mb-3">Our Team</h2>
        <p className="mb-4">
          <div>La Htoi  - leader</div>
          <div>Naw Li  - coder</div>
          <div>Nann Thi Thi Hein  - coder</div>
          <div>Sut Ding Awng - အဖွဲ့ဝင်</div>
          <div>Bawm Yaw - အဖွဲ့ဝင်</div>
          <div>Yaw Htung Nan - အဖွဲ့ဝင်</div>
          <div>Naw San - အဖွဲ့ဝင်</div>

        </p>

      </main>

      <ProfileSidebar isOpen={isSidebarOpen} />
    </div>
  );
}