import { BadRequestException, Injectable } from '@nestjs/common';
import { MongoRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity, FileEntityStatus } from './entities/file.entity';
import * as Multer from 'multer';

import { extname } from 'path';
import { FileJobService } from 'src/job/file-job.service';
import { ObjectId } from 'mongodb';
import { FileEntitySerializer } from './serializer/file-entity.serializer';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(FileEntity)
    private _fileRepository: MongoRepository<FileEntity>,
    private _fileJobService: FileJobService,
  ) {}

  async getFile(fileId: string) {
    if (!ObjectId.isValid(fileId)) {
      throw new BadRequestException('Id do arquivo inválido.');
    }

    const file: FileEntity = await this._fileRepository.findOne({
      where: {
        _id: new ObjectId(fileId),
      },
    });

    return new FileEntitySerializer(file);
  }

  async upload(file: Multer.File) {
    const fileExtName: string = extname(file.originalname).toLowerCase();

    if (!['.xlsx', '.csv'].includes(fileExtName)) {
      throw new BadRequestException('Formato de arquivo não suportado.');
    }

    const fileEntity = await this.save(file);
    this._fileJobService.processFile(fileEntity, file, fileExtName);

    return fileEntity;
  }

  async save(file: Multer.File) {
    const arquivo = new FileEntity({
      status: FileEntityStatus.Processing,
      fileName: file.originalname,
      contentLength: file.size,
      contentType: file.mimetype,
    });

    return await this._fileRepository.save(arquivo);
  }
}
