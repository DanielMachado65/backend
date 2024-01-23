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
  private fieldMapping = {
    'quantidade cobranças': 'charge_quantity',
    'cobrada a cada X dias': 'charged_every_x_days',
    'data início': 'start_date',
    status: 'status',
    'data status': 'status_date',
    'data cancelamento': 'cancellation_date',
    valor: 'value',
    'próximo ciclo': 'next_cycle',
    'ID assinante': 'subscriber_id',
  };

  private _DATE_FIELDS = [
    'start_date',
    'status_date',
    'cancellation_date',
    'next_cycle',
  ];

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

    let rawData: any = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const headers = rawData[0].map((header) => {
      return this.fieldMapping[header] || header.replace(/\s+/g, '_');
    });

    rawData = rawData.slice(1);

    const jsonData = rawData.map((row: any) => {
      return row.reduce((accumulator, value, index) => {
        const transformedValue = this._transformValue(value, headers[index]);
        accumulator[headers[index]] = transformedValue;
        return accumulator;
      }, {});
    });

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
      transformHeader: (header) => {
        return this.fieldMapping[header] || header.replace(/\s+/g, '_');
      },
      transform: (value) => this._transformValue(value),
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
  }

  private _transformValue(value, header?) {
    if (this._DATE_FIELDS.includes(header) && typeof value === 'number') {
      console.log(value);
      return this._excelSerialDateToDate(value);
    }

    if (typeof value === 'string') {
      if (value.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/)) {
        return new Date(value);
      }

      if (value.match(/\d+,\d+/)) {
        return parseFloat(value.replace(',', '.'));
      }
    }

    return value;
  }

  private _excelSerialDateToDate(serial) {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    return new Date(utc_value * 1000);
  }
}
