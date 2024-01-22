import { Multer } from 'multer';

export class FileUploadDto {
  readonly file: Multer.File;
}
