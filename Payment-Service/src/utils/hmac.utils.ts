import * as crypto from "crypto";

/**
 * HMAC Utility Functions
 * Handle HMAC signature generation and verification for webhook security
 */
export class HmacUtils {
  /**
   * Generate HMAC signature for webhook payload
   * @param payload The webhook payload data
   * @param secret The secret key for signing
   * @returns Hexadecimal encoded HMAC signature
   */
  static generateSignature(
    payload: Record<string, any> | string,
    secret: string,
  ): string {
    const data =
      typeof payload === "string" ? payload : JSON.stringify(payload);
    const signature = crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("hex");
    return signature;
  }

  /**
   * Verify HMAC signature from webhook request
   * @param payload The received payload
   * @param signature The received signature
   * @param secret The secret key
   * @returns True if signature is valid
   */
  static verifySignature(
    payload: Record<string, any> | string,
    signature: string,
    secret: string,
  ): boolean {
    try {
      const expectedSignature = this.generateSignature(payload, secret);
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature),
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate a random secret for partner registration
   * @param bytes Length of the secret in bytes (default: 32 = 64 hex chars)
   * @returns Random secret string in hexadecimal
   */
  static generateSecret(bytes: number = 32): string {
    return crypto.randomBytes(bytes).toString("hex");
  }

  /**
   * Create a signed webhook payload with timestamp
   * @param payload The webhook data
   * @param secret The secret key
   * @param timestamp Optional timestamp (default: current time)
   * @returns Object with signature, payload, and timestamp
   */
  static createSignedPayload(
    payload: Record<string, any>,
    secret: string,
    timestamp: number = Date.now(),
  ): { signature: string; payload: Record<string, any>; timestamp: number } {
    const payloadWithTimestamp = { ...payload, timestamp };
    const signature = this.generateSignature(payloadWithTimestamp, secret);
    return {
      signature,
      payload: payloadWithTimestamp,
      timestamp,
    };
  }

  /**
   * Verify a signed webhook payload with timestamp validation
   * @param payload The received payload
   * @param signature The received signature
   * @param secret The secret key
   * @param maxAgeMs Maximum age of webhook in milliseconds (default: 5 minutes)
   * @returns True if signature and timestamp are valid
   */
  static verifySignedPayload(
    payload: Record<string, any>,
    signature: string,
    secret: string,
    maxAgeMs: number = 5 * 60 * 1000,
  ): boolean {
    try {
      const timestamp = payload.timestamp;
      if (!timestamp || typeof timestamp !== "number") {
        return false;
      }

      // Check if timestamp is within acceptable range
      const now = Date.now();
      if (now - timestamp > maxAgeMs || timestamp > now) {
        return false;
      }

      // Verify the signature
      return this.verifySignature(payload, signature, secret);
    } catch (error) {
      return false;
    }
  }
}
