'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { mockAds } from '@/app/data/mockAds';
import ProfileSidebar from '@/app/components/ProfileSidebar';

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) {
    return <div className="p-6">Please sign in to view your profile.</div>;
  }

  const ads = mockAds.slice(0, 6);

  return (
    <div>
      {/* Main Content */}
      <div className="flex gap-6 p-6">
        {/* Ads Grid */}
        <main className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {ads.map((ad) => (
              <div key={ad.id} className="border border-blue-600 rounded-lg p-4 flex flex-col items-center">
                <Image
                  src={ad.img}
                  alt={ad.title}
                  width={128}
                  height={1000}
                  className="border border-blue-600 mb-4 object-cover rounded"
                />
                <div className="border border-blue-600 p-4 mb-4 min-h-20 flex items-center justify-center bg-gray-50 w-full rounded">
                  <p className="text-center text-sm font-medium text-gray-800">{ad.title}</p>
                </div>
                <Link
                  href={`/ads/${ad.id}`}
                  className="bg-orange-400 text-white px-4 py-2 rounded hover:bg-orange-500 transition-colors self-center"
                >
                  Read more
                </Link>
              </div>
            ))}
          </div>
        </main>

        <ProfileSidebar />
      </div>
    </div>
  );
}