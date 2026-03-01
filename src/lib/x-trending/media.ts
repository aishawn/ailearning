/**
 * Media processing utilities for X Trending API
 */

import { getStorageService } from '@/shared/services/storage';
import { callTweapiTweetDetails } from './tweapi';
import type { VideoMedia } from './types';

const UPLOAD_TO_R2 = process.env.UPLOAD_TO_R2 !== 'false';

/**
 * Get file extension from URL
 */
export function getFileExtensionFromUrl(url: string): string {
  try {
    const urlWithoutParams = url.split('?')[0];
    const ext = urlWithoutParams.split('.').pop()?.toLowerCase() || '';
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    return validExtensions.includes(ext) ? ext : 'jpg';
  } catch {
    return 'jpg';
  }
}

/**
 * Get video extension from URL
 */
export function getVideoExtensionFromUrl(url: string): string {
  try {
    const urlWithoutParams = url.split('?')[0];
    const ext = urlWithoutParams.split('.').pop()?.toLowerCase() || '';
    const validExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'm3u8'];
    return validExtensions.includes(ext) ? ext : 'mp4';
  } catch {
    return 'mp4';
  }
}

/**
 * Download image
 */
export async function downloadImage(imageUrl: string): Promise<Buffer | null> {
  if (!imageUrl || !imageUrl.startsWith('http')) {
    return null;
  }

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Referer: 'https://twitter.com/',
    Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  };

  try {
    const response = await fetch(imageUrl, {
      headers,
      // @ts-ignore - Next.js fetch supports cache
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(`Failed to download image ${imageUrl}:`, error);
    return null;
  }
}

/**
 * Download video
 */
export async function downloadVideo(videoUrl: string): Promise<Buffer | null> {
  if (!videoUrl || !videoUrl.startsWith('http')) {
    return null;
  }

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Referer: 'https://twitter.com/',
    Accept: 'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5',
    'Accept-Language': 'en-US,en;q=0.9',
    Range: 'bytes=0-',
  };

  try {
    const response = await fetch(videoUrl, {
      headers,
      // @ts-ignore - Next.js fetch supports cache
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(`Failed to download video ${videoUrl}:`, error);
    return null;
  }
}

/**
 * Upload image to R2
 */
export async function uploadImageToR2(
  imageData: Buffer,
  fileExtension: string
): Promise<string | null> {
  if (!UPLOAD_TO_R2) {
    return null;
  }

  try {
    const storageService = await getStorageService();

    // Generate unique filename
    const { createHash } = await import('crypto');
    const fileHash = createHash('md5').update(imageData).digest('hex');
    const fileName = `x-trending/${fileHash}.${fileExtension}`;

    // Determine content type
    const contentTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    const contentType = contentTypes[fileExtension] || 'image/jpeg';

    // Upload to R2 using default provider
    const result = await storageService.uploadFile({
      body: imageData,
      key: fileName,
      contentType,
      disposition: 'inline',
    });

    if (result.success && result.url) {
      return result.url;
    }

    return null;
  } catch (error) {
    console.error('Failed to upload image to R2:', error);
    return null;
  }
}

/**
 * Upload video to R2
 */
export async function uploadVideoToR2(
  videoData: Buffer,
  fileExtension: string
): Promise<string | null> {
  if (!UPLOAD_TO_R2) {
    return null;
  }

  try {
    const storageService = await getStorageService();

    // Generate unique filename
    const { createHash } = await import('crypto');
    const fileHash = createHash('md5').update(videoData).digest('hex');
    const fileName = `x-trending/videos/${fileHash}.${fileExtension}`;

    // Determine content type
    const contentTypes: Record<string, string> = {
      mp4: 'video/mp4',
      webm: 'video/webm',
      ogg: 'video/ogg',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      mkv: 'video/x-matroska',
    };
    const contentType = contentTypes[fileExtension] || 'video/mp4';

    // Upload to R2 using default provider
    const result = await storageService.uploadFile({
      body: videoData,
      key: fileName,
      contentType,
      disposition: 'inline',
    });

    if (result.success && result.url) {
      return result.url;
    }

    return null;
  } catch (error) {
    console.error('Failed to upload video to R2:', error);
    return null;
  }
}

/**
 * Process single image: download and upload to R2 if enabled
 */
export async function processSingleImage(imageUrl: string): Promise<string | null> {
  if (!imageUrl || !imageUrl.startsWith('http')) {
    return null;
  }

  try {
    // If R2 upload is disabled, return original URL
    if (!UPLOAD_TO_R2) {
      return imageUrl;
    }

    // Download image
    const imageData = await downloadImage(imageUrl);
    if (!imageData) {
      return imageUrl; // Fallback to original URL
    }

    // Get file extension
    const fileExt = getFileExtensionFromUrl(imageUrl);

    // Upload to R2
    const r2Url = await uploadImageToR2(imageData, fileExt);
    if (r2Url) {
      return r2Url;
    }

    // Fallback to original URL if upload fails
    return imageUrl;
  } catch (error) {
    console.error(`Error processing image ${imageUrl}:`, error);
    return imageUrl; // Fallback to original URL
  }
}

/**
 * Process images list
 */
export async function processImages(images: string[]): Promise<string[]> {
  if (!images || images.length === 0) {
    return [];
  }

  // Filter valid image URLs
  const validImages = images.filter(
    img => img && img.startsWith('http')
  );

  if (validImages.length === 0) {
    return [];
  }

  // Process images concurrently
  const results = await Promise.allSettled(
    validImages.map(img => processSingleImage(img))
  );

  // Filter out failures and nulls
  const processedImages: string[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      processedImages.push(result.value);
    }
  }

  return processedImages;
}

/**
 * Extract actual video URL from tweet details response
 */
function extractVideoUrlFromTweetDetails(tweetDetails: any): string | null {
  if (!tweetDetails || typeof tweetDetails !== 'object') {
    return null;
  }

  // Try to find video URL in various possible locations
  const media = tweetDetails.media || tweetDetails.extended_entities?.media || [];
  
  for (const item of media) {
    if (!item || typeof item !== 'object') continue;
    
    const mediaType = (item.type || '').toUpperCase();
    if (mediaType === 'VIDEO' || mediaType === 'ANIMATED_GIF' || mediaType === 'GIF') {
      // Try to get video URL from video_info variants (highest quality first)
      if (item.video_info?.variants && Array.isArray(item.video_info.variants)) {
        // Sort by bitrate (highest first) and find the first video variant
        const videoVariants = item.video_info.variants
          .filter((v: any) => v.content_type?.startsWith('video/'))
          .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));
        
        if (videoVariants.length > 0 && videoVariants[0].url) {
          return videoVariants[0].url;
        }
      }
      
      // Fallback to other video URL fields
      const videoUrl =
        item.video_url ||
        item.videoUrl ||
        item.video_url_https ||
        item.media_url_https ||
        item.media_url;
      
      if (videoUrl && !videoUrl.includes('twitter.com') && !videoUrl.includes('x.com')) {
        return videoUrl;
      }
    }
  }

  return null;
}

/**
 * Process videos list
 */
export async function processVideos(videos: VideoMedia[]): Promise<VideoMedia[]> {
  if (!videos || videos.length === 0) {
    return [];
  }

  const processedVideos: VideoMedia[] = [];

  for (const video of videos) {
    try {
      const processedVideo: VideoMedia = { ...video };

      // Process thumbnail
      if (processedVideo.thumbnail) {
        const processedThumbnail = await processSingleImage(processedVideo.thumbnail);
        if (processedThumbnail) {
          processedVideo.thumbnail = processedThumbnail;
        }
      }

      // Process video file
      if (processedVideo.url && UPLOAD_TO_R2) {
        let actualVideoUrl = processedVideo.url;
        
        // If it's a tweet link, try to get the actual video URL
        if (processedVideo.url.includes('twitter.com') || processedVideo.url.includes('x.com')) {
          try {
            console.log(`Fetching video details for tweet: ${processedVideo.url}`);
            const tweetDetails = await callTweapiTweetDetails(processedVideo.url);
            if (tweetDetails) {
              const extractedUrl = extractVideoUrlFromTweetDetails(tweetDetails);
              if (extractedUrl) {
                actualVideoUrl = extractedUrl;
                console.log(`Extracted video URL: ${extractedUrl.substring(0, 100)}...`);
              } else {
                console.log(`Could not extract video URL from tweet details, keeping original URL`);
                // Keep the tweet link as fallback
                processedVideos.push(processedVideo);
                continue;
              }
            } else {
              console.log(`Could not fetch tweet details, keeping original URL`);
              // Keep the tweet link as fallback
              processedVideos.push(processedVideo);
              continue;
            }
          } catch (error) {
            console.error(`Error fetching tweet details for ${processedVideo.url}:`, error);
            // Keep the tweet link as fallback
            processedVideos.push(processedVideo);
            continue;
          }
        }

        // Download and upload video
        try {
          console.log(`Downloading video from: ${actualVideoUrl.substring(0, 100)}...`);
          const videoData = await downloadVideo(actualVideoUrl);
          if (videoData) {
            const videoExt = getVideoExtensionFromUrl(actualVideoUrl);
            console.log(`Uploading video to R2 (${videoExt}, ${(videoData.length / 1024 / 1024).toFixed(2)} MB)...`);
            const r2VideoUrl = await uploadVideoToR2(videoData, videoExt);
            if (r2VideoUrl) {
              processedVideo.url = r2VideoUrl;
              console.log(`Successfully uploaded video to R2: ${r2VideoUrl}`);
            } else {
              console.log(`Failed to upload video to R2, keeping original URL`);
            }
          } else {
            console.log(`Failed to download video, keeping original URL`);
          }
        } catch (error) {
          console.error(`Error processing video ${actualVideoUrl}:`, error);
          // Keep original URL on error
        }
      }

      processedVideos.push(processedVideo);
    } catch (error) {
      console.error('Error processing video:', error);
      // Include original video on error
      processedVideos.push(video);
    }
  }

  return processedVideos;
}

