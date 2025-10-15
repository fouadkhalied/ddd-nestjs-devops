import { ICommand } from '@nestjs/cqrs';

export class UploadPhotoCommand implements ICommand {
  constructor(
    readonly adId: string,
    readonly file: Express.Multer.File,
  ) {}
}
