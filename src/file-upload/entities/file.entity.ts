import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class File {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: false })
  fileName: string;

  @Column({ nullable: false })
  contentLength: number;

  @Column({ nullable: false })
  contentType: string;

  @Column({ nullable: false })
  url: string;
}
