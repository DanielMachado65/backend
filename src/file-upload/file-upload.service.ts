import { Injectable } from '@nestjs/common';
import { File } from './entities/file.entity';
import { Request } from 'express';
import * as Multer from 'multer';

import { extname } from 'path';

import * as XLSX from 'xlsx';
import * as Papa from 'papaparse';

@Injectable()
export class FileUploadService {
  constructor() {}

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
    arquivo.filename = file.filename;
    arquivo.contentLength = file.size;
    arquivo.contentType = file.mimetype;
    arquivo.url = `${req.protocol}://${req.get('host')}/files/${file.filename}`;

    try {
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
    Papa.parse(fileBuffer, {
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
