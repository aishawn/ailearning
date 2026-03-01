/**
 * Platform detection utility for video URLs
 * Based on yt-dlp supported sites: https://github.com/yt-dlp/yt-dlp
 */

export interface PlatformInfo {
  name: string;
  icon: string;
  category: 'video' | 'social' | 'streaming' | 'music' | 'other';
  supportedTypes: string[];
}

const platformPatterns: Array<{ pattern: RegExp; info: PlatformInfo }> = [
  // Video Platforms
  {
    pattern: /(?:youtube\.com|youtu\.be)/i,
    info: {
      name: 'YouTube',
      icon: '▶️',
      category: 'video',
      supportedTypes: ['Video', 'Audio', 'Playlist', 'Live Stream', 'Shorts'],
    },
  },
  {
    pattern: /tiktok\.com/i,
    info: {
      name: 'TikTok',
      icon: '🎵',
      category: 'social',
      supportedTypes: ['Video', 'Audio', 'No Watermark'],
    },
  },
  {
    pattern: /instagram\.com/i,
    info: {
      name: 'Instagram',
      icon: '📷',
      category: 'social',
      supportedTypes: ['Reels', 'Posts', 'Stories', 'IGTV'],
    },
  },
  {
    pattern: /(?:twitter\.com|x\.com)/i,
    info: {
      name: 'X (Twitter)',
      icon: '🐦',
      category: 'social',
      supportedTypes: ['Video', 'GIF'],
    },
  },
  {
    pattern: /facebook\.com/i,
    info: {
      name: 'Facebook',
      icon: '👥',
      category: 'social',
      supportedTypes: ['Video', 'Reels'],
    },
  },
  {
    pattern: /bilibili\.com/i,
    info: {
      name: 'Bilibili',
      icon: '📺',
      category: 'video',
      supportedTypes: ['Video', 'Audio', 'Playlist'],
    },
  },
  {
    pattern: /twitch\.tv/i,
    info: {
      name: 'Twitch',
      icon: '🎮',
      category: 'streaming',
      supportedTypes: ['Live Stream', 'VOD', 'Clips'],
    },
  },
  {
    pattern: /reddit\.com/i,
    info: {
      name: 'Reddit',
      icon: '🔴',
      category: 'social',
      supportedTypes: ['Video', 'GIF'],
    },
  },
  {
    pattern: /vimeo\.com/i,
    info: {
      name: 'Vimeo',
      icon: '🎬',
      category: 'video',
      supportedTypes: ['Video', 'Audio'],
    },
  },
  {
    pattern: /dailymotion\.com/i,
    info: {
      name: 'Dailymotion',
      icon: '📹',
      category: 'video',
      supportedTypes: ['Video'],
    },
  },
  {
    pattern: /soundcloud\.com/i,
    info: {
      name: 'SoundCloud',
      icon: '🎵',
      category: 'music',
      supportedTypes: ['Audio', 'Playlist'],
    },
  },
  {
    pattern: /pinterest\.com/i,
    info: {
      name: 'Pinterest',
      icon: '📌',
      category: 'social',
      supportedTypes: ['Video'],
    },
  },
  {
    pattern: /linkedin\.com/i,
    info: {
      name: 'LinkedIn',
      icon: '💼',
      category: 'social',
      supportedTypes: ['Video'],
    },
  },
  {
    pattern: /rumble\.com/i,
    info: {
      name: 'Rumble',
      icon: '📺',
      category: 'video',
      supportedTypes: ['Video'],
    },
  },
  {
    pattern: /ok\.ru|odnoklassniki\.ru/i,
    info: {
      name: 'Odnoklassniki',
      icon: '👥',
      category: 'social',
      supportedTypes: ['Video'],
    },
  },
  {
    pattern: /vk\.com/i,
    info: {
      name: 'VK',
      icon: '🌐',
      category: 'social',
      supportedTypes: ['Video'],
    },
  },
];

/**
 * Detect platform from URL
 */
export function detectPlatform(url: string): PlatformInfo | null {
  try {
    for (const { pattern, info } of platformPatterns) {
      if (pattern.test(url)) {
        return info;
      }
    }
    // Generic fallback - yt-dlp supports 1000+ sites
    return {
      name: 'Unknown Platform',
      icon: '🌐',
      category: 'other',
      supportedTypes: ['Video', 'Audio'],
    };
  } catch {
    return null;
  }
}

/**
 * Get platform name for display
 */
export function getPlatformName(url: string): string {
  const platform = detectPlatform(url);
  return platform?.name || 'Video Platform';
}

/**
 * Major platforms supported by yt-dlp
 */
export const majorPlatforms: PlatformInfo[] = [
  { name: 'YouTube', icon: '▶️', category: 'video', supportedTypes: ['Video', 'Audio', 'Playlist', 'Live', 'Shorts'] },
  { name: 'TikTok', icon: '🎵', category: 'social', supportedTypes: ['Video', 'Audio', 'No Watermark'] },
  { name: 'Instagram', icon: '📷', category: 'social', supportedTypes: ['Reels', 'Posts', 'Stories', 'IGTV'] },
  { name: 'X (Twitter)', icon: '🐦', category: 'social', supportedTypes: ['Video', 'GIF'] },
  { name: 'Facebook', icon: '👥', category: 'social', supportedTypes: ['Video', 'Reels'] },
  { name: 'Bilibili', icon: '📺', category: 'video', supportedTypes: ['Video', 'Audio', 'Playlist'] },
  { name: 'Twitch', icon: '🎮', category: 'streaming', supportedTypes: ['Live', 'VOD', 'Clips'] },
  { name: 'Reddit', icon: '🔴', category: 'social', supportedTypes: ['Video', 'GIF'] },
  { name: 'Vimeo', icon: '🎬', category: 'video', supportedTypes: ['Video', 'Audio'] },
  { name: 'SoundCloud', icon: '🎵', category: 'music', supportedTypes: ['Audio', 'Playlist'] },
  { name: 'Dailymotion', icon: '📹', category: 'video', supportedTypes: ['Video'] },
  { name: 'Pinterest', icon: '📌', category: 'social', supportedTypes: ['Video'] },
  { name: 'LinkedIn', icon: '💼', category: 'social', supportedTypes: ['Video'] },
  { name: 'Rumble', icon: '📺', category: 'video', supportedTypes: ['Video'] },
];


















