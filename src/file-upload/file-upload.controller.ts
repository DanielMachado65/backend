import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import * as Multer from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';

@Controller('file-upload')
export class FileUploadController {
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Multer.File) {
    const fileExtName = extname(file.originalname).toLowerCase();

    if (fileExtName === '.xlsx') {
      // Processamento para arquivo XLSX
    } else if (fileExtName === '.csv') {
      // Processamento para arquivo CSV
    } else {
      throw new Error('Formato de arquivo não suportado');
    }
  }
}
