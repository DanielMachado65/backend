import {
  Entity,
  Column,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum FileEntityStatus {
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed',
}

/**
 * Essa entidade pode funcionar como job de processamento
 */
@Entity('file')
export class FileEntity {
  @ObjectIdColumn({ unique: true }) id: string;

  @Column({ nullable: false }) fileName: string;
  @Column({ nullable: false }) contentLength: number;
  @Column({ nullable: false }) contentType: string;
  @Column({ nullable: false }) url: string;
  // salvar o json data
  @Column({ type: 'jsonb' }) data: any;

  @Column({
    enum: FileEntityStatus,
    default: FileEntityStatus.Pending,
  })
  status: FileEntityStatus;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;

  constructor(file?: Partial<FileEntity>) {
    Object.assign(this, file);
  }
}
