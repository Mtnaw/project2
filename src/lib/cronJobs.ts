import cron from 'node-cron';
import fs from 'fs/promises';
import path from 'path';

const adsFilePath = path.join(process.cwd(), 'src/app/data/ads.json');

interface Ad {
  id: string;
  title: string;
  description: string;
  img: string;
  video?: string;
  additionalImages?: string[];
  additionalVideos?: string[];
  category: string;
  price: number;
  contact: string;
  supplierName: string;
  email: string;
  startDate: string;
  endDate: string;
  views: number;
  approved: boolean;
}

async function readAds(): Promise<Ad[]> {
  try {
    const data = await fs.readFile(adsFilePath, 'utf-8');
    if (!data || data.trim() === '') {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading ads:', error);
    return [];
  }
}

async function writeAds(ads: Ad[]): Promise<void> {
  try {
    await fs.writeFile(adsFilePath, JSON.stringify(ads, null, 2));
    console.log(`Auto-deletion: ${ads.length} ads remaining after cleanup`);
  } catch (error) {
    console.error('Error writing ads:', error);
  }
}

async function deleteExpiredAds(): Promise<void> {
  try {
    const ads = await readAds();
    const now = new Date();
    const expiredAds = ads.filter(ad => new Date(ad.endDate) < now);

    if (expiredAds.length === 0) {
      console.log('Auto-deletion: No expired ads found');
      return;
    }

    console.log(`Auto-deletion: Found ${expiredAds.length} expired ads`);

    // Delete associated image files
    for (const ad of expiredAds) {
      try {
        // Delete main image
        if (ad.img) {
          const imagePath = path.join(process.cwd(), 'public', ad.img);
          await fs.unlink(imagePath);
          console.log(`Auto-deletion: Deleted image ${ad.img}`);
        }

        // Delete additional images
        if (ad.additionalImages) {
          for (const additionalImage of ad.additionalImages) {
            const imagePath = path.join(process.cwd(), 'public', additionalImage);
            await fs.unlink(imagePath);
            console.log(`Auto-deletion: Deleted additional image ${additionalImage}`);
          }
        }

        // Delete additional videos
        if (ad.additionalVideos) {
          for (const additionalVideo of ad.additionalVideos) {
            const videoPath = path.join(process.cwd(), 'public', additionalVideo);
            await fs.unlink(videoPath);
            console.log(`Auto-deletion: Deleted additional video ${additionalVideo}`);
          }
        }
      } catch (fileError) {
        console.error(`Auto-deletion: Error deleting files for ad ${ad.id}:`, fileError);
      }
    }

    // Remove expired ads from the array
    const remainingAds = ads.filter(ad => new Date(ad.endDate) >= now);
    await writeAds(remainingAds);

    console.log(`Auto-deletion: Successfully deleted ${expiredAds.length} expired ads`);

  } catch (error) {
    console.error('Auto-deletion: Error during cleanup:', error);
  }
}

export function startCronJobs(): void {
  // Run every day at midnight (00:00)
  cron.schedule('0 0 * * *', () => {
    console.log('Auto-deletion: Starting daily cleanup of expired ads');
    deleteExpiredAds();
  });

  // Also run on server start to clean up any expired ads immediately
  console.log('Auto-deletion: Running initial cleanup on server start');
  deleteExpiredAds();

  console.log('Auto-deletion: Cron jobs initialized - will run daily at midnight');
}

// Export the function for manual execution if needed
export { deleteExpiredAds };