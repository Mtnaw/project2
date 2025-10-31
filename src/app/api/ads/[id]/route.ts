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
    const ads = JSON.parse(data);
    console.log('Read ads for fetch:', ads.length); // Debug log
    return ads;
  } catch (error) {
    console.error('Error reading ads:', error);
    return [];
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ads = await readAds();
    const ad = ads.find((a: Ad) => a.id === params.id);

    if (!ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    return NextResponse.json(ad);
  } catch (error) {
    console.error('Error fetching ad:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ad' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    
    let imgPath: string;
    const file = formData.get('img') as File | null;
    if (file && file.size > 0) {
      const uploadsDir = path.join(process.cwd(), 'public/uploads');
      await fs.mkdir(uploadsDir, { recursive: true });
      
      const timestamp = Date.now();
      const ext = path.extname(file.name);
      const filename = `ad-${timestamp}${ext}`;
      const filepath = path.join(uploadsDir, filename);
      
      await fs.writeFile(filepath, Buffer.from(await file.arrayBuffer()));
      
      imgPath = `/uploads/${filename}`;
    } else {
      // Keep existing image if no new file
      const ads = await readAds();
      const existingAd = ads.find((a: Ad) => a.id === params.id);
      imgPath = existingAd?.img || '/file.svg';
    }
    
    const ads = await readAds();
    const adIndex = ads.findIndex((a: Ad) => a.id === params.id);
    
    if (adIndex === -1) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }
    
    const updatedAd: Ad = {
      ...ads[adIndex],
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
      views: ads[adIndex].views // Keep existing views
    };
    
    ads[adIndex] = updatedAd;
    await writeAds(ads);
    
    return NextResponse.json(updatedAd, { status: 200 });
  } catch (error) {
    console.error('Error updating ad:', error);
    return NextResponse.json(
      { error: 'Failed to update ad' },
      { status: 500 }
    );
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ads = await readAds();
    const adIndex = ads.findIndex((a: Ad) => a.id === params.id);
    
    if (adIndex === -1) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }
    
    ads.splice(adIndex, 1);
    await writeAds(ads);
    
    return NextResponse.json({ message: 'Ad deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting ad:', error);
    return NextResponse.json(
      { error: 'Failed to delete ad' },
      { status: 500 }
    );
  }
}