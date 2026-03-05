import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import NodeClam from 'clamscan'
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class UploadService {
  // private drive;
  // private folderId: string;
  private clamscan: any;
  private client: S3Client;
  private bucketName: string


  private async scanFile(file: Express.Multer.File):Promise<boolean> {
    try {
      const { isInfected, viruses } = await this.clamscan.scanBuffer(file.buffer);
      if (isInfected) {
        console.warn(`File ${file.originalname} is infected with: ${viruses}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error scanning file:', error);
      throw new Error('File scanning failed');
    }
  } 

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('B2_BUCKET_NAME')!;


    this.clamscan = new NodeClam().init({
      removeInfected: true,
      quarantineInfected: false,
      debugMode: true,
      clamdscan: {
        host: '127.0.0.1',
        port: 3310,
        timeout: 60000,
        localFallback: true,
      },
      preference: 'clamscan',

    })

    this.client = new S3Client({
    region: 'us-west-005',
    endpoint: this.configService.get<string>('S3_URL'),
    credentials: {
      accessKeyId: this.configService.get<string>('B2_KEY_ID')!,
      secretAccessKey: this.configService.get<string>('B2_APP_KEY')!,
    },
    forcePathStyle: true,
  });

  }

  async uploadFile(
    file: Express.Multer.File,
    filename: string,
    // folderId: string = this.folderId,
  ) {

    try {
      
      // 1️⃣ Scan the file for viruses
      // const isInfected = await this.scanFile(file);
      //   if (isInfected) {
      //     throw new Error(`File is infected`);
      //   }

        const Key = `uploads-${randomUUID()}-${file.filename}`
      
        // 2️⃣ Upload to S3-compatible storage (e.g., Backblaze B2) 
         const upload  = await this.client.send(
          new PutObjectCommand({
            Bucket: this.bucketName,
            Key,
            Body: fs.createReadStream(file.path),
            ContentType: file.mimetype,
          }),
        );
    upload && console.log('File uploaded successfully to S3:', upload);

        fs.unlinkSync(file.path);
    
        return Key;
    } catch (error) {
      console.error('Error uploading file:', error);
      file.path && fs.existsSync(file.path) && fs.unlinkSync(file.path);  
      throw new Error('File upload failed');
    }


  }

  async getFile(storageId: string): Promise<any> {

    // const response = await this.drive.files.get({
    //   fileId: fileId,
    //   alt: 'media',
    // });


const command = new GetObjectCommand({
  Bucket: this.bucketName,
  Key: storageId,
});

const url = await getSignedUrl(this.client, command, {
  expiresIn: 60 * 5,
});

    return url;
  }

  async deleteFile(fileId: string) {

try{
    const command = new DeleteObjectCommand({ 
      Bucket: this.bucketName,
      Key: fileId,
    });

    await this.client.send(command);
    console.log(`File with key ${fileId} deleted successfully from S3.`); 
} catch (error) {
    console.error('Error deleting file from S3:', error);
    throw new Error('File deletion failed');
}

    // return await this.drive.files.delete({
    //   fileId,
    // });
  }
}
