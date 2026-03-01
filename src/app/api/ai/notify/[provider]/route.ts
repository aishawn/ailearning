import { NextRequest } from 'next/server';
import { AITaskStatus } from '@/extensions/ai';
import { findAITaskById, updateAITaskById } from '@/shared/models/ai_task';
import { getAIService } from '@/shared/services/ai';

/**
 * Handle AI provider webhook notifications
 * This endpoint receives callbacks from AI providers when tasks complete
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;

    if (!provider) {
      return Response.json(
        { error: 'Provider parameter is required' },
        { status: 400 }
      );
    }

    // Get webhook payload
    const payload = await req.json();
    console.log(`[${provider}] webhook payload:`, JSON.stringify(payload, null, 2));
    
    // Log detailed error information if available
    if (payload.payload && payload.payload.detail) {
      console.log(`[${provider}] FAL error details:`, JSON.stringify(payload.payload.detail, null, 2));
    }

    // Validate provider
    const aiService = await getAIService();
    const aiProvider = aiService.getProvider(provider);
    if (!aiProvider) {
      return Response.json(
        { error: `Invalid provider: ${provider}` },
        { status: 400 }
      );
    }

    // Extract task ID from payload based on provider
    let taskId: string | undefined;
    let taskStatus: AITaskStatus;
    let taskResult: any;

    if (provider === 'fal') {
      // FAL webhook payload structure
      taskId = payload.request_id;
      taskStatus = mapFalStatus(payload.status);
      taskResult = payload;
    } else {
      // Generic fallback - adapt for other providers
      taskId = payload.taskId || payload.request_id || payload.id;
      taskStatus = payload.status || AITaskStatus.FAILED;
      taskResult = payload;
    }

    if (!taskId) {
      return Response.json(
        { error: 'Task ID not found in webhook payload' },
        { status: 400 }
      );
    }

    // Find the AI task in our database
    const aiTask = await findAITaskById(taskId);
    if (!aiTask) {
      console.warn(`[${provider}] AI task not found: ${taskId}`);
      return Response.json(
        { error: 'AI task not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      status: taskStatus,
      taskResult: JSON.stringify(taskResult),
      updatedAt: new Date(),
    };

    // Handle success case - extract results
    if (taskStatus === AITaskStatus.SUCCESS) {
      try {
        // Use the provider's query method to get formatted results if available
        if (aiProvider && typeof aiProvider.query === 'function' && aiTask.model && aiTask.mediaType) {
          const providerResult = await aiProvider.query({
            taskId,
            model: aiTask.model,
            mediaType: aiTask.mediaType as any,
          });

          updateData.taskInfo = JSON.stringify(providerResult.taskInfo || {});
          updateData.taskResult = JSON.stringify(providerResult.taskResult || taskResult);
        }
      } catch (error) {
        console.error(`[${provider}] Failed to query task result:`, error);
        // Continue with basic update if query fails
      }
    }

    // Handle failure case - store error info in taskResult
    if (taskStatus === AITaskStatus.FAILED) {
      const errorInfo = {
        error_message: payload.error_message || payload.error || 'Task failed',
        error_code: payload.error_code || 'WEBHOOK_FAILURE',
        original_payload: payload,
      };
      updateData.taskResult = JSON.stringify(errorInfo);
    }

    // Update the AI task
    await updateAITaskById(taskId, updateData);

    console.log(`[${provider}] AI task updated successfully: ${taskId} -> ${taskStatus}`);

    return Response.json({
      success: true,
      message: 'Webhook processed successfully',
      taskId,
      status: taskStatus,
    });

  } catch (error: any) {
    console.error('Webhook processing failed:', error);
    return Response.json(
      {
        error: 'Failed to process webhook',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Map FAL status to our internal status
 */
function mapFalStatus(status: string): AITaskStatus {
  switch (status?.toLowerCase()) {
    case 'in_progress':
    case 'in_queue':
      return AITaskStatus.PROCESSING;
    case 'completed':
      return AITaskStatus.SUCCESS;
    case 'failed':
      return AITaskStatus.FAILED;
    default:
      return AITaskStatus.PENDING;
  }
}

/**
 * Handle GET requests (for webhook verification if needed)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  
  return Response.json({
    message: `AI webhook endpoint for ${provider}`,
    status: 'active',
  });
}
