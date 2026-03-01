/**
 * Tweapi.io API client
 */

import type { Post, VideoMedia } from './types';

const TWEAPI_API_KEY = process.env.TWEAPI_API_KEY || '';
const TWEAPI_BASE_URL = process.env.TWEAPI_BASE_URL || 'https://api.tweapi.io';

/**
 * Call tweapi.io search API
 */
export async function callTweapiSearch(
  keywords: string,
  time_range: string,
  limit: number = 10
): Promise<any> {
  if (!TWEAPI_API_KEY) {
    throw new Error('TWEAPI_API_KEY not set');
  }

  const headers = {
    'x-api-key': TWEAPI_API_KEY,
    'content-type': 'application/json',
  };

  // Build search keywords (support multiple keywords, separated by space)
  const searchWords = keywords.replace(/,/g, ' ').trim();

  const payload = {
    words: searchWords,
    sortByTop: true, // 按热度排序
    count: limit, // 检索数量（API 参数名是 count，不是 limit）
  };

  const response = await fetch(`${TWEAPI_BASE_URL}/v1/twitter/tweet/search`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Tweapi.io API error: ${errorText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Call tweapi.io tweet details API
 */
export async function callTweapiTweetDetails(postUrl: string): Promise<any> {
  if (!TWEAPI_API_KEY) {
    return null;
  }

  if (!postUrl || !postUrl.startsWith('http')) {
    return null;
  }

  const headers = {
    'x-api-key': TWEAPI_API_KEY,
    'content-type': 'application/json',
  };

  const payload = {
    url: postUrl,
  };

  try {
    const response = await fetch(`${TWEAPI_BASE_URL}/v1/twitter/tweet/details`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Call tweapi.io user info API
 */
export async function callTweapiUserInfo(userUrl: string): Promise<any> {
  if (!TWEAPI_API_KEY) {
    throw new Error('TWEAPI_API_KEY not set');
  }

  if (!userUrl || !userUrl.startsWith('http')) {
    throw new Error('Invalid user URL');
  }

  const headers = {
    'x-api-key': TWEAPI_API_KEY,
    'content-type': 'application/json',
  };

  const payload = {
    url: userUrl,
  };

  const response = await fetch(`${TWEAPI_BASE_URL}/v1/twitter/user/info`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Tweapi.io API error: ${errorText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Call tweapi.io user timeline API
 */
export async function callTweapiUserTimeline(userUrl: string): Promise<any> {
  if (!TWEAPI_API_KEY) {
    throw new Error('TWEAPI_API_KEY not set');
  }

  if (!userUrl || !userUrl.startsWith('http')) {
    throw new Error('Invalid user URL');
  }

  const headers = {
    'x-api-key': TWEAPI_API_KEY,
    'content-type': 'application/json',
  };

  const payload = {
    url: userUrl,
  };

  const response = await fetch(`${TWEAPI_BASE_URL}/v1/twitter/user/timeline`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Tweapi.io API error: ${errorText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Call tweapi.io user recent tweets API with filter options
 * Uses userRecentTweetsByFilter (recommended) -> userRecent20Tweets -> timeline as fallback
 */
export async function callTweapiUserRecentTweets(
  userUrl: string,
  options?: {
    showLinks?: boolean;
    showReplies?: boolean;
    showText?: boolean;
    showPost?: boolean;
    count?: number; // Max 20
  }
): Promise<any> {
  if (!TWEAPI_API_KEY) {
    throw new Error('TWEAPI_API_KEY not set');
  }

  if (!userUrl || !userUrl.startsWith('http')) {
    throw new Error('Invalid user URL');
  }

  const headers = {
    'x-api-key': TWEAPI_API_KEY,
    'content-type': 'application/json',
  };

  // Try userRecentTweetsByFilter endpoint first (recommended API)
  try {
    const filterPayload = {
      url: userUrl,
      showLinks: options?.showLinks ?? true,
      showReplies: options?.showReplies ?? true,
      showText: options?.showText ?? true,
      showPost: options?.showPost ?? true,
      count: options?.count ?? 20, // Default to 20, max is 20
    };

    const response = await fetch(`${TWEAPI_BASE_URL}/v1/twitter/user/userRecentTweetsByFilter`, {
      method: 'POST',
      headers,
      body: JSON.stringify(filterPayload),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }

    // If 404, try userRecent20Tweets as fallback
    if (response.status === 404) {
      console.warn('userRecentTweetsByFilter endpoint not found, trying userRecent20Tweets');
      return await callTweapiUserRecentTweetsLegacy(userUrl);
    }

    // For other errors, try legacy endpoint
    const errorText = await response.text();
    console.warn(`userRecentTweetsByFilter failed: ${errorText}, trying fallback`);
    return await callTweapiUserRecentTweetsLegacy(userUrl);
  } catch (error: any) {
    // If it's a network error or 404, try legacy endpoint
    if (error.message?.includes('404') || error.message?.includes('MODULE_NOT_FOUND') || error.code === 'MODULE_NOT_FOUND') {
      console.warn('userRecentTweetsByFilter endpoint failed, trying fallback');
      return await callTweapiUserRecentTweetsLegacy(userUrl);
    }
    // For other errors, try legacy endpoint before throwing
    try {
      return await callTweapiUserRecentTweetsLegacy(userUrl);
    } catch (legacyError) {
      throw error; // Throw original error if legacy also fails
    }
  }
}

/**
 * Legacy: Call tweapi.io user recent 20 tweets API
 * Falls back to timeline endpoint if userRecent20Tweets is not available
 * @deprecated Use callTweapiUserRecentTweets instead
 */
async function callTweapiUserRecentTweetsLegacy(userUrl: string): Promise<any> {
  if (!TWEAPI_API_KEY) {
    throw new Error('TWEAPI_API_KEY not set');
  }

  if (!userUrl || !userUrl.startsWith('http')) {
    throw new Error('Invalid user URL');
  }

  const headers = {
    'x-api-key': TWEAPI_API_KEY,
    'content-type': 'application/json',
  };

  const payload = {
    url: userUrl,
  };

  // Try userRecent20Tweets endpoint
  try {
    const response = await fetch(`${TWEAPI_BASE_URL}/v1/twitter/user/userRecent20Tweets`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }

    // If 404, try timeline endpoint as fallback
    if (response.status === 404) {
      console.warn('userRecent20Tweets endpoint not found, falling back to timeline endpoint');
      return await callTweapiUserTimeline(userUrl);
    }

    // For other errors, try timeline as fallback
    const errorText = await response.text();
    console.warn(`userRecent20Tweets failed: ${errorText}, falling back to timeline`);
    return await callTweapiUserTimeline(userUrl);
  } catch (error: any) {
    // If it's a network error or 404, try timeline as fallback
    if (error.message?.includes('404') || error.message?.includes('MODULE_NOT_FOUND') || error.code === 'MODULE_NOT_FOUND') {
      console.warn('userRecent20Tweets endpoint failed, falling back to timeline endpoint');
      return await callTweapiUserTimeline(userUrl);
    }
    // For other errors, try timeline before throwing
    try {
      return await callTweapiUserTimeline(userUrl);
    } catch (timelineError) {
      throw error; // Throw original error if timeline also fails
    }
  }
}

/**
 * Parse tweapi.io response and convert to standard format
 */
export async function parseTweapiResponse(responseData: any): Promise<Post[]> {
  const postsData: Post[] = [];

  try {
    // tweapi.io response format: {code, msg, data: {list: [...], next: ...}}
    let tweets: any[] = [];

    if (Array.isArray(responseData)) {
      tweets = responseData;
    } else if (responseData && typeof responseData === 'object') {
      if ('data' in responseData) {
        const data = responseData.data;
        if (data && typeof data === 'object' && 'list' in data) {
          tweets = Array.isArray(data.list) ? data.list : [];
        } else if (Array.isArray(data)) {
          tweets = data;
        } else if (data && typeof data === 'object') {
          if ('tweets' in data) tweets = Array.isArray(data.tweets) ? data.tweets : [];
          else if ('results' in data) tweets = Array.isArray(data.results) ? data.results : [];
          else if ('statuses' in data) tweets = Array.isArray(data.statuses) ? data.statuses : [];
        }
      } else if ('tweets' in responseData) {
        tweets = Array.isArray(responseData.tweets) ? responseData.tweets : [];
      } else if ('results' in responseData) {
        tweets = Array.isArray(responseData.results) ? responseData.results : [];
      } else if ('statuses' in responseData) {
        tweets = Array.isArray(responseData.statuses) ? responseData.statuses : [];
      } else if ('list' in responseData) {
        tweets = Array.isArray(responseData.list) ? responseData.list : [];
      }
    }

    // Convert each tweet to standard format
    for (const tweet of tweets) {
      if (!tweet || typeof tweet !== 'object') continue;

      // Extract content
      const content =
        tweet.fullText || tweet.text || tweet.full_text || tweet.content || '';

      // Extract author info
      const authorInfo = tweet.tweetBy || tweet.user || tweet.author || {};
      const author =
        authorInfo.fullName || authorInfo.name || authorInfo.display_name || '';
      const authorHandleRaw =
        authorInfo.userName || authorInfo.screen_name || authorInfo.username || '';
      const authorHandle = authorHandleRaw
        ? authorHandleRaw.startsWith('@')
          ? authorHandleRaw
          : `@${authorHandleRaw}`
        : '';

      // Extract engagement data
      const likes =
        tweet.likeCount ||
        (tweet.public_metrics?.like_count ?? 0) ||
        tweet.favorite_count ||
        tweet.likes ||
        0;
      const retweets =
        tweet.retweetCount ||
        (tweet.public_metrics?.retweet_count ?? 0) ||
        tweet.retweet_count ||
        tweet.retweets ||
        0;
      const comments =
        tweet.replyCount ||
        (tweet.public_metrics?.reply_count ?? 0) ||
        tweet.reply_count ||
        tweet.comments ||
        0;
      const views =
        tweet.viewCount ||
        tweet.public_metrics?.view_count ||
        tweet.view_count ||
        tweet.views ||
        null;

      // Extract tweet ID and URL
      const tweetId = tweet.id || tweet.id_str || '';
      const username =
        authorInfo.userName || authorInfo.screen_name || authorInfo.username || '';
      let postUrl: string | undefined;
      if (tweetId && username) {
        postUrl = `https://x.com/${username}/status/${tweetId}`;
      } else if (tweet.url) {
        postUrl = tweet.url;
      }

      // Extract timestamp
      const timestamp =
        tweet.createdAt || tweet.created_at || tweet.timestamp || null;

      // Extract media (images and videos)
      const images: string[] = [];
      const videos: VideoMedia[] = [];
      const media = tweet.media;

      if (Array.isArray(media)) {
        for (const item of media) {
          if (!item || typeof item !== 'object') continue;

          const mediaType = (item.type || '').toUpperCase();

          // Handle images
          if (mediaType === 'PHOTO') {
            const mediaUrl =
              item.url ||
              item.media_url_https ||
              item.media_url ||
              item.preview_image_url;
            if (mediaUrl) {
              const normalizedUrl = normalizeTwitterImageUrl(mediaUrl);
              if (normalizedUrl && !images.includes(normalizedUrl)) {
                images.push(normalizedUrl);
              }
            }
          }
          // Handle videos
          else if (mediaType === 'VIDEO' || mediaType === 'ANIMATED_GIF' || mediaType === 'GIF') {
            const videoUrl =
              item.video_url ||
              item.videoUrl ||
              item.video_url_https ||
              item.media_url_https ||
              item.media_url ||
              postUrl;
            const thumbnailUrl =
              item.thumbnail_url ||
              item.preview_image_url ||
              item.media_url_https ||
              item.media_url ||
              item.url;
            const duration = item.duration_millis
              ? Math.floor(item.duration_millis / 1000)
              : undefined;

            if (videoUrl) {
              videos.push({
                url: videoUrl,
                thumbnail: thumbnailUrl
                  ? normalizeTwitterImageUrl(thumbnailUrl)
                  : undefined,
                duration,
              });
            }
          }
        }
      }

      // Extract additional fields
      const quotes = tweet.quoteCount || null;
      const bookmarks = tweet.bookmarkCount || null;
      const language = tweet.lang || null;
      const isVerified =
        typeof authorInfo.isVerified === 'boolean' ? authorInfo.isVerified : null;
      const authorFollowers = authorInfo.followersCount || null;

      // Build standard format post data
      const postData: Post = {
        content,
        author: author || undefined,
        author_handle: authorHandle || undefined,
        likes: Number(likes) || 0,
        comments: Number(comments) || 0,
        retweets: Number(retweets) || 0,
        views: views ? Number(views) : undefined,
        quotes: quotes ? Number(quotes) : undefined,
        bookmarks: bookmarks ? Number(bookmarks) : undefined,
        post_url: postUrl,
        timestamp: timestamp || undefined,
        images: images.length > 0 ? images : undefined,
        videos: videos.length > 0 ? videos : undefined,
        language: language || undefined,
        is_verified: isVerified,
        author_followers: authorFollowers ? Number(authorFollowers) : undefined,
      };

      postsData.push(postData);
    }

    return postsData;
  } catch (error) {
    console.error('Error parsing tweapi.io response:', error);
    return [];
  }
}

/**
 * Normalize Twitter image URL
 */
function normalizeTwitterImageUrl(url: string): string {
  if (!url) return url;
  // Handle HTML entities
  return url.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

/**
 * Sort posts by specified criteria
 */
export function sortPosts(
  posts: Post[],
  sortBy: 'likes' | 'comments' | 'retweets'
): Post[] {
  if (sortBy === 'likes') {
    return [...posts].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else if (sortBy === 'comments') {
    return [...posts].sort((a, b) => (b.comments || 0) - (a.comments || 0));
  } else if (sortBy === 'retweets') {
    return [...posts].sort((a, b) => (b.retweets || 0) - (a.retweets || 0));
  }
  return posts;
}

