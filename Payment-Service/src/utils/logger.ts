/**
 * Logger Utility
 * Simple logging utility for Payment Service
 */
export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  log(message: string, data?: any) {
    console.log(
      `[${new Date().toISOString()}] [${this.context}] INFO: ${message}`,
      data || "",
    );
  }

  error(message: string, error?: any) {
    console.error(
      `[${new Date().toISOString()}] [${this.context}] ERROR: ${message}`,
      error || "",
    );
  }

  warn(message: string, data?: any) {
    console.warn(
      `[${new Date().toISOString()}] [${this.context}] WARN: ${message}`,
      data || "",
    );
  }

  debug(message: string, data?: any) {
    if (process.env.NODE_ENV === "development") {
      console.debug(
        `[${new Date().toISOString()}] [${this.context}] DEBUG: ${message}`,
        data || "",
      );
    }
  }
}
