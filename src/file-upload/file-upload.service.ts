import { BadRequestException, Injectable } from '@nestjs/common';
import { MongoRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { Request } from 'express';
import * as Multer from 'multer';

import { extname } from 'path';

import * as XLSX from 'xlsx';
import * as Papa from 'papaparse';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(FileEntity)
    private fileRepository: MongoRepository<FileEntity>,
  ) {}

  async upload(file: Multer.File, req: Request) {
    const fileExtName = extname(file.originalname).toLowerCase();

    if (!['.xlsx', '.csv'].includes(fileExtName)) {
      throw new BadRequestException('Formato de arquivo não suportado.');
    }

    const fileEntity = await this.save(file, req);

    if (fileExtName === '.xlsx') {
      await this._processXLSXFile(fileEntity, file.buffer);
    } else if (fileExtName === '.csv') {
      await this._processCSVFile(fileEntity, file.buffer);
    }

    return fileEntity;
  }

  async save(file: Multer.File, req: Request) {
    const arquivo = new FileEntity({
      fileName: file.originalname,
      contentLength: file.size,
      contentType: file.mimetype,
      url: `${req.protocol}://${req.get('host')}/files/${file.originalname}`,
    });

    return await this.fileRepository.save(arquivo);
  }

  private async _processXLSXFile(fileEntity: FileEntity, fileBuffer: Buffer) {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    fileEntity.data = jsonData;
    await this.fileRepository.update(fileEntity.id, {
      data: jsonData,
    });
  }

  private async _processCSVFile(fileEntity: FileEntity, fileBuffer: Buffer) {
    const fileContent = fileBuffer.toString('utf8');

    await Papa.parse(fileContent, {
      complete: async (result) => {
        const jsonData = result.data;
        await this.fileRepository.update(fileEntity.id, {
          data: jsonData,
        });
      },
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
  }
}
