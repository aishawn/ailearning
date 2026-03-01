import { NextRequest, NextResponse } from 'next/server';
import {
  generateCacheKey,
  readCache,
  writeCache,
} from '@/lib/x-trending/cache';
import {
  callTweapiSearch,
  parseTweapiResponse,
  sortPosts,
} from '@/lib/x-trending/tweapi';
import { processImages, processVideos } from '@/lib/x-trending/media';
import type { TrendingRequest, TrendingResponse, Post } from '@/lib/x-trending/types';

/**
 * Get trending posts
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keywords, time_range = 'today', sort_by = 'likes' } = body;

    if (!keywords || !keywords.trim()) {
      return NextResponse.json(
        { error: 'Keywords parameter is required' },
        { status: 400 }
      );
    }

    const request: TrendingRequest = {
      keywords: keywords.trim(),
      time_range: time_range as 'today' | 'week',
      sort_by: sort_by as 'likes' | 'comments' | 'retweets',
    };

    // Generate cache key
    const cacheKey = generateCacheKey(
      request.keywords,
      request.time_range || 'today',
      request.sort_by || 'likes'
    );

    // Try to read from cache
    const cachedData = await readCache(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Cache miss, call API
    // Default limit to 10 posts
    const defaultLimit = 10;
    const responseData = await callTweapiSearch(
      request.keywords,
      request.time_range || 'today',
      defaultLimit
    );

    // Parse response
    let postsData = await parseTweapiResponse(responseData);

    // Sort posts (API already returns sorted by top, but we can still apply client-side sorting if needed)
    postsData = sortPosts(postsData, request.sort_by || 'likes');

    // Process posts (limit to 10 as default)
    const maxPosts = defaultLimit;
    const postsToProcess = postsData.slice(0, maxPosts);
    const processedPosts: Post[] = [];

    for (const postData of postsToProcess) {
      try {
        if (!postData.post_url) {
          continue;
        }

        // Process images (limit to 4 per post)
        const maxImagesPerPost = 4;
        let processedImages: string[] = [];
        if (postData.images && postData.images.length > 0) {
          const limitedImages = postData.images.slice(0, maxImagesPerPost);
          processedImages = await processImages(limitedImages);
        }

        // Process videos (limit to 2 per post)
        const maxVideosPerPost = 2;
        let processedVideos = postData.videos || [];
        if (processedVideos.length > 0) {
          const limitedVideos = processedVideos.slice(0, maxVideosPerPost);
          processedVideos = await processVideos(limitedVideos);
        }

        // Build post object
        const post: Post = {
          content: postData.content,
          author: postData.author,
          author_handle: postData.author_handle,
          likes: postData.likes,
          comments: postData.comments,
          retweets: postData.retweets,
          views: postData.views,
          quotes: postData.quotes,
          bookmarks: postData.bookmarks,
          post_url: postData.post_url,
          timestamp: postData.timestamp,
          images: processedImages.length > 0 ? processedImages : undefined,
          videos: processedVideos.length > 0 ? processedVideos : undefined,
          language: postData.language,
          is_verified: postData.is_verified,
          author_followers: postData.author_followers,
        };

        processedPosts.push(post);
      } catch (error) {
        console.error('Error processing post:', error);
        // Skip invalid posts
        continue;
      }
    }

    // Build response
    const response: TrendingResponse = {
      posts: processedPosts,
      keywords: request.keywords,
      time_range: request.time_range || 'today',
      sort_by: request.sort_by || 'likes',
      total_count: processedPosts.length,
    };

    // Write to cache
    await writeCache(cacheKey, response);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('API error (POST):', error);

    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        details:
          process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET method - same as POST but with query parameters
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const keywords = searchParams.get('keywords');
    const time_range = searchParams.get('time_range') || 'today';
    const sort_by = searchParams.get('sort_by') || 'likes';

    if (!keywords || !keywords.trim()) {
      return NextResponse.json(
        { error: 'Keywords parameter is required' },
        { status: 400 }
      );
    }

    // Convert GET to POST format
    const body = {
      keywords: keywords.trim(),
      time_range,
      sort_by,
    };

    // Create a new request with the body
    const newReq = new NextRequest(req.url, {
      method: 'POST',
      headers: req.headers,
      body: JSON.stringify(body),
    });

    return POST(newReq);
  } catch (error: any) {
    console.error('API error (GET):', error);

    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        details:
          process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

