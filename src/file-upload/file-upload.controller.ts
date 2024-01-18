import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
} from '@nestjs/common';
import * as Multer from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

import { FileUploadService } from './file-upload.service';
import { Request } from 'express';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('files'))
  async uploadFile(@UploadedFile() file: Multer.File, @Req() req: Request) {
    if (!file) {
      throw new BadRequestException('Arquivo não enviado.');
    }

    try {
      const arquivo = await this.fileUploadService.save(file, req);

      await this.fileUploadService.exec(file);
      return arquivo;
    } catch (error) {
      console.error(error);
    }
  }
}
