import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export class MailService {
  /*
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true' || false, // explicit toggle for SSL
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  */

  /**
   * Sends a certificate email with attachment and verification link.
   */
  static async sendCertificate(
    name: string,
    to: string,
    certificatePath: string,
    verificationCode: string
  ): Promise<void> {
    
    // --- MAIL SERVICE DISABLED ---
    console.log(`(Mail Service Disabled) Skipped sending email to ${to} for ${name}.`);
    return Promise.resolve();
    // --- END DISABLED ---

    /*
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationUrl = `${frontendUrl}/verify/${verificationCode}`;

    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

    const mailOptions = {
      from: `"Certificate Issuer" <${fromAddress}>`,
      to,
      subject: `🎓 Your Certificate is Ready, ${name}!`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">
          <h2 style="color: #4CAF50;">Congratulations ${name} 🎉</h2>
          <p>We’re delighted to inform you that your certificate has been successfully generated!</p>

          <p><strong>Verification Link:</strong></p>
          <a href="${verificationUrl}" target="_blank"
             style="display:inline-block; padding:10px 20px; background-color:#4CAF50; color:white;
                    text-decoration:none; border-radius:5px; font-weight:bold;">
            Verify Certificate
          </a>

          <p style="margin-top: 15px;">You can also view your certificate by opening the attached PDF file.</p>
          <p>Thank you for being part of our event!</p>

          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
          <p style="font-size: 12px; color: #777;">
            This is an automated email. Please do not reply.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `certificate_${name.replace(/\s+/g, '_')}.pdf`,
          path: certificatePath,
          contentType: 'application/pdf',
        },
      ],
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Certificate email sent to ${to}`);
    } catch (error: any) {
      console.error(`❌ Failed to send certificate email to ${to}:`, error);
      throw new Error(`Failed to send certificate email: ${error.message || error}`);
    }
    */
  }
}