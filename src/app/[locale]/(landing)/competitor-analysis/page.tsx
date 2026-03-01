'use client';

import { useState } from 'react';
import { Search, Loader2, User, Users, MessageSquare, ExternalLink, TrendingUp, Sparkles, Play, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import Image from 'next/image';

interface UserInfo {
  name: string;
  handle: string;
  description: string;
  followersCount: number;
  followingCount: number;
  tweetsCount: number;
  isVerified: boolean;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  createdAt?: string;
  location?: string;
  website?: string;
}

interface VideoMedia {
  url: string;
  thumbnail?: string;
  duration?: number;
}

interface Tweet {
  content: string;
  author?: string;
  author_handle?: string;
  likes: number;
  comments: number;
  retweets: number;
  views?: number;
  post_url?: string;
  timestamp?: string;
  images?: string[];
  videos?: VideoMedia[];
}

interface AnalysisResponse {
  userInfo: UserInfo;
  recentTweets: Tweet[];
  analysis: string;
  userUrl: string;
}

export default function CompetitorAnalysisPage() {
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!userInput.trim()) {
      setError('Please enter an X user URL or username');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/competitor-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userUrl: userInput.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const result = await response.json();
      if (result.code !== 0) {
        throw new Error(result.error || result.message || 'Analysis failed');
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl mt-24">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4 tracking-tight">Competitor Analysis</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
          Enter an X (Twitter) user URL or username to get detailed user information and analyze their marketing strategy
        </p>
      </div>

      {/* Search Section */}
      <Card className="mb-8 rounded-2xl">
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Enter X user URL (e.g., https://x.com/username) or username (e.g., @username or username)"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-11 h-12 text-base rounded-full"
            />
          </div>
          <Button onClick={handleAnalyze} disabled={loading} className="w-full h-12 rounded-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Start Analysis
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Example: <span className="text-primary cursor-pointer" onClick={() => { setUserInput('https://x.com/elonmusk'); }}>https://x.com/elonmusk</span> or <span className="text-primary cursor-pointer" onClick={() => { setUserInput('@elonmusk'); }}>@elonmusk</span>
          </p>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="mb-8 rounded-xl border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {data && (
        <div className="space-y-6">
          {/* User Info Card */}
          <Card className="rounded-2xl overflow-hidden">
            {data.userInfo.bannerImageUrl && (
              <div className="relative h-48 w-full bg-muted">
                <Image
                  src={data.userInfo.bannerImageUrl}
                  alt="Banner"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <CardContent className="pt-6">
              <div className="flex items-start gap-4 mb-4">
                {data.userInfo.profileImageUrl ? (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-background flex-shrink-0">
                    <Image
                      src={data.userInfo.profileImageUrl}
                      alt={data.userInfo.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold">{data.userInfo.name}</h2>
                    {data.userInfo.isVerified && (
                      <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                      </svg>
                    )}
                    {data.userInfo.handle && (
                      <span className="text-muted-foreground">@{data.userInfo.handle.replace('@', '')}</span>
                    )}
                  </div>
                  {data.userInfo.description && (
                    <p className="text-muted-foreground mb-3">{data.userInfo.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {data.userInfo.location && (
                      <span className="text-muted-foreground">{data.userInfo.location}</span>
                    )}
                    {data.userInfo.website && (
                      <a
                        href={data.userInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {data.userInfo.website}
                      </a>
                    )}
                    {data.userInfo.createdAt && (
                      <span className="text-muted-foreground">Joined {formatDate(data.userInfo.createdAt)}</span>
                    )}
                  </div>
                </div>
                <a
                  href={data.userUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">{formatNumber(data.userInfo.followersCount)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">{formatNumber(data.userInfo.followingCount)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Following</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">{formatNumber(data.userInfo.tweetsCount)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Tweets</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Card */}
          <Card className="rounded-2xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Marketing Strategy Analysis</CardTitle>
              </div>
              <CardDescription>AI analysis based on user information and recent tweets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-base leading-relaxed">
                  {data.analysis}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Tweets Card */}
          {data.recentTweets && data.recentTweets.length > 0 && (
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Recent Tweets ({data.recentTweets.length})</CardTitle>
                <CardDescription>Recent tweet samples used for analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.recentTweets.slice(0, 10).map((tweet, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <p className="text-sm leading-relaxed mb-3">{tweet.content}</p>
                      
                      {/* Images */}
                      {tweet.images && tweet.images.length > 0 && (() => {
                        const images = tweet.images!;
                        const imageCount = images.length;
                        return (
                          <div className={`mb-3 grid gap-2 ${
                            imageCount === 1 
                              ? 'grid-cols-1' 
                              : imageCount === 2 
                              ? 'grid-cols-2' 
                              : imageCount === 3
                              ? 'grid-cols-3'
                              : 'grid-cols-2'
                          }`}>
                            {images.slice(0, 4).map((imageUrl, imgIndex) => {
                              // Special handling for 3 images: first image spans 2 columns
                              const isFirstOfThree = imageCount === 3 && imgIndex === 0;
                              return (
                                <div
                                  key={imgIndex}
                                  className={`relative rounded-lg overflow-hidden bg-muted group cursor-pointer ${
                                    isFirstOfThree 
                                      ? 'col-span-2 aspect-video' 
                                      : imageCount === 3 && imgIndex > 0
                                      ? 'aspect-square'
                                      : 'aspect-video'
                                  }`}
                                  onClick={() => window.open(imageUrl, '_blank')}
                                >
                                  <Image
                                    src={imageUrl}
                                    alt={`Tweet image ${imgIndex + 1}`}
                                    fill
                                    className="object-cover transition-transform group-hover:scale-105"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    unoptimized
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors">
                                    <ImageIcon className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}

                      {/* Videos */}
                      {tweet.videos && tweet.videos.length > 0 && (
                        <div className="mb-3 grid gap-2 grid-cols-1">
                          {tweet.videos.map((video, vidIndex) => (
                            <a
                              key={vidIndex}
                              href={video.url || tweet.post_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative aspect-video rounded-lg overflow-hidden bg-muted group cursor-pointer block"
                            >
                              {video.thumbnail ? (
                                <>
                                  <Image
                                    src={video.thumbnail}
                                    alt={`Tweet video ${vidIndex + 1}`}
                                    fill
                                    className="object-cover transition-transform group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    unoptimized
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                                    <div className="flex items-center gap-2 text-white">
                                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                        <Play className="h-6 w-6 ml-1" fill="currentColor" />
                                      </div>
                                      {video.duration && (
                                        <span className="text-sm font-medium">
                                          {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <div className="w-12 h-12 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                                      <Play className="h-6 w-6 ml-1" fill="currentColor" />
                                    </div>
                                    <span className="text-sm">Video</span>
                                  </div>
                                </div>
                              )}
                            </a>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {tweet.likes > 0 && (
                          <span>❤️ {formatNumber(tweet.likes)}</span>
                        )}
                        {tweet.retweets > 0 && (
                          <span>🔄 {formatNumber(tweet.retweets)}</span>
                        )}
                        {tweet.comments > 0 && (
                          <span>💬 {formatNumber(tweet.comments)}</span>
                        )}
                        {tweet.post_url && (
                          <a
                            href={tweet.post_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 ml-auto"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!data && !loading && !error && (
        <Card className="rounded-2xl">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">
                Enter an X user URL or username to start analysis
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

