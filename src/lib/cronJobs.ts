import cron from 'node-cron';
import fs from 'fs/promises';
import path from 'path';
import nodemailer from 'nodemailer';

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

async function sendExpirationNotifications(): Promise<void> {
  try {
    const ads = await readAds();
    const now = new Date();

    // Check for ads expiring within 5 days
    const expiringSoonAds = ads.filter(ad => {
      const endDate = new Date(ad.endDate);
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 5 && diffDays >= 0;
    });

    if (expiringSoonAds.length === 0) {
      console.log('Notifications: No ads expiring within 2 days');
      return;
    }

    console.log(`Notifications: Found ${expiringSoonAds.length} ads expiring within 2 days`);

    // Create email transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send notification emails
    for (const ad of expiringSoonAds) {
      try {
        const endDate = new Date(ad.endDate);
        const diffTime = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const mailOptions = {
          from: process.env.SMTP_FROM,
          to: ad.email,
          subject: `Your ad "${ad.title}" is expiring soon`,
          text: `
Dear ${ad.supplierName},

Your advertisement "${ad.title}" is expiring in ${diffDays} day${diffDays !== 1 ? 's' : ''}.

Expiration Date: ${endDate.toLocaleDateString()}
Ad Title: ${ad.title}
Category: ${ad.category}

Please log in to your account to extend the ad if needed to avoid service interruption.

Best regards,
Online Ads Team
          `,
          html: `
            <p>Dear ${ad.supplierName},</p>

            <p>Your advertisement "<strong>${ad.title}</strong>" is expiring in <strong>${diffDays} day${diffDays !== 1 ? 's' : ''}</strong>.</p>

            <ul>
              <li><strong>Expiration Date:</strong> ${endDate.toLocaleDateString()}</li>
              <li><strong>Ad Title:</strong> ${ad.title}</li>
              <li><strong>Category:</strong> ${ad.category}</li>
            </ul>

            <p>Please log in to your account to extend the ad if needed to avoid service interruption.</p>

            <p>Best regards,<br>Online Ads Team</p>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Notifications: Sent expiration notification to ${ad.email} for ad "${ad.title}"`);

      } catch (emailError) {
        console.error(`Notifications: Error sending email to ${ad.email} for ad "${ad.title}":`, emailError);
      }
    }

    console.log(`Notifications: Successfully sent notifications for ${expiringSoonAds.length} expiring ads`);

  } catch (error) {
    console.error('Notifications: Error during notification process:', error);
  }
}

export function startCronJobs(): void {
  // Run notifications every day at 9 AM
  cron.schedule('0 9 * * *', () => {
    console.log('Notifications: Starting daily expiration notifications');
    sendExpirationNotifications();
  });

  // Run auto-deletion every day at midnight (00:00)
  cron.schedule('0 0 * * *', () => {
    console.log('Auto-deletion: Starting daily cleanup of expired ads');
    deleteExpiredAds();
  });

  // Also run on server start to clean up any expired ads immediately
  console.log('Auto-deletion: Running initial cleanup on server start');
  deleteExpiredAds();

  console.log('Cron jobs initialized - notifications at 9 AM daily, auto-deletion at midnight');
}

// Export the function for manual execution if needed
export { deleteExpiredAds };