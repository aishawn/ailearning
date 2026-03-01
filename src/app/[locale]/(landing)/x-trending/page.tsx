'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Search, Loader2, Heart, MessageCircle, Repeat2, Eye, ExternalLink, TrendingUp, Copy, Maximize2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';

interface VideoMedia {
  url: string;  // 视频 URL（通常是推文链接）
  thumbnail?: string;  // 视频缩略图 URL
  duration?: number;  // 视频时长（秒）
}

interface Post {
  content: string;
  author?: string;
  author_handle?: string;
  likes: number;
  comments: number;
  retweets: number;
  views?: number;
  quotes?: number;  // 引用推文数
  bookmarks?: number;  // 书签数
  post_url?: string;
  timestamp?: string;
  images?: string[];  // Array of image URLs
  videos?: VideoMedia[];  // Array of video media
  language?: string;  // 推文语言
  is_verified?: boolean;  // 作者是否认证
  author_followers?: number;  // 作者粉丝数
}

interface TrendingResponse {
  posts: Post[];
  keywords: string;
  time_range: string;
  sort_by: string;
  total_count: number;
}

export default function XTrendingPage() {
  const [keywords, setKeywords] = useState('');
  const [timeRange, setTimeRange] = useState<'today' | 'week'>('today');
  const [sortBy, setSortBy] = useState<'likes' | 'comments' | 'retweets'>('likes');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrendingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

  const handleSearch = async () => {
    if (!keywords.trim()) {
      setError('请输入搜索关键词');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    // 前端超时时间（毫秒），默认 6 分钟（比后端稍长）
    const FRONTEND_TIMEOUT = 360000; // 6 分钟
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FRONTEND_TIMEOUT);

    try {
      const response = await fetch('/api/x-trending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: keywords.trim(),
          time_range: timeRange,
          sort_by: sortBy,
        }),
        signal: controller.signal, // 添加超时控制
      });

      clearTimeout(timeoutId); // 请求成功，清除超时

      if (!response.ok) {
        const errorData = await response.json();
        // 检查是否是超时错误
        if (errorData.timeout) {
          throw new Error(
            `请求超时：后端处理时间超过 ${errorData.timeoutMs / 1000} 秒。请稍后重试或减少搜索范围。`
          );
        }
        throw new Error(errorData.error || 'Failed to fetch data');
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      clearTimeout(timeoutId); // 确保清除超时
      
      if (err.name === 'AbortError') {
        setError(`请求超时：处理时间超过 ${FRONTEND_TIMEOUT / 1000} 秒。请稍后重试。`);
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
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
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const handleClone = (post: Post) => {
    // 将帖子信息存储到 sessionStorage，避免 URL 过长
    const postData = {
      content: post.content,
      author: post.author,
      author_handle: post.author_handle,
      post_url: post.post_url,
      images: post.images,
      language: post.language,
      likes: post.likes,
      comments: post.comments,
      retweets: post.retweets,
      views: post.views,
      quotes: post.quotes,
      bookmarks: post.bookmarks,
      timestamp: post.timestamp,
      is_verified: post.is_verified,
      author_followers: post.author_followers,
    };
    
    sessionStorage.setItem('clone_reference_post', JSON.stringify(postData));
    // 在新标签页打开 clone 页面
    window.open('/x-trending/clone', '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl mt-24">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4 tracking-tight">X Trending Posts Analysis</h1>
        <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
          Search trending posts by keywords, filter by time range, and sort by engagement.
        </p>
      </div>

      {/* Search Section */}
      <Card className="mb-8 rounded-2xl">
        <CardContent className="pt-6">
          {/* Keywords Input */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Enter keywords, e.g.: AI, Tech, Startup..."
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-11 h-12 text-base rounded-full"
            />
          </div>

          {/* Time Range and Sort By */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium mb-2 block text-muted-foreground uppercase tracking-wide">Time Range</label>
              <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
                <TabsList className="w-full rounded-full">
                  <TabsTrigger value="today" className="flex-1 rounded-full">Today</TabsTrigger>
                  <TabsTrigger value="week" className="flex-1 rounded-full">This Week</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div>
              <label className="text-xs font-medium mb-2 block text-muted-foreground uppercase tracking-wide">Sort By</label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="likes">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      <span>By Likes</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="comments">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>By Comments</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="retweets">
                    <div className="flex items-center gap-2">
                      <Repeat2 className="h-4 w-4" />
                      <span>By Retweets</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Button */}
          <Button onClick={handleSearch} disabled={loading} className="w-full h-12 rounded-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search
              </>
            )}
          </Button>
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
          {/* Summary */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Results</CardTitle>
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">{data.total_count}</span> posts found
                </span>
              </div>
              <CardDescription className="text-xs">
                {data.keywords} • {data.time_range === 'today' ? 'Today' : 'This Week'} • {data.sort_by === 'likes' ? 'Likes' : data.sort_by === 'comments' ? 'Comments' : 'Retweets'}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Posts List */}
          {data.posts.length > 0 ? (
            <div className="space-y-4">
              {data.posts.map((post, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow rounded-2xl">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Post Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {post.author && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{post.author}</span>
                              {post.is_verified && (
                                <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                                </svg>
                              )}
                              {post.author_handle && (
                                <span className="text-muted-foreground text-sm">{post.author_handle}</span>
                              )}
                              {post.author_followers && (
                                <span className="text-xs text-muted-foreground">
                                  • {formatNumber(post.author_followers)} followers
                                </span>
                              )}
                            </div>
                          )}
                          {post.timestamp && (
                            <p className="text-xs text-muted-foreground mb-2">{formatDate(post.timestamp)}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleClone(post)}
                            className="h-8 w-8 rounded-full"
                            title="Clone this post"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          {post.post_url && (
                            <a
                              href={post.post_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="prose prose-sm max-w-none">
                        <p className="text-base leading-relaxed whitespace-pre-wrap">{post.content}</p>
                      </div>

                      {/* Post Images */}
                      {post.images && post.images.length > 0 && (
                        <div className="space-y-2">
                          <div className={`grid gap-2 ${
                            post.images.length === 1 
                              ? 'grid-cols-1' 
                              : post.images.length === 2 
                              ? 'grid-cols-2' 
                              : 'grid-cols-2'
                          }`}>
                            {post.images.map((imageUrl, imgIndex) => (
                              <div
                                key={imgIndex}
                                className="relative group overflow-hidden rounded-xl bg-muted w-full min-h-[300px] flex items-center justify-center cursor-pointer"
                                onClick={() => setSelectedMedia({ url: imageUrl, type: 'image' })}
                              >
                                <Image
                                  src={imageUrl}
                                  alt={`Post image ${imgIndex + 1}`}
                                  fill
                                  className="object-contain transition-transform group-hover:scale-105"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  onError={(e) => {
                                    // Show placeholder when image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Image failed to load</div>';
                                    }
                                  }}
                                />
                                <div
                                  className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors"
                                  title="Click to view full image"
                                >
                                  <Maximize2 className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Post Videos */}
                      {post.videos && post.videos.length > 0 && (
                        <div className="space-y-2">
                          <div className={`grid gap-2 ${
                            post.videos.length === 1 
                              ? 'grid-cols-1' 
                              : 'grid-cols-2'
                          }`}>
                            {post.videos.map((video, videoIndex) => {
                              // Check if video URL is a direct video URL (R2 or other CDN) or a tweet link
                              const isDirectVideoUrl = video.url && 
                                !video.url.includes('twitter.com') && 
                                !video.url.includes('x.com');
                              
                              return (
                                <div
                                  key={videoIndex}
                                  className="relative group overflow-hidden rounded-xl bg-muted w-full min-h-[300px] flex items-center justify-center"
                                >
                                  {isDirectVideoUrl ? (
                                    // Direct video URL - show video player
                                    <video
                                      src={video.url}
                                      controls
                                      className="w-full h-full object-contain rounded-xl"
                                      poster={video.thumbnail}
                                    >
                                      Your browser does not support the video tag.
                                    </video>
                                  ) : (
                                    // Tweet link - show thumbnail with play button
                                    <div
                                      className="w-full h-full cursor-pointer"
                                      onClick={() => {
                                        if (video.url) {
                                          // If it's a tweet link, open in new tab
                                          if (video.url.includes('twitter.com') || video.url.includes('x.com')) {
                                            window.open(video.url, '_blank', 'noopener,noreferrer');
                                          } else {
                                            // Otherwise, open in dialog
                                            setSelectedMedia({ url: video.url, type: 'video' });
                                          }
                                        }
                                      }}
                                    >
                                      {video.thumbnail ? (
                                        <>
                                          <Image
                                            src={video.thumbnail}
                                            alt={`Video thumbnail ${videoIndex + 1}`}
                                            fill
                                            className="object-cover transition-transform group-hover:scale-105"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement;
                                              target.style.display = 'none';
                                            }}
                                          />
                                          {/* Play button overlay */}
                                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                                            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:bg-white transition-colors">
                                              <svg
                                                className="w-8 h-8 text-black ml-1"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path d="M8 5v14l11-7z" />
                                              </svg>
                                            </div>
                                          </div>
                                          {/* Duration badge */}
                                          {video.duration && (
                                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                                              {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                                            </div>
                                          )}
                                        </>
                                      ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                                          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center mb-2">
                                            <svg
                                              className="w-8 h-8 text-black ml-1"
                                              fill="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path d="M8 5v14l11-7z" />
                                            </svg>
                                          </div>
                                          <span className="text-sm text-muted-foreground">Click to view video</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Post Stats */}
                      <div className="space-y-2 pt-4 border-t">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-medium">{formatNumber(post.likes)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">{formatNumber(post.comments)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Repeat2 className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">{formatNumber(post.retweets)}</span>
                          </div>
                          {post.quotes !== undefined && post.quotes > 0 && (
                            <div className="flex items-center gap-2">
                              <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                              </svg>
                              <span className="text-sm font-medium text-purple-500">{formatNumber(post.quotes)}</span>
                            </div>
                          )}
                          {post.bookmarks !== undefined && post.bookmarks > 0 && (
                            <div className="flex items-center gap-2">
                              <svg className="h-4 w-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                              </svg>
                              <span className="text-sm font-medium text-yellow-500">{formatNumber(post.bookmarks)}</span>
                            </div>
                          )}
                          {post.views && (
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{formatNumber(post.views)}</span>
                            </div>
                          )}
                          {post.language && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-muted">
                                {post.language.toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="rounded-2xl">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground text-sm">
                  No posts found. Try different keywords.
                </p>
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
                Enter keywords to start searching
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Media Viewer Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={(open) => !open && setSelectedMedia(null)}>
        <DialogContent className="max-w-[95vw] w-auto h-auto p-0 bg-black border-0">
          {selectedMedia && (
            <div className="relative w-full max-h-[90vh] flex items-center justify-center">
              {selectedMedia.type === 'image' ? (
                <Image
                  src={selectedMedia.url}
                  alt="Full size image"
                  width={1920}
                  height={1080}
                  className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
                  unoptimized
                />
              ) : (
                <video
                  src={selectedMedia.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-[90vh] w-auto h-auto"
                  playsInline
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

