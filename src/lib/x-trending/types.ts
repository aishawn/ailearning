/**
 * X Trending API Types
 */

export interface VideoMedia {
  url: string; // 视频 URL（通常是推文链接）
  thumbnail?: string; // 视频缩略图 URL
  duration?: number; // 视频时长（秒）
}

export interface Post {
  content: string;
  author?: string;
  author_handle?: string;
  likes: number;
  comments: number;
  retweets: number;
  views?: number;
  quotes?: number; // 引用推文数
  bookmarks?: number; // 书签数
  post_url?: string;
  timestamp?: string;
  images?: string[]; // 图片链接列表，支持多张图片
  videos?: VideoMedia[]; // 视频列表，支持多个视频
  language?: string; // 推文语言
  is_verified?: boolean; // 作者是否认证
  author_followers?: number; // 作者粉丝数
}

export interface TrendingRequest {
  keywords: string; // 关键词，多个关键词用逗号分隔
  time_range?: 'today' | 'week'; // "today" 或 "week"
  sort_by?: 'likes' | 'comments' | 'retweets'; // "likes" 或 "comments" 或 "retweets"
}

export interface TrendingResponse {
  posts: Post[];
  keywords: string;
  time_range: string;
  sort_by: string;
  total_count: number;
}

export interface CacheData {
  cached_at: string;
  data: TrendingResponse;
}


















