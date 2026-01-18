/**
 * Event Normalization Utility
 * Normalize payment events from different providers to standard format
 */
export class EventNormalizationUtils {
  /**
   * Normalize payment status from provider-specific format to standard
   * @param providerStatus The provider's status format
   * @param provider The payment provider name
   * @returns Standardized status
   */
  static normalizeStatus(providerStatus: string, provider: string): string {
    const statusMap: Record<string, Record<string, string>> = {
      stripe: {
        succeeded: "completed",
        processing: "processing",
        requires_action: "pending",
        requires_capture: "pending",
        requires_confirmation: "pending",
        requires_payment_method: "failed",
        canceled: "cancelled",
      },
      mock: {
        completed: "completed",
        failed: "failed",
        pending: "pending",
      },
    };

    const providerMap = statusMap[provider.toLowerCase()] || {};
    return providerMap[providerStatus.toLowerCase()] || providerStatus;
  }

  /**
   * Generate normalized event
   * @param data Event data from provider
   * @returns Normalized event object
   */
  static generateNormalizedEvent(
    data: Record<string, any>,
  ): Record<string, any> {
    return {
      id: data.id || data.transactionId,
      eventType: data.eventType,
      transactionId: data.transactionId,
      orderId: data.orderId,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      timestamp: data.timestamp || new Date().toISOString(),
      provider: data.provider,
      metadata: data.metadata || {},
    };
  }
}
