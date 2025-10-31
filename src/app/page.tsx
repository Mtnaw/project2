'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Ad } from '@/app/data/mockAds';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import HeaderWithSidebar from './components/HeaderWithSidebar';
import ProfileSidebar from './components/ProfileSidebar';
import { useSidebar } from './components/SidebarContext';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [ads, setAds] = useState<Ad[]>([]);
  const [filteredAds, setFilteredAds] = useState<Ad[]>([]);
  const [showCategories, setShowCategories] = useState(false);
  const [visibleAdsCount, setVisibleAdsCount] = useState(6);
  const [loading, setLoading] = useState(true);

  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const isAdmin = session?.user?.role === "admin";
  
  // Fetch ads
  const fetchAds = useCallback(async () => {
    try {
      const response = await fetch('/api/ads');
      const data = await response.json();
      setAds(data);
      setFilteredAds(data);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAds();

    // Listen for new ad creation events
    const handleNewAd = () => {
      fetchAds();
    };

    window.addEventListener('adCreated', handleNewAd);
    return () => {
      window.removeEventListener('adCreated', handleNewAd);
    };
  }, [fetchAds]);

  // Get unique categories
  const categories = Array.from(new Set(ads.map(ad => ad.category)));
  
  // Filter ads with debounce
  const filterAds = useCallback(() => {
    let result = [...ads];
    
    // Apply category filter
    if (selectedCategory) {
      result = result.filter(ad => ad.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(ad =>
        ad.title.toLowerCase().includes(query) ||
        ad.title.toUpperCase().includes(query) ||
        //ad.description.toLowerCase().includes(query) ||
        ad.category.toLowerCase().includes(query) ||
        ad.category.toUpperCase().includes(query)
      );
    }
    
    setFilteredAds(result);
  }, [selectedCategory, searchQuery, ads]);
  
  useEffect(() => {
    closeSidebar();
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  useEffect(() => {
    filterAds();
  }, [selectedCategory, searchQuery, filterAds]);

  if (loading) {
    return <div>Loading...</div>;
  }


  return (
    <div>
      <HeaderWithSidebar showSearch={true} searchQuery={searchQuery} onSearchChange={setSearchQuery} showCategories={showCategories} setShowCategories={setShowCategories} categories={categories} isSidebarOpen={isSidebarOpen} />

      <div className="flex gap-6 p-6">
        <main className="flex-1">
          {/* Ads Section */}
          <div className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 transition-all duration-300 ${showCategories ? 'lg:ml-64' : ''} ${isSidebarOpen ? 'lg:mr-64' : ''}`}>
            {filteredAds.slice(0, Infinity).map((ad, index) => (
              <div key={`${ad.id}-${index}`} className="border border-black-600 p-4 flex flex-col relative mb-4">
                <div className="relative mb-4">
                  <img
                    src={ad.img}
                    alt={ad.title}
                    className="w-full h-48 border border-blue-600 object-cover"
                  />
                </div>
                <div className="border border-blue-600 p-4 mb-4 min-h-20 flex flex-col items-center justify-center bg-gray-50">
                  <p className="text-center text-sm font-semibold">{ad.title}</p>
                </div>
                <Link
                  href={`/ads/${ad.id}`}
                  className="bg-orange-400 text-white px-4 py-2 rounded self-center"
                >
                  Read more
                </Link>
              </div>
            ))}
          </div>

        </main>

        <ProfileSidebar isOpen={isSidebarOpen} />
      </div>
    </div>
  );
}
