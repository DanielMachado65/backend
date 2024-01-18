import { Injectable } from '@nestjs/common';
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

    const fileEntity = await this.save(file, req);

    console.log('fileEntity', fileEntity, fileExtName);

    // if (fileExtName === '.xlsx') {
    //   this._processXLSXFile(fileEntity, file.buffer);
    // } else if (fileExtName === '.csv') {
    //   this._processCSVFile(fileEntity, file.buffer);
    // } else {
    //   throw new BadRequestException('Formato de arquivo não suportado.');
    // }

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

    // Supondo que você quer ler a primeira planilha
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    fileEntity.data = jsonData;
    await this.fileRepository.update(fileEntity.id, {
      data: jsonData,
    });

    // Agora jsonData é um array de objetos, cada objeto representando uma linha da planilha

    // Processamento adicional e salvar no banco de dados
  }

  private async _processCSVFile(fileEntity: FileEntity, fileBuffer: Buffer) {
    const fileContent = fileBuffer.toString('utf8');

    await Papa.parse(fileContent, {
      complete: async (result) => {
        const jsonData = result.data;
        // jsonData é um array de arrays ou objetos, dependendo da configuração
        // Processamento adicional e salvar no banco de dados
        await this.fileRepository.update(fileEntity.id, {
          data: jsonData,
        });
      },
      header: true, // Se o CSV tem cabeçalhos, os objetos terão chaves correspondentes
      skipEmptyLines: true,
      dynamicTyping: true,
    });
  }
}
