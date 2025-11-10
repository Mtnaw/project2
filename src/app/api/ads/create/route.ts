import { NextResponse } from 'next/server';
import { Ad } from '@/app/data/mockAds';
import fs from 'fs/promises';
import path from 'path';

const adsFilePath = path.join(process.cwd(), 'src/app/data/ads.json');

async function readAds(): Promise<Ad[]> {
  try {
    const data = await fs.readFile(adsFilePath, 'utf-8');
    if (!data || data.trim() === '') {
      console.log('Ads file is empty, returning empty array');
      return [];
    }
    try {
      const ads = JSON.parse(data);
      console.log('Read ads for create count:', ads.length);
      return ads;
    } catch (parseError) {
      console.error('Error parsing JSON, returning empty array:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error reading ads file, returning empty array:', error);
    return [];
  }
}

async function writeAds(ads: Ad[]): Promise<void> {
  try {
    await fs.writeFile(adsFilePath, JSON.stringify(ads, null, 2));
    console.log('Wrote ads count:', ads.length); // Debug log
  } catch (error) {
    console.error('Error writing ads:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const price = parseFloat(formData.get('price') as string) || 0;
    const contact = formData.get('contact') as string;
    const supplierName = formData.get('supplierName') as string;
    const email = formData.get('email') as string;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    
    let imgPath = '';
    const file = formData.get('img') as File | null;
    if (file && file.size > 0) {
      const uploadsDir = path.join(process.cwd(), 'public/uploads');
      await fs.mkdir(uploadsDir, { recursive: true });

      const timestamp = Date.now();
      const ext = path.extname(file.name);
      const filename = `ad-${timestamp}${ext}`;
      const filepath = path.join(uploadsDir, filename);

      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filepath, buffer);
      console.log(`Image saved to: ${filepath}`);

      imgPath = `/uploads/${filename}`;
      console.log(`Image path set to: ${imgPath}`);
    } else {
      console.log('No image file uploaded');
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    // Handle additional files
    const additionalImages: string[] = [];
    const additionalVideos: string[] = [];
    const additionalFiles = formData.getAll('additionalFiles') as File[];

    for (const additionalFile of additionalFiles) {
      if (additionalFile && additionalFile.size > 0) {
        const uploadsDir = path.join(process.cwd(), 'public/uploads');
        await fs.mkdir(uploadsDir, { recursive: true });

        const timestamp = Date.now() + Math.random(); // Add randomness to avoid conflicts
        const ext = path.extname(additionalFile.name);
        const filename = `ad-additional-${timestamp}${ext}`;
        const filepath = path.join(uploadsDir, filename);

        const buffer = Buffer.from(await additionalFile.arrayBuffer());
        await fs.writeFile(filepath, buffer);

        const filePath = `/uploads/${filename}`;
        if (additionalFile.type.startsWith('video/')) {
          additionalVideos.push(filePath);
        } else {
          additionalImages.push(filePath);
        }
      }
    }
    
    const ads = await readAds();
    
    // Generate unique ID based on max existing ID
    const maxId = ads.length > 0 ? Math.max(...ads.map(ad => parseInt(ad.id))) : 0;
    const newId = (maxId + 1).toString();
    
    const newAd: Ad = {
      id: newId,
      title,
      description,
      img: imgPath,
      category,
      price,
      contact,
      supplierName,
      email,
      startDate,
      endDate,
      views: 0,
      approved: true,
      additionalImages: additionalImages.length > 0 ? additionalImages : undefined,
      additionalVideos: additionalVideos.length > 0 ? additionalVideos : undefined
    };
    
    ads.push(newAd);
    await writeAds(ads);

    // Add a 5-second delay to make the process appear more substantial
    await new Promise(resolve => setTimeout(resolve, 5000));

    return NextResponse.json(newAd, { status: 201 });
  } catch (error) {
    console.error('Error creating ad:', error);
    return NextResponse.json(
      { error: 'Failed to create ad' },
      { status: 500 }
    );
  }
}