import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export class QRService {
  static async generateQRCode(data: string, outputPath?: string): Promise<string> {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        width: 300,
      });

      if (outputPath) {
        const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync(outputPath, base64Data, 'base64');
        return outputPath;
      }

      return qrCodeDataURL;
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error}`);
    }
  }

  static generateVerificationCode(): string {
    return uuidv4();
  }

  static hashCode(code: string): string {
    const secret = process.env.VERIFICATION_SECRET || 'default-secret';
    return crypto.createHmac('sha256', secret).update(code).digest('hex');
  }
}

