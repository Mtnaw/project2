import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const adsFilePath = path.join(process.cwd(), 'src/app/data/ads.json');

async function deleteAd(id: string): Promise<boolean> {
  try {
    const data = await fs.readFile(adsFilePath, 'utf-8');
    let ads = JSON.parse(data);
    
    // Find ad to get image path
    const adIndex = ads.findIndex((ad: any) => ad.id === id);
    if (adIndex === -1) return false;
    
    // Delete associated image file
    const imgPath = path.join(process.cwd(), 'public', ads[adIndex].img);
    try {
      await fs.unlink(imgPath);
    } catch (err) {
      console.error('Error deleting image file:', err);
    }
    
    // Remove ad from array
    ads = ads.filter((ad: any) => ad.id !== id);
    
    await fs.writeFile(adsFilePath, JSON.stringify(ads, null, 2));
    return true;
  } catch (error) {
    console.error('Error deleting ad:', error);
    return false;
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  if (!id) {
    return NextResponse.json(
      { error: 'Missing ad ID' },
      { status: 400 }
    );
  }

  const success = await deleteAd(id);
  
  if (success) {
    return NextResponse.json({ message: 'Ad deleted successfully' });
  }
  
  return NextResponse.json(
    { error: 'Ad not found or deletion failed' },
    { status: 404 }
  );
}