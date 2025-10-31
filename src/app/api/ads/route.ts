import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const adsFilePath = path.join(process.cwd(), 'src/app/data/ads.json');

async function readAds(): Promise<any[]> {
  try {
    const data = await fs.readFile(adsFilePath, 'utf-8');
    if (!data || data.trim() === '') {
      console.log('Ads file is empty, returning empty array');
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading ads:', error);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  const ads = await readAds();
  
  if (id) {
    const ad = ads.find(ad => ad.id === id);
    return ad
      ? NextResponse.json(ad)
      : NextResponse.json({ error: 'Ad not found' }, { status: 404 });
  }
  
  // For listing, include all fields for now (admin access)
  const allAds = ads
    // Removed approval filter to show all ads immediately
    .filter(ad => ad.approved); // Keep approved filter

  return NextResponse.json(allAds);
}