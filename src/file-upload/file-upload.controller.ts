import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Req,
  Get,
  Param,
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
    return await this.fileUploadService.upload(file, req);
  }

  @Get(':fileId')
  async getFile(@Param('fileId') fileId: string) {
    return await this.fileUploadService.getFile(fileId);
  }
}
