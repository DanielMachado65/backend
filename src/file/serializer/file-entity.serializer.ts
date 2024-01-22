import { FileEntityStatus, FileEntity } from '../entities/file.entity';

export class FileEntitySerializer {
  id: string;
  fileName: string;
  url: string;
  status: FileEntityStatus;
  data: any;

  constructor(fileEntity: FileEntity) {
    this.id = fileEntity.id;
    this.fileName = fileEntity.fileName;
    this.status = fileEntity.status;
    this.data = fileEntity.data;
  }
}
