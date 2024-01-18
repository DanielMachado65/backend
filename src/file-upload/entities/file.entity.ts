import { Entity, Column, ObjectIdColumn } from 'typeorm';

@Entity('file')
export class FileEntity {
  @ObjectIdColumn({ unique: true }) id: string;

  @Column({ nullable: false }) fileName: string;
  @Column({ nullable: false }) contentLength: number;
  @Column({ nullable: false }) contentType: string;
  @Column({ nullable: false }) url: string;

  // salvar o json data
  @Column({ type: 'jsonb' }) data: any;

  constructor(file?: Partial<FileEntity>) {
    Object.assign(this, file);
  }
}
