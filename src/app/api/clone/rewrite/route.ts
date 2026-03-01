import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

import { respData, respErr } from '@/shared/lib/resp';
import { getAllConfigs } from '@/shared/models/config';
import { getUserInfo } from '@/shared/models/user';

export async function POST(request: Request) {
  try {
    const { originalText, brandInfo } = await request.json();

    if (!originalText) {
      throw new Error('originalText is required');
    }

    if (!brandInfo || !brandInfo.name) {
      throw new Error('brandInfo is required');
    }

    // check user sign
    const user = await getUserInfo();
    if (!user) {
      throw new Error('no auth, please sign in');
    }

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

    // Build prompt for rewriting
    const toneDescriptions = {
      professional: 'professional and formal',
      casual: 'casual and friendly',
      creative: 'creative and innovative',
      bold: 'bold and attention-grabbing',
    };

    const styleDescriptions = {
      minimalist: 'minimalist and concise',
      modern: 'modern and contemporary',
      classic: 'classic and timeless',
      trendy: 'trendy and current',
    };

    const toneDesc = toneDescriptions[brandInfo.tone as keyof typeof toneDescriptions] || 'professional';
    const styleDesc = styleDescriptions[brandInfo.style as keyof typeof styleDescriptions] || 'modern';

    const prompt = `You are a social media content writer. Rewrite the following post content to match the brand's voice and style.

Original Post:
${originalText}

Brand Information:
- Brand Name: ${brandInfo.name}
- Brand Description: ${brandInfo.description || 'Not provided'}
- Tone: ${toneDesc}
- Style: ${styleDesc}
- Primary Color: ${brandInfo.primaryColor || 'Not specified'}
- Secondary Color: ${brandInfo.secondaryColor || 'Not specified'}

Requirements:
1. Keep the core message and intent of the original post
2. Adapt the language and style to match the brand's ${toneDesc} tone and ${styleDesc} style
3. Make it feel authentic to the brand: ${brandInfo.name}
4. Maintain engagement and appeal
5. Keep it concise and suitable for social media (X/Twitter)
6. Do not include hashtags unless they were in the original
7. Preserve any important information or call-to-action from the original

Rewrite the post now:`;

    const result = await generateText({
      model: openrouter.chat('google/gemini-2.5-flash-lite'), // Use a cost-effective model
      prompt,
      maxTokens: 500,
    } as any);

    return respData({
      rewrittenText: result.text.trim(),
    });
  } catch (e: any) {
    console.log('rewrite failed:', e);
    return respErr(e.message);
  }
}

