'use client';

import { Ad } from '@/app/data/mockAds';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import ExpirationNotification from '@/app/components/ExpirationNotification';

export default function AdDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allImages, setAllImages] = useState<string[]>([]);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  }, [allImages.length]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  useEffect(() => {
    async function fetchAd() {
      try {
        const response = await fetch(`/api/ads?id=${id}`, {
          cache: 'no-store',
        });
        if (response.ok) {
          const adData = await response.json();
          setAd(adData);

          // Collect all images (main + additional) for the lightbox
          const images = [adData.img];
          if (adData.additionalImages) {
            images.push(...adData.additionalImages);
          }
          setAllImages(images);
        } else {
          console.error('Failed to fetch ad:', response.status);
        }
      } catch (error) {
        console.error('Error fetching ad:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAd();
  }, [id]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;

      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
      }
    };

    if (lightboxOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [lightboxOpen, nextImage, prevImage, closeLightbox]);

  const openLightbox = (imageSrc: string) => {
    const index = allImages.indexOf(imageSrc);
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!ad) {
    return <div className="min-h-screen flex items-center justify-center">Ad not found</div>;
  }

  return (
    <div className="max-w-full mx-auto p-10">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back 
        </Link>
       </div>
       <h1 className="text-3xl font-bold mb-4">{ad.title}</h1>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4">
            <img
              src={ad.img}
              alt={ad.title}
              className="w-full h-64 object-cover rounded-2xl border-5 border-gray-300 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => openLightbox(ad.img)}
            />
            {ad.video && (
             <video controls className="w-full mt-4 rounded-xl border-2 border-gray-300">
               <source src={ad.video} type="video/mp4" />
               Your browser does not support the video tag.
             </video>
           )}
         </div>
        <div className="md:w-2/3">
          <div className="grid grid-cols-2 gap-4 mb-6 py-6">
            <div>
              <h3 className="font-semibold">Category</h3>
              <p>{ad.category}</p>
            </div>
            <div> 
            </div>
            <div>
              <h3 className="font-semibold">Contact</h3>
              <p>{ad.contact}</p>
            </div>
          </div>
        </div>
      </div>
       <p className="text-gray-700 mb-4 px-2 py-4">{ad.description}</p>

       {/* Additional Images and Videos */}
       {(ad.additionalImages && ad.additionalImages.length > 0) || (ad.additionalVideos && ad.additionalVideos.length > 0) ? (
         <div className="mt-8">
           <h2 className="text-2xl font-bold mb-4">Gallery</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {ad.additionalImages?.map((image, index) => (
               <div key={`image-${index}`} className="relative cursor-pointer group" onClick={() => openLightbox(image)}>
                 <img
                   src={image}
                   alt={`Additional image ${index + 1}`}
                   className="w-full h-48 object-cover rounded-lg border-2 border-gray-300 transition-transform group-hover:scale-105"
                 />
                 
               </div>
             ))}
             {ad.additionalVideos?.map((video, index) => (
               <div key={`video-${index}`} className="relative">
                 <video
                   controls
                   className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                 >
                   <source src={video} type="video/mp4" />
                   Your browser does not support the video tag.
                 </video>
               </div>
             ))}
           </div>
         </div>
       ) : null}

       {/* Lightbox Modal */}
       {lightboxOpen && (
         <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={closeLightbox}>
           <div className="relative max-w-4xl max-h-full p-4" onClick={(e) => e.stopPropagation()}>
             {/* Close button */}
             <button
               onClick={closeLightbox}
               className="absolute top-2 right-2 text-white hover:text-gray-300 z-10"
             >
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>

             {/* Main image */}
             <img
               src={allImages[currentImageIndex]}
               alt={`Gallery image ${currentImageIndex + 1}`}
               className="max-w-full max-h-[80vh] object-contain"
             />

             {/* Navigation buttons */}
             {allImages.length > 1 && (
               <>
                 <button
                   onClick={(e) => { e.stopPropagation(); prevImage(); }}
                   className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                   </svg>
                 </button>
                 <button
                   onClick={(e) => { e.stopPropagation(); nextImage(); }}
                   className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                   </svg>
                 </button>
               </>
             )}

             {/* Image counter */}
             {allImages.length > 1 && (
               <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
                 {currentImageIndex + 1} / {allImages.length}
               </div>
             )}
           </div>
         </div>
       )}
     </div>
   );
 }