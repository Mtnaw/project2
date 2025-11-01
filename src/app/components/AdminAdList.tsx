'use client';

import { useState } from 'react';
import { Ad } from '@/app/data/mockAds';
import Link from 'next/link';
import AdCard from './AdCard';

interface AdminAdListProps {
  ads: Ad[];
}

export default function AdminAdList({ ads }: AdminAdListProps) {
  const [showAll, setShowAll] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const displayedAds = showAll ? ads : ads.slice(0, 6);

  const handleMenuToggle = (adId: string) => {
    setActiveMenuId(activeMenuId === adId ? null : adId);
  };

  const handleMenuClose = () => {
    setActiveMenuId(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedAds.map(ad => (
          <AdCard
            key={ad.id}
            ad={ad}
            hideCategory={true}
            isMenuOpen={activeMenuId === ad.id}
            onMenuToggle={() => handleMenuToggle(ad.id)}
            onMenuClose={handleMenuClose}
          />
        ))}
      </div>
      {!showAll && ads.length > 6 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowAll(true)}
            className="text-orange-600 hover:underline text-sm"
          >
            see more...
          </button>
        </div>
      )}
    </>
  );
}