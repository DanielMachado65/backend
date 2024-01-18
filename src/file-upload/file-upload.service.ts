import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { Request } from 'express';
import * as Multer from 'multer';

import { extname } from 'path';

import * as XLSX from 'xlsx';
import * as Papa from 'papaparse';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) {}

  async exec(file: Multer.File) {
    const fileExtName = extname(file.originalname).toLowerCase();

    if (fileExtName === '.xlsx') {
      this.processXLSXFile(file.buffer);
    } else if (fileExtName === '.csv') {
      this.processCSVFile(file.buffer);
    } else {
      throw new Error('Formato de arquivo não suportado.');
    }
  }

  async save(file: Multer.File, req: Request) {
    const arquivo = new File();
    arquivo.fileName = file.originalname;
    arquivo.contentLength = file.size;
    arquivo.contentType = file.mimetype;
    arquivo.url = `${req.protocol}://${req.get('host')}/files/${file.filename}`;

    console.log('arquivo', arquivo);

    try {
      return await this.fileRepository.save(arquivo);
    } catch (err) {
      console.error('save', err);
    }
  }

  processXLSXFile(fileBuffer: Buffer) {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    // Supondo que você quer ler a primeira planilha
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    console.log('xlsx', jsonData);

    // Agora jsonData é um array de objetos, cada objeto representando uma linha da planilha

    // Processamento adicional e salvar no banco de dados
  }

  processCSVFile(fileBuffer: Buffer) {
    const fileContent = fileBuffer.toString('utf8');

    Papa.parse(fileContent, {
      complete: (result) => {
        const jsonData = result.data;
        // jsonData é um array de arrays ou objetos, dependendo da configuração
        // Processamento adicional e salvar no banco de dados
        console.log('csv', jsonData);
      },
      header: true, // Se o CSV tem cabeçalhos, os objetos terão chaves correspondentes
      skipEmptyLines: true,
      dynamicTyping: true,
    });
  }
}
