import { FileEntityStatus, FileEntity } from '../entities/file.entity';

export class FileEntitySerializer {
  id: string;
  fileName: string;
  url: string;
  status: FileEntityStatus;

  constructor(fileEntity: FileEntity) {
    this.id = fileEntity.id;
    this.fileName = fileEntity.fileName;
    this.status = fileEntity.status;
  }
}
