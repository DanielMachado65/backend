import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import * as Multer from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import * as XLSX from 'xlsx';
import * as Papa from 'papaparse';

@Controller('file-upload')
export class FileUploadController {
  @Post()
  @UseInterceptors(FileInterceptor('files'))
  async uploadFile(@UploadedFile() file: Multer.File) {
    const fileExtName = extname(file.originalname).toLowerCase();

    if (fileExtName === '.xlsx') {
      this.processXLSXFile(file.buffer);
    } else if (fileExtName === '.csv') {
      this.processCSVFile(file.buffer);
    } else {
      throw new BadRequestException('Formato de arquivo não suportado.');
    }
  }

  processXLSXFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Converte a planilha para JSON
      const json = XLSX.utils.sheet_to_json(worksheet);

      console.log('Dados da Planilha XLSX:', json);
    };
    reader.readAsBinaryString(file);
  }

  processCSVFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        console.log('Dados do CSV:', results.data);
      },
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
  }
}
