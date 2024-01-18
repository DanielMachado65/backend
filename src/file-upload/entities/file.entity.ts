import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type FileDocument = File & mongoose.Document;

@Schema()
export class File {
  @Prop()
  filename: string;

  @Prop()
  contentLength: number;

  @Prop()
  contentType: string;

  @Prop()
  url: string;
}

export const mFileSchema: mongoose.Schema<FileDocument> =
  SchemaFactory.createForClass(File);

export const mFileModelDef: ModelDefinition = {
  name: File.name,
  schema: mFileSchema,
};
