import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import * as fs from 'fs';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  private drive;
  private folderId: string;

  constructor(private configService: ConfigService) {
    const auth = new google.auth.GoogleAuth({
        keyFile : "/Users/Uche/Downloads/tidy-gravity-484617-k6-da3b7e6e45e3.json",
    //   keyFile: this.configService.get<string>('GOOGLE_KEY_PATH'),
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    this.folderId = this.configService.get<string>('GOOGLE_FOLDER_ID')!;
    this.drive = google.drive({ version: 'v3', auth });
    console.log("KEYS=====>",this.configService.get<string>('GOOGLE_KEY_PATH'))
  }


  async uploadFile(
    file: Express.Multer.File,
    filename: string,
    folderId: string = this.folderId,
  ) {
    const response = await this.drive.files.create({
      requestBody: {
        name: filename,
        parents: folderId ? [folderId] : [],
      },
      media: {
        mimeType: file.mimetype,
        body: Readable.from(file.buffer),
      },
      fields: 'id, webViewLink, webContentLink',
    });

    return response.data;
  }

  async getFile(fileId: string): Promise<any> {
    const response = await this.drive.files.get({
      fileId: fileId,
      alt: 'media',
    });

    return response.data;
  }

  async deleteFile(fileId: string) {
    return await this.drive.files.delete({
      fileId,
    });
  }
}
