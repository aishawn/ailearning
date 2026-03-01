import { respData, respErr } from '@/shared/lib/resp';
import { exec } from 'child_process';
import { promisify } from 'util';
import { detectPlatform } from '@/shared/lib/platform-detector';
import { execSync } from 'child_process';

const execAsync = promisify(exec);

// Helper function to escape shell arguments
function escapeArg(arg: string): string {
  return `"${arg.replace(/"/g, '\\"')}"`;
}

// Helper function to find yt-dlp executable
function findYtDlp(): string | null {
  try {
    // Try common paths
    const commonPaths = [
      '/usr/bin/yt-dlp',
      '/usr/local/bin/yt-dlp',
      '/bin/yt-dlp',
    ];
    
    for (const path of commonPaths) {
      try {
        execSync(`test -x "${path}"`, { stdio: 'ignore' });
        return path;
      } catch {
        // Continue searching
      }
    }
    
    // Try to find in PATH
    try {
      const result = execSync('which yt-dlp', { encoding: 'utf-8', stdio: 'pipe' });
      if (result.trim()) {
        return result.trim();
      }
    } catch {
      // Continue
    }
    
    // Try to find in Nix store
    try {
      const result = execSync('find /nix/store -path "*/bin/yt-dlp" -type f -executable 2>/dev/null | head -1', { 
        encoding: 'utf-8', 
        stdio: 'pipe',
        timeout: 5000 
      });
      if (result.trim()) {
        return result.trim();
      }
    } catch {
      // Continue
    }
    
    return null;
  } catch {
    return null;
  }
}

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

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return respErr('URL is required');
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return respErr('Invalid URL format');
    }

    // Use yt-dlp to get video information
    // Try to find yt-dlp executable first
    const ytDlpPath = findYtDlp();
    
    // Escape arguments properly for shell execution
    const escapeArg = (arg: string) => `"${arg.replace(/"/g, '\\"')}"`;
    
    // Try different player clients to avoid bot detection
    // Order: android -> ios -> tv_embedded -> web (most reliable first)
    const playerClients = ['android', 'ios', 'tv_embedded', 'web'];
    let stdout = '';
    let stderr = '';
    let lastError: any = null;
    
    for (const client of playerClients) {
      try {
        // Build yt-dlp command with necessary parameters
        // Add parameters to handle YouTube bot detection and JS runtime
        const baseArgs: string[] = [
          '--dump-json',
          '--no-warnings', // Suppress warnings in output
          '--extractor-args', `youtube:player_client=${client}`, // Try different clients
          '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          '--extractor-retries', '3', // Retry on failure
          '--fragment-retries', '3',
          '--retries', '3',
        ];
        
        // Try to add JS runtime if deno is available
        try {
          execSync('which deno >/dev/null 2>&1', { stdio: 'ignore' });
          baseArgs.push('--js-runtimes', 'deno');
        } catch {
          // deno not available, continue without it
        }
        
        const argsString = baseArgs.map(escapeArg).join(' ');
        let command = ytDlpPath 
          ? `${escapeArg(ytDlpPath)} ${argsString} ${escapeArg(url)}`
          : `yt-dlp ${argsString} ${escapeArg(url)}`;
        
        try {
          const result = await execAsync(command, {
            timeout: 30000, // 30 seconds timeout
            maxBuffer: 10 * 1024 * 1024, // 10MB buffer
          });
          stdout = result.stdout;
          stderr = result.stderr || '';
          
          // If we got output, break out of the loop
          if (stdout && !stderr.includes('Sign in to confirm') && !stderr.includes('bot')) {
            break;
          }
        } catch (error: any) {
          lastError = error;
          
          // If yt-dlp command not found, try python3 -m yt_dlp
          if (error.code === 'ENOENT' || error.message?.includes('yt-dlp') || error.message?.includes('not found')) {
            console.log(`yt-dlp command not found, trying python3 -m yt_dlp with client ${client}`);
            command = `python3 -m yt_dlp ${argsString} ${escapeArg(url)}`;
            try {
              const result = await execAsync(command, {
                timeout: 30000,
                maxBuffer: 10 * 1024 * 1024,
              });
              stdout = result.stdout;
              stderr = result.stderr || '';
              
              // If we got output, break out of the loop
              if (stdout && !stderr.includes('Sign in to confirm') && !stderr.includes('bot')) {
                break;
              }
            } catch (pyError: any) {
              lastError = pyError;
              
              // If it's a bot detection error, try next client
              if (pyError.stderr?.includes('Sign in to confirm') || pyError.stderr?.includes('bot')) {
                console.log(`Bot detection with client ${client}, trying next client...`);
                continue;
              }
              
              // If it's installation error, return immediately
              if (pyError.message?.includes('yt_dlp') || pyError.code === 'ENOENT') {
                return respErr('yt-dlp is not installed. Please install it first: pip install yt-dlp');
              }
              
              // For other errors, try next client
              continue;
            }
          } else {
            // Check for YouTube bot detection error in stderr
            if (error.stderr?.includes('Sign in to confirm') || error.stderr?.includes('bot')) {
              console.log(`Bot detection with client ${client}, trying next client...`);
              continue;
            }
            
            // For other errors, try next client
            continue;
          }
        }
      } catch (error: any) {
        lastError = error;
        continue;
      }
    }
    
    // If all clients failed, return error
    if (!stdout || stderr.includes('Sign in to confirm') || stderr.includes('bot')) {
      if (lastError) {
        if (lastError.stderr?.includes('Sign in to confirm') || lastError.stderr?.includes('bot')) {
          return respErr('YouTube is blocking the request. This may be due to bot detection. Please try again later or use a different video.');
        }
        if (lastError.message?.includes('yt_dlp') || lastError.code === 'ENOENT') {
          return respErr('yt-dlp is not installed. Please install it first: pip install yt-dlp');
        }
      }
      return respErr('Failed to fetch video information. YouTube may be blocking the request. Please try again later.');
    }

    // Filter out warnings from stderr, only treat actual errors
    const errorLines = stderr.split('\n').filter((line: string) => 
      line.trim() && 
      !line.includes('WARNING') && 
      !line.includes('INFO') &&
      line.includes('ERROR')
    );
    
    if (errorLines.length > 0 && !stdout) {
      console.error('yt-dlp stderr:', stderr);
      const errorMsg = errorLines.join('; ');
      if (errorMsg.includes('Sign in to confirm') || errorMsg.includes('bot')) {
        return respErr('YouTube is blocking the request. Please try again later or use a different video.');
      }
      return respErr(`Failed to fetch video info: ${errorMsg}`);
    }

    if (!stdout) {
      return respErr('No video information received from yt-dlp');
    }

    let videoData;
    try {
      videoData = JSON.parse(stdout);
    } catch (parseError) {
      console.error('Failed to parse yt-dlp output:', stdout);
      return respErr('Failed to parse video information. The URL may be invalid or the video may be unavailable.');
    }

    // Detect platform
    const platform = detectPlatform(url);

    // Format the response
    const videoInfo: VideoInfo = {
      title: videoData.title || 'Untitled',
      thumbnail: videoData.thumbnail || videoData.thumbnails?.[0]?.url || '',
      duration: formatDuration(videoData.duration),
      platform: platform ? {
        name: platform.name,
        icon: platform.icon,
        category: platform.category,
      } : undefined,
      formats: (videoData.formats || []).map((format: any) => ({
        format_id: format.format_id,
        ext: format.ext || 'mp4',
        resolution: format.resolution || format.height ? `${format.width || '?'}x${format.height || '?'}` : undefined,
        filesize: format.filesize || format.filesize_approx,
        vcodec: format.vcodec,
        acodec: format.acodec,
      })).filter((f: any) => f.vcodec !== 'none'), // Filter out audio-only formats for video downloader
    };

    return respData(videoInfo);
  } catch (e: any) {
    console.error('API error:', e);
    return respErr(e.message || 'Internal server error');
  }
}

function formatDuration(seconds: number): string {
  if (!seconds) return '';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

