import { Ad } from '@/app/data/mockAds';

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
    </div>
  );
}