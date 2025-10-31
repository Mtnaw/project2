import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { imagePath } = await request.json();
    
    if (!imagePath) {
      return NextResponse.json(
        { error: 'Missing imagePath parameter' },
        { status: 400 }
      );
    }

    const fullPath = path.join(process.cwd(), 'public', imagePath);
    
    try {
      await fs.unlink(fullPath);
      return NextResponse.json({ success: true });
    } catch (err) {
      console.error('Error deleting image:', err);
      return NextResponse.json(
        { error: 'Failed to delete image' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}