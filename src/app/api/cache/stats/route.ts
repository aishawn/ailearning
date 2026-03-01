import { NextResponse } from 'next/server';
import { getCacheStats } from '@/lib/x-trending/cache';

/**
 * Get cache statistics
 */
export async function GET() {
  try {
    const stats = await getCacheStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}

