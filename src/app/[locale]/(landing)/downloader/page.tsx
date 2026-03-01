'use client';

import { useState } from 'react';
import { 
  Download, 
  Loader2, 
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Globe,
  Play
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { toast } from 'sonner';
import { detectPlatform, majorPlatforms } from '@/shared/lib/platform-detector';

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  platform?: {
    name: string;
    icon: string;
    category: string;
  };
  formats: Array<{
    format_id: string;
    ext: string;
    resolution?: string;
    filesize?: number;
    vcodec?: string;
    acodec?: string;
  }>;
}

export default function DownloaderPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [detectedPlatform, setDetectedPlatform] = useState<ReturnType<typeof detectPlatform> | null>(null);

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    setError(null);
    setVideoInfo(null);
    
    // Auto-detect platform as user types
    if (newUrl.trim()) {
      try {
        new URL(newUrl);
        const platform = detectPlatform(newUrl);
        setDetectedPlatform(platform);
      } catch {
        setDetectedPlatform(null);
      }
    } else {
      setDetectedPlatform(null);
    }
  };

  const handleFetchInfo = async () => {
    if (!url.trim()) {
      toast.error('Please enter a video URL');
      setError('Please enter a video URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast.error('Invalid URL format');
      setError('Invalid URL format. Please enter a valid video URL.');
      return;
    }

    setLoading(true);
    setVideoInfo(null);
    setError(null);

    try {
      const response = await fetch('/api/downloader/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.code !== 0) {
        const errorMsg = data.message || 'Failed to fetch video info';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      if (!data.data) {
        throw new Error('No video data received');
      }

      setVideoInfo(data.data);
      setError(null);
      toast.success('Video information loaded successfully');
    } catch (error: any) {
      console.error('Fetch info error:', error);
      const errorMsg = error.message || 'Failed to fetch video information';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (formatId?: string) => {
    if (!url.trim() || !videoInfo) {
      toast.error('Please fetch video information first');
      setError('Please fetch video information first');
      return;
    }

    setDownloading(true);
    setDownloadProgress(0);
    setError(null);

    try {
      const response = await fetch('/api/downloader/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url,
          formatId: formatId || 'best',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Download failed' }));
        throw new Error(errorData.message || `Download failed with status ${response.status}`);
      }

      // Get the blob from response
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${videoInfo.title || 'video'}.mp4`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1].replace(/['"]/g, ''));
        }
      }
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      setDownloadProgress(100);
      toast.success('Video downloaded successfully');
    } catch (error: any) {
      console.error('Download error:', error);
      const errorMsg = error.message || 'Failed to download video';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setDownloading(false);
      setTimeout(() => {
        setDownloadProgress(0);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background mt-24">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="mb-12 text-center">
          {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6 tracking-wide">
            <Sparkles className="h-3.5 w-3.5" />
            <span>UNIVERSAL VIDEO DOWNLOADER</span>
          </div> */}
          <h1 className="text-5xl font-bold mb-4 tracking-tight">
            Download Videos from 1000+ Platforms
          </h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
            Instant downloads, no watermark. Auto-detect platform, paste URL, and download..
          </p>
        </div>

        {/* URL Input Card */}
        <Card className="mb-8 rounded-full">
          <CardContent className="pt-0">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="Paste video URL here..."
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="pl-11 h-12 text-base rounded-full"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !loading) {
                      handleFetchInfo();
                    }
                  }}
                  disabled={loading}
                />
              </div>
              <Button
                onClick={handleFetchInfo}
                disabled={loading || !url.trim()}
                size="lg"
                className="h-12 px-6 rounded-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Fetch
                  </>
                )}
              </Button>
            </div>
            
            {/* Platform Detection Badge */}
            {detectedPlatform && (
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="secondary" className="text-xs">
                  <span className="mr-1.5">{detectedPlatform.icon}</span>
                  {detectedPlatform.name}
                </Badge>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 mt-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Video Preview */}
        {videoInfo && (
          <Card className="mb-8 rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-semibold">Ready to Download</span>
                </div>
                {videoInfo.platform && (
                  <Badge variant="outline" className="text-xs">
                    <span className="mr-1.5">{videoInfo.platform.icon}</span>
                    {videoInfo.platform.name}
                  </Badge>
                )}
              </div>
              
              <div className="aspect-video rounded-xl overflow-hidden bg-muted mb-4 border">
                {videoInfo.thumbnail && (
                  <img
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold text-base mb-1 line-clamp-2">{videoInfo.title}</h3>
                {videoInfo.duration && (
                  <p className="text-xs text-muted-foreground">
                    {videoInfo.duration}
                  </p>
                )}
              </div>
              
              {videoInfo.formats && videoInfo.formats.length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Formats</p>
                  <div className="grid gap-2">
                    {videoInfo.formats.slice(0, 4).map((format) => (
                      <div
                        key={format.format_id}
                        className="flex items-center justify-between p-3 border rounded-xl hover:bg-muted/50 cursor-pointer transition-colors group"
                        onClick={() => handleDownload(format.format_id)}
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {format.ext.toUpperCase()} {format.resolution || ''}
                          </p>
                          {format.filesize && (
                            <p className="text-xs text-muted-foreground">
                              {(format.filesize / 1024 / 1024).toFixed(1)} MB
                            </p>
                          )}
                        </div>
                        <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Button
                onClick={() => handleDownload()}
                disabled={downloading}
                className="w-full h-12 rounded-full"
                size="lg"
              >
                {downloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Downloading {downloadProgress > 0 && `${downloadProgress}%`}
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download Best Quality
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Supported Platforms */}
        <Card className="mb-8 rounded-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="h-4 w-4 text-primary" />
              <CardTitle className="text-lg">Supported Platforms</CardTitle>
            </div>
            <CardDescription className="text-sm">
              1000+ platforms supported
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {majorPlatforms.map((platform) => (
                <div
                  key={platform.name}
                  className="flex items-center gap-2.5 p-3 border rounded-xl hover:bg-muted/50 transition-colors group"
                >
                  <span className="text-xl flex-shrink-0">{platform.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{platform.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {platform.supportedTypes.slice(0, 2).join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
