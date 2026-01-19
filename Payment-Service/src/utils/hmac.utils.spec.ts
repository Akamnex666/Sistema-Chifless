import { HmacUtils } from "./hmac.utils";
import * as crypto from "crypto";

describe("HmacUtils", () => {
  const testPayload = { event: "payment.confirmed", paymentId: "123" };
  const testSecret = "test-secret-key-12345";

  describe("generateSignature", () => {
    it("should generate a consistent signature for the same payload and secret", () => {
      const sig1 = HmacUtils.generateSignature(testPayload, testSecret);
      const sig2 = HmacUtils.generateSignature(testPayload, testSecret);
      expect(sig1).toBe(sig2);
    });

    it("should generate different signatures for different payloads", () => {
      const sig1 = HmacUtils.generateSignature(
        { event: "payment.confirmed" },
        testSecret,
      );
      const sig2 = HmacUtils.generateSignature(
        { event: "payment.failed" },
        testSecret,
      );
      expect(sig1).not.toBe(sig2);
    });

    it("should generate different signatures for different secrets", () => {
      const sig1 = HmacUtils.generateSignature(testPayload, "secret1");
      const sig2 = HmacUtils.generateSignature(testPayload, "secret2");
      expect(sig1).not.toBe(sig2);
    });

    it("should work with string payloads", () => {
      const stringPayload = JSON.stringify(testPayload);
      const sig1 = HmacUtils.generateSignature(testPayload, testSecret);
      const sig2 = HmacUtils.generateSignature(stringPayload, testSecret);
      expect(sig1).toBe(sig2);
    });

    it("should generate hexadecimal signatures", () => {
      const sig = HmacUtils.generateSignature(testPayload, testSecret);
      expect(/^[0-9a-f]{64}$/.test(sig)).toBe(true); // SHA256 = 64 hex chars
    });
  });

  describe("verifySignature", () => {
    it("should verify a valid signature", () => {
      const signature = HmacUtils.generateSignature(testPayload, testSecret);
      const isValid = HmacUtils.verifySignature(
        testPayload,
        signature,
        testSecret,
      );
      expect(isValid).toBe(true);
    });

    it("should reject an invalid signature", () => {
      const signature = HmacUtils.generateSignature(testPayload, testSecret);
      const isValid = HmacUtils.verifySignature(
        testPayload,
        "invalid-signature",
        testSecret,
      );
      expect(isValid).toBe(false);
    });

    it("should reject a signature with wrong secret", () => {
      const signature = HmacUtils.generateSignature(testPayload, testSecret);
      const isValid = HmacUtils.verifySignature(
        testPayload,
        signature,
        "wrong-secret",
      );
      expect(isValid).toBe(false);
    });

    it("should reject a signature with modified payload", () => {
      const signature = HmacUtils.generateSignature(testPayload, testSecret);
      const modifiedPayload = { ...testPayload, paymentId: "999" };
      const isValid = HmacUtils.verifySignature(
        modifiedPayload,
        signature,
        testSecret,
      );
      expect(isValid).toBe(false);
    });

    it("should handle buffer length mismatches gracefully", () => {
      const signature = HmacUtils.generateSignature(testPayload, testSecret);
      const isValid = HmacUtils.verifySignature(
        testPayload,
        "short",
        testSecret,
      );
      expect(isValid).toBe(false);
    });
  });

  describe("generateSecret", () => {
    it("should generate a random secret", () => {
      const secret = HmacUtils.generateSecret();
      expect(secret).toBeDefined();
      expect(typeof secret).toBe("string");
    });

    it("should generate secrets of correct length", () => {
      const secret32 = HmacUtils.generateSecret(32);
      expect(secret32.length).toBe(64); // 32 bytes = 64 hex chars

      const secret16 = HmacUtils.generateSecret(16);
      expect(secret16.length).toBe(32); // 16 bytes = 32 hex chars
    });

    it("should generate different secrets each time", () => {
      const secret1 = HmacUtils.generateSecret();
      const secret2 = HmacUtils.generateSecret();
      expect(secret1).not.toBe(secret2);
    });

    it("should generate hexadecimal secrets", () => {
      const secret = HmacUtils.generateSecret();
      expect(/^[0-9a-f]+$/.test(secret)).toBe(true);
    });
  });

  describe("createSignedPayload", () => {
    it("should create a signed payload with timestamp", () => {
      const result = HmacUtils.createSignedPayload(testPayload, testSecret);
      expect(result).toHaveProperty("signature");
      expect(result).toHaveProperty("payload");
      expect(result).toHaveProperty("timestamp");
      expect(result.payload).toHaveProperty("timestamp");
    });

    it("should use provided timestamp if given", () => {
      const customTime = 1234567890000;
      const result = HmacUtils.createSignedPayload(
        testPayload,
        testSecret,
        customTime,
      );
      expect(result.timestamp).toBe(customTime);
      expect(result.payload.timestamp).toBe(customTime);
    });

    it("should include original payload data in result", () => {
      const result = HmacUtils.createSignedPayload(testPayload, testSecret);
      expect(result.payload.event).toBe(testPayload.event);
      expect(result.payload.paymentId).toBe(testPayload.paymentId);
    });
  });

  describe("verifySignedPayload", () => {
    it("should verify a valid signed payload with timestamp", () => {
      const { signature, payload } = HmacUtils.createSignedPayload(
        testPayload,
        testSecret,
      );
      const isValid = HmacUtils.verifySignedPayload(
        payload,
        signature,
        testSecret,
      );
      expect(isValid).toBe(true);
    });

    it("should reject a payload with missing timestamp", () => {
      const signature = HmacUtils.generateSignature(testPayload, testSecret);
      const isValid = HmacUtils.verifySignedPayload(
        testPayload,
        signature,
        testSecret,
      );
      expect(isValid).toBe(false);
    });

    it("should reject an expired payload", () => {
      const oldTimestamp = Date.now() - 10 * 60 * 1000; // 10 minutes ago
      const { signature, payload } = HmacUtils.createSignedPayload(
        testPayload,
        testSecret,
        oldTimestamp,
      );
      const isValid = HmacUtils.verifySignedPayload(
        payload,
        signature,
        testSecret,
        5 * 60 * 1000, // 5 minute max age
      );
      expect(isValid).toBe(false);
    });

    it("should reject a payload with future timestamp", () => {
      const futureTimestamp = Date.now() + 10 * 60 * 1000; // 10 minutes in future
      const { signature, payload } = HmacUtils.createSignedPayload(
        testPayload,
        testSecret,
        futureTimestamp,
      );
      const isValid = HmacUtils.verifySignedPayload(
        payload,
        signature,
        testSecret,
      );
      expect(isValid).toBe(false);
    });

    it("should accept a payload within maxAge", () => {
      const timestamp = Date.now() - 2 * 60 * 1000; // 2 minutes ago
      const { signature, payload } = HmacUtils.createSignedPayload(
        testPayload,
        testSecret,
        timestamp,
      );
      const isValid = HmacUtils.verifySignedPayload(
        payload,
        signature,
        testSecret,
        5 * 60 * 1000, // 5 minute max age
      );
      expect(isValid).toBe(true);
    });

    it("should reject if signature is invalid", () => {
      const { payload } = HmacUtils.createSignedPayload(
        testPayload,
        testSecret,
      );
      const isValid = HmacUtils.verifySignedPayload(
        payload,
        "wrong-signature",
        testSecret,
      );
      expect(isValid).toBe(false);
    });

    it("should handle errors gracefully", () => {
      const invalidPayload = { timestamp: "not-a-number" } as any;
      const isValid = HmacUtils.verifySignedPayload(
        invalidPayload,
        "signature",
        testSecret,
      );
      expect(isValid).toBe(false);
    });
  });
});
