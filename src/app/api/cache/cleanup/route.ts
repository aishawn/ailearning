import { NextResponse } from 'next/server';
import { cleanupExpiredCache } from '@/lib/x-trending/cache';

/**
 * Clean up expired cache files
 */
export async function POST() {
  try {
    const cleanedCount = await cleanupExpiredCache();
    return NextResponse.json({
      message: `Cleaned up ${cleanedCount} expired cache files`,
      cleaned_count: cleanedCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}


















