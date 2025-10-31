'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Ad } from '@/app/data/mockAds';

interface AdCardProps {
  ad: Ad;
  hideCategory?: boolean;
}

export default function AdCard({ ad, hideCategory }: AdCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm relative">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img
            src={ad.img}
            alt={ad.supplierName}
            className="w-12 h-12 rounded-lg object-contain border-2 border-gray-200"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{ad.supplierName}</h3>
            {!hideCategory && <p className="text-sm text-gray-500">{ad.category}</p>}
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-700 focus:outline-none"
          >
            ⋯
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10 min-w-[80px]">
              <Link
                href={`/admin/ads/${ad.id}/edit`}
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowMenu(false)}
              >
                Edit
              </Link>
              <button
                onClick={async () => {
                  if (confirm('Are you sure you want to delete this ad?')) {
                    try {
                      const response = await fetch(`/api/ads/${ad.id}`, {
                        method: 'DELETE',
                      });
                      if (response.ok) {
                        router.refresh(); // Refresh client-side without full reload
                      } else {
                        const errorData = await response.json();
                        alert(`Failed to delete ad: ${errorData.error || 'Unknown error'}`);
                      }
                    } catch (error) {
                      alert('Network error deleting ad');
                    }
                    setShowMenu(false);
                  }
                }}
                className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="text-gray-600 mb-4 text-sm">{ad.title}</p>
      <Link href={`/ads/${ad.id}`}>
        <button className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors">
          Read more
        </button>
      </Link>
    </div>
  );
}