import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { FileUploadService } from './file-upload.service';
import { FileUploadDto } from './dto/file-upload.dto';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('files'))
  async uploadFile(@UploadedFile() file: FileUploadDto) {
    return await this.fileUploadService.upload(file);
  }

  @Get(':fileId')
  async getFile(@Param('fileId') fileId: string) {
    return await this.fileUploadService.getFile(fileId);
  }
}
