// src/modules/advertising/application/command/upload-photo.command.ts
import { ICommand } from '@nestjs/cqrs';
import { MultipartFile } from '@fastify/multipart';

export class UploadPhotoCommand implements ICommand {
  constructor(
    readonly adId: string,
    readonly file: MultipartFile,
  ) {}
}

// Install required package:
// npm install @fastify/multipart
