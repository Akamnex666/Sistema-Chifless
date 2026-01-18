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
   * @returns Base64 encoded HMAC signature
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
      .digest("base64");
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
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }

  /**
   * Generate a random secret for partner registration
   * @param length Length of the secret
   * @returns Random secret string
   */
  static generateSecret(length: number = 32): string {
    return crypto.randomBytes(length).toString("base64");
  }
}
