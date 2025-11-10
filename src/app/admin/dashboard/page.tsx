'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AddAdSection from "@/app/components/AddAdSection";
import AdCard from "@/app/components/AdCard";
import ProfileSidebar from "@/app/components/ProfileSidebar";
import ExpirationNotification from "@/app/components/ExpirationNotification";
import { useSidebar } from "@/app/components/SidebarContext";
import { isExpiringWithin2Days } from "@/lib/utils/dateUtils";

import type { Ad } from "@/app/data/mockAds";

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const { isSidebarOpen, closeSidebar } = useSidebar();

  const handleMenuToggle = (adId: string) => {
    setActiveMenuId(activeMenuId === adId ? null : adId);
  };

  const handleMenuClose = () => {
    setActiveMenuId(null);
  };

  useEffect(() => {
    closeSidebar();
    if (status === "loading") return;

    if (!session || session.user?.role !== "admin") {
      router.push("/admin/signin");
      return;
    }

    // Fetch ads data
    fetch('/api/ads')
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error(`Failed to fetch ads: ${res.status}`);
        }
      })
      .then(data => {
        setAds(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching ads:', error);
        setLoading(false);
      });
  }, [session, status, router]);

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

  if (status === "loading" || loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!session || session.user?.role !== "admin") {
    return null;
  }

  const totalViews = ads.reduce((sum, ad) => sum + ad.views, 0);
  const totalPosts = ads.length;
  const averageVisitRate = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;

  const clientsMap = new Map();
  ads.forEach(ad => {
    const existing = clientsMap.get(ad.email);
    const adDate = ad.history?.[0]?.date || ad.endDate;
    if (!existing || new Date(adDate) > new Date(existing.lastVisit)) {
      clientsMap.set(ad.email, { name: ad.supplierName, email: ad.email, lastVisit: adDate });
    }
  });
  const clients = Array.from(clientsMap.values()).sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());

  // Get ads expiring within 5 days
  const expiringAds = ads.filter(ad => isExpiringWithin2Days(ad.endDate));

  return (
    <div className="flex gap-6 p-6">
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:mr-64' : ''}`}>
        <div className="min-h-screen bg-white-100">
          <div className="max-w-6xl mx-auto p-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Views per Post</h3>
            <p className="text-3xl font-bold text-blue-600">{averageVisitRate}</p>
            <p className="text-sm text-gray-500">Average views per post</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Posts</h3>
            <p className="text-3xl font-bold text-green-600">{totalPosts}</p>
            <p className="text-sm text-gray-500">Active advertisements</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Clients</h3>
            <p className="text-3xl font-bold text-purple-600">{clients.length}</p>
            <p className="text-sm text-gray-500">Registered users</p>
          </div>
         </div>

         {/* Expiration Notifications */}
         {expiringAds.length > 0 && (
           <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8">
             <div className="px-6 py-4 border-b border-gray-200">
               <h2 className="text-xl font-semibold text-gray-900">⚠️ Expiration Alerts</h2>
                <p className="text-sm text-gray-600 mt-1">Ads expiring within 2 days</p>
             </div>
             <div className="p-6">
               {expiringAds.map((ad) => (
                 <ExpirationNotification
                   key={ad.id}
                   endDate={ad.endDate}
                   adTitle={ad.title}
                   className="mb-4 last:mb-0"
                 />
               ))}
             </div>
           </div>
         )}

         {/* Client History */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Client History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(client.lastVisit).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      
        {/* Post History */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Post History</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
            {ads.length > 0 ? (
              ads.map((ad) => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  isMenuOpen={activeMenuId === ad.id}
                  onMenuToggle={() => handleMenuToggle(ad.id)}
                  onMenuClose={handleMenuClose}
                />
              ))
            ) : (
              <p className="text-gray-500">No posts available.</p>
            )}
          </div>
        </div>
      
          <AddAdSection />
          </div>
        </div>
      </main>
      <ProfileSidebar isOpen={isSidebarOpen} />
    </div>
  );
}

export default function AdminDashboard() {
  return <DashboardContent />;
}