import AWS from 'aws-sdk';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

export class StorageService {
  private static s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
  });

  static async uploadFile(
    filePath: string,
    key: string,
    bucketName?: string
  ): Promise<string> {
    const bucket = bucketName || process.env.AWS_S3_BUCKET || 'certificate-generator';
    
    try {
      const fileContent = fs.readFileSync(filePath);

      const params = {
        Bucket: bucket,
        Key: key,
        Body: fileContent,
        ContentType: 'application/pdf',
        ACL: 'public-read',
      };

      const result = await this.s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      throw new Error(`Failed to upload file: ${error}`);
    }
  }

  static async deleteFile(key: string, bucketName?: string): Promise<void> {
    const bucket = bucketName || process.env.AWS_S3_BUCKET || 'certificate-generator';
    
    try {
      await this.s3.deleteObject({ Bucket: bucket, Key: key }).promise();
    } catch (error) {
      throw new Error(`Failed to delete file: ${error}`);
    }
  }
}

