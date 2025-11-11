import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const adsFilePath = path.join(process.cwd(), 'src/app/data/ads.json');

async function getAd(id: string) {
  try {
    const data = await fs.readFile(adsFilePath, 'utf-8');
    const ads = JSON.parse(data);
    const ad = ads.find((ad: any) => ad.id === id);
    if (!ad) {
      return null;
    }
    return ad;
  } catch (error) {
    console.error('Error reading ad:', error);
    return null;
  }
}

async function updateAd(id: string, formData: FormData) {
  try {
    const data = await fs.readFile(adsFilePath, 'utf-8');
    let ads = JSON.parse(data);
    const adIndex = ads.findIndex((ad: any) => ad.id === id);
    if (adIndex === -1) return false;

    const ad = ads[adIndex];
    const file = formData.get('img') as File | null;

    let imgPath = ad.img;
    if (file && file.size > 0) {
      // Handle new image upload
      const fileName = `ad-${Date.now()}-${file.name}`;
      const uploadPath = path.join(process.cwd(), 'public/uploads', fileName);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(uploadPath, buffer);
      imgPath = `/uploads/${fileName}`;
    }

    // Handle additional files
    let additionalImages: string[] = [];
    let additionalVideos: string[] = [];
    const additionalFiles = formData.getAll('additionalFiles') as File[];
    const existingAdditionalImages = formData.getAll('existingAdditionalImages') as string[];
    const existingAdditionalVideos = formData.getAll('existingAdditionalVideos') as string[];

    // Add existing files that weren't removed
    additionalImages.push(...existingAdditionalImages);
    additionalVideos.push(...existingAdditionalVideos);

    // Add new files
    if (additionalFiles && additionalFiles.length > 0) {
      for (const additionalFile of additionalFiles) {
        if (additionalFile && additionalFile.size > 0) {
          const fileName = `ad-additional-${Date.now()}-${Math.random()}-${additionalFile.name}`;
          const uploadPath = path.join(process.cwd(), 'public/uploads', fileName);
          const buffer = Buffer.from(await additionalFile.arrayBuffer());
          await fs.writeFile(uploadPath, buffer);

          const filePath = `/uploads/${fileName}`;
          if (additionalFile.type.startsWith('video/')) {
            additionalVideos.push(filePath);
          } else {
            additionalImages.push(filePath);
          }
        }
      }
    }

    // Update ad data
    ads[adIndex] = {
      ...ad,
      title: formData.get('title') || ad.title,
      description: formData.get('description') || ad.description,
      category: formData.get('category') || ad.category,
      price: parseFloat(formData.get('price') as string) || ad.price,
      contact: formData.get('contact') || ad.contact,
      supplierName: formData.get('supplierName') || ad.supplierName,
      email: formData.get('email') || ad.email,
      startDate: formData.get('startDate') || ad.startDate,
      endDate: formData.get('endDate') || ad.endDate,
      img: imgPath,
      additionalImages: additionalImages.length > 0 ? additionalImages : undefined,
      additionalVideos: additionalVideos.length > 0 ? additionalVideos : undefined
    };

    await fs.writeFile(adsFilePath, JSON.stringify(ads, null, 2));
    return true;
  } catch (error) {
    console.error('Error updating ad:', error);
    return false;
  }
}

async function deleteAd(id: string): Promise<boolean> {
  try {
    const data = await fs.readFile(adsFilePath, 'utf-8');
    let ads = JSON.parse(data);

    // Find ad to get image path
    const adIndex = ads.findIndex((ad: any) => ad.id === id);
    if (adIndex === -1) return false;

    const adToDelete = ads[adIndex];

    // Save to history
    const historyFilePath = path.join(process.cwd(), 'history', 'history.json');
    let history = [];
    try {
      const historyData = await fs.readFile(historyFilePath, 'utf-8');
      if (historyData.trim()) {
        history = JSON.parse(historyData);
      }
    } catch (err) {
      // History file doesn't exist or is empty, start with empty array
    }

    // Add deleted ad to history with deletion timestamp
    history.push({
      ...adToDelete,
      deletedAt: new Date().toISOString()
    });

    await fs.writeFile(historyFilePath, JSON.stringify(history, null, 2));

    // Delete associated image file
    const imgPath = path.join(process.cwd(), 'public', adToDelete.img);
    try {
      await fs.unlink(imgPath);
    } catch (err) {
      console.error('Error deleting image file:', err);
    }

    // Delete additional images
    if (adToDelete.additionalImages) {
      for (const img of adToDelete.additionalImages) {
        const additionalImgPath = path.join(process.cwd(), 'public', img);
        try {
          await fs.unlink(additionalImgPath);
        } catch (err) {
          console.error('Error deleting additional image file:', err);
        }
      }
    }

    // Delete additional videos
    if (adToDelete.additionalVideos) {
      for (const video of adToDelete.additionalVideos) {
        const additionalVideoPath = path.join(process.cwd(), 'public', video);
        try {
          await fs.unlink(additionalVideoPath);
        } catch (err) {
          console.error('Error deleting additional video file:', err);
        }
      }
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

export async function GET(
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

  const ad = await getAd(id);

  if (!ad) {
    return NextResponse.json(
      { error: 'Ad not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(ad);
}

export async function PUT(
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

  try {
    const formData = await request.formData();
    const success = await updateAd(id, formData);

    if (success) {
      return NextResponse.json({ message: 'Ad updated successfully' });
    }

    return NextResponse.json(
      { error: 'Ad not found or update failed' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error updating ad:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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