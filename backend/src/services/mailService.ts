import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export class MailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  static async sendCertificate(
    name: string,
    to: string,
    certificatePath: string,
    verificationCode: string
  ): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${verificationCode}`;

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject: 'Your Certificate is Ready!',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Congratulations ${name}!</h2>
            <p>Your certificate has been generated and is attached to this email.</p>
            <p>You can verify this certificate by visiting:</p>
            <a href="${verificationUrl}" style="color: #007bff; text-decoration: none;">
              ${verificationUrl}
            </a>
            <p>Thank you for participating!</p>
          </div>
        `,
        attachments: [
          {
            filename: `certificate_${name.replace(/\s+/g, '_')}.pdf`,
            path: certificatePath,
          },
        ],
      });
    } catch (error) {
      throw new Error(`Failed to send email: ${error}`);
    }
  }
}

