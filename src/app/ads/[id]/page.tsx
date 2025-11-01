import { Ad } from '@/app/data/mockAds';
import Link from 'next/link';

export default async function AdDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ads?id=${id}`, {
    cache: 'no-store',
  });
  let ad: Ad | null = null;
  if (response.ok) {
    ad = await response.json();
  }

  if (!ad) {
    return <div>Ad not found</div>;
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
         <div className="md:w-1/3">
           <img src={ad.img} alt={ad.title} className="w-full h-64 object-cover rounded-xl border-2 border-gray-300" />
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
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {ad.additionalImages?.map((image, index) => (
               <div key={`image-${index}`} className="relative">
                 <img
                   src={image}
                   alt={`Additional image ${index + 1}`}
                   className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
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
     </div>
   );
 }