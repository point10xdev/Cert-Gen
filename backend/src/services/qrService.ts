import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export class QRService {
  /**
   * Generates a QR code from input data.
   * Returns a base64 Data URL by default or saves it to disk if `outputPath` is provided.
   */
  static async generateQRCode(data: string, outputPath?: string): Promise<string> {
    try {
      // Generate QR as base64 Data URL
      const qrCodeDataURL = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        width: 300,
      });

      // If an output path is specified, save it as a PNG file
      if (outputPath) {
        const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync(outputPath, base64Data, 'base64');
        return outputPath;
      }

      return qrCodeDataURL;
    } catch (error) {
      console.error('QR generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generates a unique verification code using UUID v4.
   */
  static generateVerificationCode(): string {
    return uuidv4();
  }

  /**
   * Creates a SHA-256 HMAC hash for secure verification.
   * Useful for validating authenticity without storing raw codes.
   */
  static hashCode(code: string): string {
    const secret = process.env.VERIFICATION_SECRET || 'default-secret';
    return crypto.createHmac('sha256', secret).update(code).digest('hex');
  }
}
