import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { FileService } from './file.service';
import { FileUploadDto } from './dto/file-upload.dto';

@Controller('file')
export class FileController {
  constructor(private readonly fileUploadService: FileService) {}

  @Post('/upload')
  @UseInterceptors(FileInterceptor('files'))
  async uploadFile(@UploadedFile() file: FileUploadDto) {
    return await this.fileUploadService.upload(file);
  }

  @Get('/:fileId')
  async getFile(@Param('fileId') fileId: string) {
    return await this.fileUploadService.getFile(fileId);
  }
}
