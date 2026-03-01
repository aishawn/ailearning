import { NextRequest, NextResponse } from 'next/server';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

import { respData, respErr } from '@/shared/lib/resp';
import { getAllConfigs } from '@/shared/models/config';
import {
  callTweapiUserInfo,
  callTweapiUserRecentTweets,
  parseTweapiResponse,
} from '@/lib/x-trending/tweapi';

/**
 * Extract X/Twitter username from user input.
 */
function extractUsername(userInput: string): string | null {
  const trimmed = userInput.trim();
  if (!trimmed) return null;

  const hasScheme = trimmed.startsWith('http://') || trimmed.startsWith('https://');
  const looksLikeDomain =
    trimmed.includes('x.com/') ||
    trimmed.includes('twitter.com/') ||
    trimmed.includes('www.twitter.com/') ||
    trimmed.includes('mobile.twitter.com/');

  if (hasScheme || looksLikeDomain) {
    try {
      const url = new URL(hasScheme ? trimmed : `https://${trimmed}`);
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length === 0) return null;
      return parts[0];
    } catch {
      return null;
    }
  }

  const cleaned = trimmed.replace(/^@+/, '');
  const candidate = cleaned.split('/')[0];
  return candidate || null;
}

function buildProfileUrl(username: string, host: string): string {
  return `https://${host}/${username}`;
}

function shouldRetryTweapi(error: any): boolean {
  const message = `${error?.message || ''}`.toLowerCase();
  return (
    message.includes('tweapi.io api error') &&
    (message.includes('"code":500') ||
      message.includes('internal server error') ||
      message.includes('status 500'))
  );
}

async function callTweapiWithFallback<T>(
  primaryUrl: string,
  fallbackUrl: string | null,
  callFn: (url: string) => Promise<T>
): Promise<{ data: T; usedUrl: string }> {
  try {
    return { data: await callFn(primaryUrl), usedUrl: primaryUrl };
  } catch (error: any) {
    if (
      fallbackUrl &&
      fallbackUrl !== primaryUrl &&
      shouldRetryTweapi(error)
    ) {
      return { data: await callFn(fallbackUrl), usedUrl: fallbackUrl };
    }
    throw error;
  }
}

/**
 * Analyze user marketing strategy using AI
 */
async function analyzeMarketingStrategy(
  userInfo: any,
  recentTweets: any[]
): Promise<string> {
  const configs = await getAllConfigs();
  const openrouterApiKey = configs.openrouter_api_key;
  
  if (!openrouterApiKey) {
    throw new Error('openrouter_api_key is not set');
  }

  const openrouterBaseUrl = configs.openrouter_base_url;

  const openrouter = createOpenRouter({
    apiKey: openrouterApiKey,
    baseURL: openrouterBaseUrl ? openrouterBaseUrl : undefined,
  });

  // Extract user information
  const userName = userInfo?.fullName || userInfo?.name || userInfo?.display_name || 'Unknown';
  const userHandle = userInfo?.userName || userInfo?.screen_name || userInfo?.username || '';
  const userDescription = userInfo?.description || userInfo?.bio || '';
  const followersCount = userInfo?.followersCount || userInfo?.followers_count || 0;
  const followingCount = userInfo?.followingCount || userInfo?.following_count || 0;
  const tweetsCount = userInfo?.tweetsCount || userInfo?.statuses_count || 0;
  const isVerified = userInfo?.isVerified || userInfo?.verified || false;

  // Extract recent tweets content
  const tweetsContent = recentTweets.slice(0, 20).map((tweet: any) => {
    const content = tweet.fullText || tweet.text || tweet.full_text || tweet.content || '';
    const likes = tweet.likeCount || tweet.favorite_count || tweet.likes || 0;
    const retweets = tweet.retweetCount || tweet.retweet_count || tweet.retweets || 0;
    const comments = tweet.replyCount || tweet.reply_count || tweet.comments || 0;
    return {
      content: content.substring(0, 500), // Limit content length
      likes,
      retweets,
      comments,
      engagement: likes + retweets + comments,
    };
  });

  // Calculate average engagement
  const avgEngagement = tweetsContent.length > 0
    ? tweetsContent.reduce((sum: number, t: any) => sum + t.engagement, 0) / tweetsContent.length
    : 0;

  // Build analysis prompt
  const prompt = `Analyze the X (Twitter) marketing strategy for @${userHandle} (${userName}).

User: ${userName} (@${userHandle})
Followers: ${followersCount.toLocaleString()} | Tweets: ${tweetsCount.toLocaleString()} | Verified: ${isVerified ? 'Yes' : 'No'}
Bio: ${userDescription || 'None'}

Recent Tweets (${tweetsContent.length}):
${tweetsContent.map((t: any, i: number) => 
  `${i + 1}. ${t.content}\n   Engagement: ${t.engagement} (${t.likes}L/${t.retweets}RT/${t.comments}C)`
).join('\n\n')}
Avg Engagement: ${avgEngagement.toFixed(1)}

Provide a concise, focused analysis covering:

1. **Content Strategy** - Key themes, style, posting patterns
2. **Engagement Strategy** - What drives high engagement
3. **Brand Positioning** - Target audience, differentiation
4. **Key Techniques** - Effective marketing tactics used
5. **Actionable Insights** - Top 3-5 learnable strategies

Keep it brief and actionable. Focus on insights, not descriptions.`;

  try {
    const result = await generateText({
      model: openrouter.chat('google/gemini-2.5-flash-lite'), // Use cost-effective model
      prompt,
      // @ts-ignore - maxTokens is supported but type definition may be outdated
      maxTokens: 1500,
    });

    return result.text.trim();
  } catch (error: any) {
    console.error('AI analysis error:', error);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}

/**
 * POST /api/competitor-analysis
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userUrl } = body;

    if (!userUrl || !userUrl.trim()) {
      return respErr('User URL or username cannot be empty');
    }

    const username = extractUsername(userUrl);
    if (!username) {
      return respErr('Invalid user URL or username');
    }

    const primaryUrl = buildProfileUrl(username, 'twitter.com');
    const fallbackUrl = buildProfileUrl(username, 'x.com');
    let normalizedUrl = primaryUrl;

    // Fetch user info
    let userInfo: any;
    try {
      const userInfoResult = await callTweapiWithFallback(
        primaryUrl,
        fallbackUrl,
        callTweapiUserInfo
      );
      const userInfoResponse = userInfoResult.data;
      normalizedUrl = userInfoResult.usedUrl;
      
      // Parse user info from response
      if (userInfoResponse?.data) {
        userInfo = userInfoResponse.data;
      } else if (userInfoResponse?.user) {
        userInfo = userInfoResponse.user;
      } else {
        userInfo = userInfoResponse;
      }
    } catch (error: any) {
      console.error('Failed to fetch user info:', error);
      return respErr(`Failed to fetch user info: ${error.message}`);
    }

    // Fetch recent tweets
    let recentTweets: any[] = [];
    try {
      const tweetsResponse = (
        await callTweapiWithFallback(
          normalizedUrl,
          normalizedUrl === primaryUrl ? fallbackUrl : primaryUrl,
          callTweapiUserRecentTweets
        )
      ).data;
      
      // Parse tweets from response
      if (tweetsResponse?.data?.list) {
        recentTweets = tweetsResponse.data.list;
      } else if (tweetsResponse?.data && Array.isArray(tweetsResponse.data)) {
        recentTweets = tweetsResponse.data;
      } else if (Array.isArray(tweetsResponse)) {
        recentTweets = tweetsResponse;
      } else if (tweetsResponse?.tweets) {
        recentTweets = tweetsResponse.tweets;
      }

      // Parse tweets to standard format
      if (recentTweets.length > 0) {
        recentTweets = await parseTweapiResponse({ data: { list: recentTweets } });
      }
    } catch (error: any) {
      console.error('Failed to fetch recent tweets:', error);
      // Continue even if tweets fetch fails
    }

    // Analyze marketing strategy
    let analysis = '';
    try {
      analysis = await analyzeMarketingStrategy(userInfo, recentTweets);
    } catch (error: any) {
      console.error('Failed to analyze:', error);
      return respErr(`Analysis failed: ${error.message}`);
    }

    // Format user info for response
    const formattedUserInfo = {
      name: userInfo?.fullName || userInfo?.name || userInfo?.display_name || 'Unknown',
      handle: userInfo?.userName || userInfo?.screen_name || userInfo?.username || '',
      description: userInfo?.description || userInfo?.bio || '',
      followersCount: userInfo?.followersCount || userInfo?.followers_count || 0,
      followingCount: userInfo?.followingCount || userInfo?.following_count || 0,
      tweetsCount: userInfo?.tweetsCount || userInfo?.statuses_count || 0,
      isVerified: userInfo?.isVerified || userInfo?.verified || false,
      profileImageUrl: userInfo?.profileImageUrl || userInfo?.profile_image_url || '',
      bannerImageUrl: userInfo?.bannerImageUrl || userInfo?.profile_banner_url || '',
      createdAt: userInfo?.createdAt || userInfo?.created_at || '',
      location: userInfo?.location || '',
      website: userInfo?.website || userInfo?.url || '',
    };

    return respData({
      userInfo: formattedUserInfo,
      recentTweets: recentTweets.slice(0, 20), // Limit to 20 tweets
      analysis,
      userUrl: normalizedUrl,
    });
  } catch (error: any) {
    console.error('Competitor analysis error:', error);
    return NextResponse.json(
      { code: -1, message: error.message || 'Internal server error', error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

