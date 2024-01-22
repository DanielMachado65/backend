import { BadRequestException, Injectable } from '@nestjs/common';
import { MongoRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity, FileEntityStatus } from './entities/file.entity';
import { Request } from 'express';
import * as Multer from 'multer';

import { extname } from 'path';
import { FileJobService } from 'src/job/file-job.service';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(FileEntity)
    private _fileRepository: MongoRepository<FileEntity>,
    private _fileJobService: FileJobService,
  ) {}

  async upload(file: Multer.File, req: Request) {
    const fileExtName: string = extname(file.originalname).toLowerCase();

    if (!['.xlsx', '.csv'].includes(fileExtName)) {
      throw new BadRequestException('Formato de arquivo não suportado.');
    }

    const fileEntity = await this.save(file, req);
    this._fileJobService.processFile(fileEntity, file, fileExtName);

    return fileEntity;
  }

  async save(file: Multer.File, req: Request) {
    const arquivo = new FileEntity({
      status: FileEntityStatus.Processing,
      fileName: file.originalname,
      contentLength: file.size,
      contentType: file.mimetype,
      url: `${req.protocol}://${req.get('host')}/files/${file.originalname}`,
    });

    console.log(arquivo);

    return await this._fileRepository.save(arquivo);
  }
}
