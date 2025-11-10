import { NextResponse } from 'next/server';
import { deleteExpiredAds } from '@/lib/cronJobs';

export async function POST() {
  try {
    console.log('Manual cleanup: Starting cleanup of expired ads');
    await deleteExpiredAds();
    return NextResponse.json({
      success: true,
      message: 'Cleanup completed successfully'
    });
  } catch (error) {
    console.error('Manual cleanup: Error during cleanup:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to complete cleanup'
      },
      { status: 5 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to trigger manual cleanup of expired ads',
    endpoint: 'POST /api/cleanup'
  });
}