import { Injectable } from '@nestjs/common';
import { Define } from 'agenda-nest';
import { MongoRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity, FileEntityStatus } from 'src/file/entities/file.entity';

import * as Multer from 'multer';

import * as XLSX from 'xlsx';
import * as Papa from 'papaparse';

@Injectable()
export class FileJobService {
  constructor(
    @InjectRepository(FileEntity)
    private fileRepository: MongoRepository<FileEntity>,
  ) {}

  @Define('meu job')
  async processFile(
    fileEntity: FileEntity,
    file: Multer.File,
    fileExtName: string,
  ) {
    if (fileExtName === '.xlsx') {
      await this._processXLSXFile(fileEntity, file.buffer);
    } else if (fileExtName === '.csv') {
      await this._processCSVFile(fileEntity, file.buffer);
    } else {
      throw new Error('Formato de arquivo não suportado.');
    }
  }

  private async _processXLSXFile(fileEntity: FileEntity, fileBuffer: Buffer) {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    fileEntity.data = jsonData;
    await this.fileRepository.update(fileEntity.id, {
      data: jsonData,
      status: FileEntityStatus.Completed,
    });
  }

  private async _processCSVFile(fileEntity: FileEntity, fileBuffer: Buffer) {
    const fileContent = fileBuffer.toString('utf8');
    await Papa.parse(fileContent, {
      complete: async (result) => {
        const jsonData = result.data;
        await this.fileRepository.update(fileEntity.id, {
          data: jsonData,
          status: FileEntityStatus.Completed,
        });
      },
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
  }
}
