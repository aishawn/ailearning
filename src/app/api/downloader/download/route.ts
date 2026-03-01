import { respErr } from '@/shared/lib/resp';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, mkdir, readdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { createReadStream, statSync, readdirSync, unlinkSync } from 'fs';
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

export async function POST(request: Request) {
  let tempFilePath: string | null = null;
  let tempDir: string = '';

  try {
    const { url, formatId = 'best' } = await request.json();

    if (!url) {
      return respErr('URL is required');
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return respErr('Invalid URL format');
    }

    // Create temp directory if it doesn't exist
    tempDir = join(tmpdir(), 'yt-dlp-downloads');
    await mkdir(tempDir, { recursive: true });

    // Generate unique filename with known extension
    // First, get video info to determine extension
    const ytDlpPath = findYtDlp();
    let videoExt = 'mp4';
    
    // Try to get video info to determine extension
    const playerClients = ['android', 'ios', 'tv_embedded', 'web'];
    let infoOutput = '';
    
    for (const client of playerClients) {
      try {
        const baseArgs: string[] = [
          '--dump-json',
          '--no-warnings',
          '--extractor-args', `youtube:player_client=${client}`,
          '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          '--extractor-retries', '3',
          '--fragment-retries', '3',
          '--retries', '3',
        ];
        
        try {
          execSync('which deno >/dev/null 2>&1', { stdio: 'ignore' });
          baseArgs.push('--js-runtimes', 'deno');
        } catch {
          // deno not available
        }
        
        const argsString = baseArgs.map(escapeArg).join(' ');
        let infoCommand = ytDlpPath 
          ? `${escapeArg(ytDlpPath)} ${argsString} ${escapeArg(url)}`
          : `yt-dlp ${argsString} ${escapeArg(url)}`;
        
        try {
          const result = await execAsync(infoCommand, {
            timeout: 30000,
            maxBuffer: 10 * 1024 * 1024,
          });
          infoOutput = result.stdout;
          if (infoOutput && !result.stderr?.includes('Sign in to confirm') && !result.stderr?.includes('bot')) {
            break;
          }
        } catch (error: any) {
          if (error.code === 'ENOENT' || error.message?.includes('yt-dlp') || error.message?.includes('not found')) {
            infoCommand = `python3 -m yt_dlp ${argsString} ${escapeArg(url)}`;
            try {
              const result = await execAsync(infoCommand, {
                timeout: 30000,
                maxBuffer: 10 * 1024 * 1024,
              });
              infoOutput = result.stdout;
              if (infoOutput && !result.stderr?.includes('Sign in to confirm') && !result.stderr?.includes('bot')) {
                break;
              }
            } catch {
              continue;
            }
          } else if (error.stderr?.includes('Sign in to confirm') || error.stderr?.includes('bot')) {
            continue;
          } else {
            continue;
          }
        }
      } catch {
        continue;
      }
    }
    
    if (infoOutput) {
      try {
        const videoData = JSON.parse(infoOutput);
        if (formatId === 'best' || formatId === 'worst') {
          videoExt = videoData.ext || 'mp4';
        } else {
          const format = videoData.formats?.find((f: any) => f.format_id === formatId);
          videoExt = format?.ext || videoData.ext || 'mp4';
        }
      } catch {
        videoExt = 'mp4';
      }
    }

    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    tempFilePath = join(tempDir, `video-${timestamp}-${randomId}.${videoExt}`);

    // Use yt-dlp to download video
    // Try different player clients to avoid bot detection
    const downloadPlayerClients = ['android', 'ios', 'tv_embedded', 'web'];
    let stdout = '';
    let stderr = '';
    let downloadSuccess = false;
    let lastDownloadError: any = null;
    
    for (const client of downloadPlayerClients) {
      try {
        // Build download command with necessary parameters
        const downloadArgs: string[] = [
          '-f', formatId,
          '-o', tempFilePath,
          '--no-warnings',
          '--extractor-args', `youtube:player_client=${client}`,
          '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          '--extractor-retries', '3',
          '--fragment-retries', '3',
          '--retries', '3',
        ];
        
        // Try to add JS runtime if deno is available
        try {
          execSync('which deno >/dev/null 2>&1', { stdio: 'ignore' });
          downloadArgs.push('--js-runtimes', 'deno');
        } catch {
          // deno not available, continue without it
        }
        
        const downloadArgsString = downloadArgs.map(escapeArg).join(' ');
        let command = ytDlpPath
          ? `${escapeArg(ytDlpPath)} ${downloadArgsString} ${escapeArg(url)}`
          : `yt-dlp ${downloadArgsString} ${escapeArg(url)}`;
        
        try {
          const result = await execAsync(command, {
            timeout: 300000, // 5 minutes timeout for download
            maxBuffer: 50 * 1024 * 1024, // 50MB buffer
          });
          stdout = result.stdout;
          stderr = result.stderr || '';
          
          // Check if download was successful (file should exist)
          try {
            statSync(tempFilePath);
            downloadSuccess = true;
            break;
          } catch {
            // File doesn't exist, try next client
            continue;
          }
        } catch (error: any) {
          lastDownloadError = error;
          
          // If yt-dlp command not found, try python3 -m yt_dlp
          if (error.code === 'ENOENT' || error.message?.includes('yt-dlp') || error.message?.includes('not found')) {
            console.log(`yt-dlp command not found, trying python3 -m yt_dlp with client ${client}`);
            command = `python3 -m yt_dlp ${downloadArgsString} ${escapeArg(url)}`;
            try {
              const result = await execAsync(command, {
                timeout: 300000,
                maxBuffer: 50 * 1024 * 1024,
              });
              stdout = result.stdout;
              stderr = result.stderr || '';
              
              // Check if download was successful
              try {
                statSync(tempFilePath);
                downloadSuccess = true;
                break;
              } catch {
                continue;
              }
            } catch (pyError: any) {
              lastDownloadError = pyError;
              
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
        lastDownloadError = error;
        continue;
      }
    }
    
    // If all clients failed, return error
    if (!downloadSuccess) {
      if (lastDownloadError) {
        if (lastDownloadError.stderr?.includes('Sign in to confirm') || lastDownloadError.stderr?.includes('bot')) {
          return respErr('YouTube is blocking the request. This may be due to bot detection. Please try again later or use a different video.');
        }
        if (lastDownloadError.message?.includes('yt_dlp') || lastDownloadError.code === 'ENOENT') {
          return respErr('yt-dlp is not installed. Please install it first: pip install yt-dlp');
        }
      }
      return respErr('Download failed. YouTube may be blocking the request. Please try again later.');
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
      return respErr(`Download failed: ${errorMsg}`);
    }

    // The file should be at tempFilePath, but yt-dlp might have modified the name
    // Try the expected path first
    let actualFilePath: string | null = tempFilePath;
    
    // Check if file exists at expected path
    try {
      statSync(actualFilePath);
    } catch {
      // If not found, search for files matching our pattern
      const files = readdirSync(tempDir);
      const matchingFile = files.find((f: string) => 
        f.startsWith(`video-${timestamp}-${randomId}`)
      );
      if (matchingFile) {
        actualFilePath = join(tempDir, matchingFile);
      } else {
        return respErr('Downloaded file not found');
      }
    }

    if (!actualFilePath) {
      return respErr('Downloaded file not found');
    }

    // Check if file exists and get its stats
    try {
      const stats = statSync(actualFilePath);
      if (!stats.isFile()) {
        return respErr('Downloaded path is not a file');
      }
    } catch {
      return respErr('Downloaded file does not exist');
    }

    // Read file and return as response
    const fileStream = createReadStream(actualFilePath);
    const fileBuffer = await streamToBuffer(fileStream);

    // Clean up temp file
    try {
      await unlink(actualFilePath);
    } catch (cleanupError) {
      console.error('Failed to cleanup temp file:', cleanupError);
    }

    // Determine content type based on file extension
    const ext = actualFilePath.split('.').pop()?.toLowerCase();
    const contentType = getContentType(ext || 'mp4');

    // Return file as response
    return new Response(fileBuffer as any, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(actualFilePath.split(/[/\\]/).pop() || 'video.mp4')}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (e: any) {
    console.error('API error:', e);
    
    // Clean up temp file if it exists
    if (tempFilePath && tempDir) {
      try {
        const files = readdirSync(tempDir);
        const baseName = tempFilePath.split(/[/\\]/).pop()?.split('.')[0] || '';
        files.forEach((file: string) => {
          if (file.includes(baseName)) {
            try {
              unlinkSync(join(tempDir, file));
            } catch (unlinkError) {
              console.error('Failed to unlink file:', unlinkError);
            }
          }
        });
      } catch (cleanupError) {
        console.error('Failed to cleanup on error:', cleanupError);
      }
    }

    // Check if yt-dlp is installed
    if (e.message?.includes('yt-dlp') || e.code === 'ENOENT') {
      return respErr('yt-dlp is not installed. Please install it first: pip install yt-dlp');
    }

    return respErr(e.message || 'Internal server error');
  }
}

function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

function getContentType(ext: string): string {
  const contentTypes: Record<string, string> = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    mkv: 'video/x-matroska',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime',
    flv: 'video/x-flv',
    m4a: 'audio/mp4',
    mp3: 'audio/mpeg',
    ogg: 'audio/ogg',
    wav: 'audio/wav',
  };
  return contentTypes[ext] || 'application/octet-stream';
}

