'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Copy, 
  Loader2, 
  Sparkles, 
  Palette, 
  Type, 
  Image as ImageIcon, 
  Video,
  Download,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Maximize2
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import { toast } from 'sonner';
import { AITaskStatus } from '@/extensions/ai/types';

interface ReferencePost {
  content: string;
  author?: string;
  author_handle?: string;
  post_url?: string;
  images?: string[];
  language?: string;
  likes?: number;
  comments?: number;
  retweets?: number;
  views?: number;
  quotes?: number;
  bookmarks?: number;
  timestamp?: string;
  is_verified?: boolean;
  author_followers?: number;
}

interface BrandInfo {
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  tone: 'professional' | 'casual' | 'creative' | 'bold';
  style: 'minimalist' | 'modern' | 'classic' | 'trendy';
}

interface CloneResult {
  text: string;
  images?: string[];
  video?: string;
}

export default function ClonePage() {
  const router = useRouter();
  const [referencePost, setReferencePost] = useState<ReferencePost | null>(null);
  const [brandInfo, setBrandInfo] = useState<BrandInfo>({
    name: '',
    description: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    tone: 'professional',
    style: 'modern',
  });
  const [loading, setLoading] = useState(false);
  const [cloneResult, setCloneResult] = useState<CloneResult | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'media'>('text');
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [imageTaskIds, setImageTaskIds] = useState<string[]>([]);

  useEffect(() => {
    // 从 sessionStorage 中获取参考帖子信息
    const stored = sessionStorage.getItem('clone_reference_post');
    if (stored) {
      try {
        const postData = JSON.parse(stored) as ReferencePost;
        setReferencePost(postData);
        // 清除存储，避免重复使用
        sessionStorage.removeItem('clone_reference_post');
      } catch (error) {
        console.error('Failed to parse reference post:', error);
      }
    }
  }, []);

  const handleClone = async () => {
    if (!referencePost) return;

    setLoading(true);
    setCloneResult(null);
    setProgress(0);
    setStatusMessage('Starting remake process...');
    setImageTaskIds([]);

    try {
      // Step 1: Rewrite text using AI
      setProgress(10);
      setStatusMessage('Rewriting text content...');
      const rewrittenText = await rewriteText(referencePost.content, brandInfo);
      
      setProgress(40);
      setCloneResult({
        text: rewrittenText,
        images: [],
      });

      // Step 2: Generate images using nano banana if reference images exist
      if (referencePost.images && referencePost.images.length > 0) {
        setProgress(50);
        setStatusMessage('Generating images with AI...');
        const generatedImages = await generateClonedImages(referencePost.images, brandInfo);
        
        setCloneResult(prev => prev ? {
          ...prev,
          images: generatedImages,
        } : null);

        // Switch to media tab if images were generated successfully
        if (generatedImages && generatedImages.length > 0) {
          setActiveTab('media');
        }
      }

      setProgress(100);
      setStatusMessage('Remake completed!');
      toast.success('Post remade successfully!');
    } catch (error: any) {
      console.error('Clone error:', error);
      toast.error(`Remake failed: ${error.message || 'Unknown error'}`);
      setStatusMessage('Remake failed');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setProgress(0);
        setStatusMessage('');
      }, 2000);
    }
  };

  const rewriteText = async (originalText: string, brand: BrandInfo): Promise<string> => {
    try {
      const resp = await fetch('/api/clone/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalText,
          brandInfo: brand,
        }),
      });

      if (!resp.ok) {
        throw new Error(`Request failed with status: ${resp.status}`);
      }

      const { code, message, data } = await resp.json();
      if (code !== 0) {
        throw new Error(message || 'Failed to rewrite text');
      }

      return data.rewrittenText || originalText;
    } catch (error: any) {
      console.error('Text rewrite error:', error);
      throw error;
    }
  };


  const generateClonedImages = async (images: string[], brand: BrandInfo): Promise<string[]> => {
    const generatedImageUrls: string[] = [];
    const taskIds: string[] = [];

    try {
      // Use nano banana pro edit model for image-to-image generation
      const model = 'fal-ai/nano-banana-pro/edit';
      const provider = 'fal';

      // Generate prompt based on brand info
      const imagePrompt = `Remake this image with ${brand.tone} tone and ${brand.style} style. Brand: ${brand.name}. ${brand.description ? `Brand description: ${brand.description}` : ''}. Use colors ${brand.primaryColor} and ${brand.secondaryColor} as inspiration. Keep the core visual concept but adapt it to match the brand identity.`;

      console.log('Starting image generation:', {
        imageCount: images.length,
        model,
        provider,
        prompt: imagePrompt,
        brandInfo: brand,
      });

      // Process each reference image
      for (let i = 0; i < images.length; i++) {
        const referenceImageUrl = images[i];
        setStatusMessage(`Generating image ${i + 1} of ${images.length}...`);
        setProgress(50 + (i * 40 / images.length));

        try {
          console.log(`Creating generation task for image ${i + 1}:`, referenceImageUrl);

          // Create image generation task
          const resp = await fetch('/api/ai/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              mediaType: 'image',
              scene: 'image-to-image',
              provider,
              model,
              prompt: imagePrompt,
              options: {
                image_input: [referenceImageUrl],
              },
            }),
          });

          if (!resp.ok) {
            const errorText = await resp.text();
            console.error(`API request failed (${resp.status}):`, errorText);
            throw new Error(`Request failed with status: ${resp.status}`);
          }

          const { code, message, data } = await resp.json();
          if (code !== 0) {
            console.error('API returned error:', { code, message, data });
            throw new Error(message || 'Failed to create image generation task');
          }

          const taskId = data?.id;
          if (!taskId) {
            console.error('No task ID in response:', data);
            throw new Error('Task id missing in response');
          }

          console.log(`Task created for image ${i + 1}, taskId:`, taskId);
          taskIds.push(taskId);

          // Poll for result
          console.log(`Starting to poll for image ${i + 1}...`);
          const imageUrl = await pollImageTask(taskId, i + 1, images.length);
          if (imageUrl) {
            console.log(`Image ${i + 1} generated successfully:`, imageUrl);
            generatedImageUrls.push(imageUrl);
            setStatusMessage(`Image ${i + 1} of ${images.length} generated successfully!`);
          } else {
            console.warn(`Image ${i + 1} generation completed but no URL returned`);
            toast.warning(`Image ${i + 1} generation may have failed`);
          }
        } catch (error: any) {
          console.error(`Failed to generate image ${i + 1}:`, error);
          toast.error(`Failed to generate image ${i + 1}: ${error.message || 'Unknown error'}`);
          // Continue with next image even if one fails
        }
      }

      setImageTaskIds(taskIds);
      console.log('Image generation completed. Generated URLs:', generatedImageUrls);
      return generatedImageUrls;
    } catch (error: any) {
      console.error('Image generation error:', error);
      throw error;
    }
  };

  const pollImageTask = async (taskId: string, imageIndex: number, totalImages: number, maxAttempts = 120): Promise<string | null> => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const resp = await fetch('/api/ai/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ taskId }),
        });

        if (!resp.ok) {
          throw new Error(`Request failed with status: ${resp.status}`);
        }

        const { code, message, data } = await resp.json();
        if (code !== 0) {
          throw new Error(message || 'Query task failed');
        }

        const task = data;
        const status = task.status as AITaskStatus;

        console.log(`[Poll ${attempt + 1}/${maxAttempts}] Task status:`, status, 'TaskId:', taskId);

        // Update status message based on task status
        if (status === AITaskStatus.PENDING) {
          setStatusMessage(`正在生成图像 ${imageIndex}/${totalImages}，请稍候... (${attempt + 1}/${maxAttempts})`);
        } else if (status === AITaskStatus.PROCESSING) {
          setStatusMessage(`正在处理图像 ${imageIndex}/${totalImages}，请稍候... (${attempt + 1}/${maxAttempts})`);
        }

        if (status === AITaskStatus.SUCCESS) {
          // Parse taskInfo - it's stored as JSON string in database
          let taskInfo = null;
          if (task.taskInfo) {
            try {
              taskInfo = typeof task.taskInfo === 'string' 
                ? JSON.parse(task.taskInfo) 
                : task.taskInfo;
            } catch (parseError) {
              console.error('Failed to parse taskInfo:', parseError, 'Raw taskInfo:', task.taskInfo);
              throw new Error('Failed to parse task result');
            }
          }

          console.log('TaskInfo parsed:', taskInfo);

          if (taskInfo?.images && Array.isArray(taskInfo.images) && taskInfo.images.length > 0) {
            const imageUrl = taskInfo.images[0].imageUrl;
            console.log('Generated image URL:', imageUrl);
            return imageUrl;
          }

          console.warn('No images found in taskInfo. TaskInfo structure:', taskInfo);
          throw new Error('Image generation completed but no image URL found');
        }

        if (status === AITaskStatus.FAILED) {
          const taskInfo = task.taskInfo ? (typeof task.taskInfo === 'string' ? JSON.parse(task.taskInfo) : task.taskInfo) : null;
          const errorMessage = taskInfo?.errorMessage || 'Image generation failed';
          console.error('Image generation failed:', errorMessage, taskInfo);
          throw new Error(errorMessage);
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error: any) {
        console.error(`[Poll ${attempt + 1}/${maxAttempts}] Error:`, error);
        if (attempt === maxAttempts - 1) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    throw new Error('Image generation timeout');
  };

  const handleDownload = (type: 'text' | 'image') => {
    if (!cloneResult) return;

    if (type === 'text') {
      const blob = new Blob([cloneResult.text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cloned-post-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (!referencePost) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl mt-20">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No reference post found</p>
              <Button onClick={() => router.push('/x-trending')} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Trending Posts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl mt-20">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/x-trending')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Sparkles className="h-4 w-4" />
          <span>Remake Post</span>
        </div> */}
        <h1 className="text-4xl font-bold mb-2">Remake Trending Post</h1>
        <p className="text-muted-foreground text-lg">
          AI-powered remake: rewrite text and regenerate images with your brand style
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Reference Post & Brand Info */}
        <div className="space-y-6">
          {/* Brand Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Brand Information
              </CardTitle>
              <CardDescription>Configure your brand settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brand-name">Brand Name</Label>
                <Input
                  id="brand-name"
                  placeholder="Your brand name"
                  value={brandInfo.name}
                  onChange={(e) => setBrandInfo({ ...brandInfo, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand-description">Brand Description</Label>
                <Textarea
                  id="brand-description"
                  placeholder="Brief description of your brand"
                  value={brandInfo.description}
                  onChange={(e) => setBrandInfo({ ...brandInfo, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={brandInfo.primaryColor}
                      onChange={(e) => setBrandInfo({ ...brandInfo, primaryColor: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={brandInfo.primaryColor}
                      onChange={(e) => setBrandInfo({ ...brandInfo, primaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={brandInfo.secondaryColor}
                      onChange={(e) => setBrandInfo({ ...brandInfo, secondaryColor: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={brandInfo.secondaryColor}
                      onChange={(e) => setBrandInfo({ ...brandInfo, secondaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <select
                    id="tone"
                    value={brandInfo.tone}
                    onChange={(e) => setBrandInfo({ ...brandInfo, tone: e.target.value as BrandInfo['tone'] })}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="creative">Creative</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="style">Style</Label>
                  <select
                    id="style"
                    value={brandInfo.style}
                    onChange={(e) => setBrandInfo({ ...brandInfo, style: e.target.value as BrandInfo['style'] })}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  >
                    <option value="minimalist">Minimalist</option>
                    <option value="modern">Modern</option>
                    <option value="classic">Classic</option>
                    <option value="trendy">Trendy</option>
                  </select>
                </div>
              </div>

              <Button 
                onClick={handleClone} 
                disabled={loading || !brandInfo.name.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Remaking...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Remake Post
                  </>
                )}
              </Button>
              {loading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-muted-foreground">{progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {statusMessage && (
                    <p className="text-xs text-muted-foreground">{statusMessage}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>


          {/* Reference Post */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Reference Post
              </CardTitle>
              <CardDescription>Original post to remake from</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {referencePost.author && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">{referencePost.author}</span>
                  {referencePost.author_handle && (
                    <span className="text-muted-foreground">@{referencePost.author_handle}</span>
                  )}
                </div>
              )}
              <div className="prose prose-sm max-w-none">
                <p className="text-base leading-relaxed whitespace-pre-wrap">{referencePost.content}</p>
              </div>
              {referencePost.images && referencePost.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {referencePost.images.slice(0, 2).map((imageUrl, index) => (
                    <div
                      key={index}
                      className="relative aspect-video rounded-lg overflow-hidden bg-muted cursor-pointer group"
                      onClick={() => setSelectedMedia({ url: imageUrl, type: 'image' })}
                    >
                      <Image
                        src={imageUrl}
                        alt={`Reference ${index + 1}`}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors">
                        <Maximize2 className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Clone Result */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Remade Result
              </CardTitle>
              <CardDescription>AI-remade post with your brand style</CardDescription>
            </CardHeader>
            <CardContent>
              {cloneResult ? (
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text" className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Text
                    </TabsTrigger>
                    <TabsTrigger value="media" className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Media
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4 mt-4">
                    <div className="prose prose-sm max-w-none bg-muted/50 p-4 rounded-lg border border-border">
                      <p className="text-base leading-relaxed whitespace-pre-wrap">{cloneResult.text}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(cloneResult.text);
                        }}
                        className="flex-1"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Text
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDownload('text')}
                        className="flex-1"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="media" className="space-y-4 mt-4">
                    {cloneResult.images && cloneResult.images.length > 0 ? (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          {cloneResult.images.map((imageUrl, index) => (
                            <div
                              key={index}
                              className="relative aspect-video rounded-lg overflow-hidden bg-muted border border-border group cursor-pointer"
                              onClick={() => setSelectedMedia({ url: imageUrl, type: 'image' })}
                            >
                              <Image
                                src={imageUrl}
                                alt={`Remade ${index + 1}`}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                                sizes="(max-width: 768px) 50vw, 25vw"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors">
                                <Maximize2 className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          ))}
                        </div>
                        {cloneResult.images && cloneResult.images.length > 0 && (
                          <p className="text-xs text-muted-foreground text-center">
                            Images have been remade using AI (nano banana pro) based on your brand style.
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No images generated yet</p>
                        <p className="text-xs mt-2">AI image generation coming soon</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium mb-2">Ready to remake</p>
                  <p className="text-sm">Fill in your brand information and click "Remake Post" to generate your customized content</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

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

