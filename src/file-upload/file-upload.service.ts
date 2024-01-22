import { BadRequestException, Injectable } from '@nestjs/common';
import { MongoRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity, FileEntityStatus } from './entities/file.entity';
import { Request } from 'express';
import * as Multer from 'multer';

import { extname } from 'path';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(FileEntity)
    private fileRepository: MongoRepository<FileEntity>,
  ) {}

  async upload(file: Multer.File, req: Request) {
    const fileExtName: string = extname(file.originalname).toLowerCase();

    if (!['.xlsx', '.csv'].includes(fileExtName)) {
      throw new BadRequestException('Formato de arquivo não suportado.');
    }

    const fileEntity = await this.save(file, req);

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

    return await this.fileRepository.save(arquivo);
  }
}
