/**
 * Retry Mechanism Utility
 * Handle retry logic for failed webhook dispatches
 */
export class RetryUtils {
  /**
   * Default retry configuration
   */
  static readonly DEFAULT_MAX_ATTEMPTS = 3;
  static readonly DEFAULT_BACKOFF_MULTIPLIER = 2;
  static readonly DEFAULT_INITIAL_DELAY = 1000; // 1 second

  /**
   * Calculate next retry delay using exponential backoff
   * @param attempt The current attempt number (0-indexed)
   * @param baseDelay The base delay in milliseconds
   * @param multiplier The backoff multiplier
   * @returns Delay in milliseconds
   */
  static calculateBackoffDelay(
    attempt: number,
    baseDelay: number = this.DEFAULT_INITIAL_DELAY,
    multiplier: number = this.DEFAULT_BACKOFF_MULTIPLIER,
  ): number {
    return baseDelay * Math.pow(multiplier, attempt);
  }

  /**
   * Check if should retry based on attempt count
   * @param attempt Current attempt number (0-indexed)
   * @param maxAttempts Maximum retry attempts
   * @returns True if should retry
   */
  static shouldRetry(
    attempt: number,
    maxAttempts: number = this.DEFAULT_MAX_ATTEMPTS,
  ): boolean {
    return attempt < maxAttempts;
  }

  /**
   * Get retry attempt number for display
   * @param index 0-indexed attempt
   * @returns Human-readable attempt number
   */
  static getAttemptNumber(index: number): number {
    return index + 1;
  }
}
