import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FileJobService } from './file-job.service';
import { FileEntity, FileEntityStatus } from 'src/file/entities/file.entity';
import { MongoRepository } from 'typeorm';

import * as Multer from 'multer';

import * as xlsx from 'xlsx';
import * as papa from 'papaparse';

jest.mock('xlsx', () => ({
  read: jest.fn(() => ({
    SheetNames: ['sheet1'],
    Sheets: {
      sheet1: {},
    },
  })),
  utils: {
    sheet_to_json: jest.fn(() => [
      [
        'quantidade cobranças',
        'cobrada a cada X dias',
        'data início',
        'status',
        'data status',
        'data cancelamento',
        'valor',
        'próximo ciclo',
        'ID assinante',
      ],
      [
        '10',
        '30',
        '2020-01-01',
        'Ativa',
        '2020-01-01',
        '2020-02-01',
        '100',
        '2020-03-01',
        '1',
      ],
    ]),
  },
}));

jest.mock('papaparse', () => ({
  parse: jest.fn(),
}));

describe('FileJobService', () => {
  let service: FileJobService;
  let mockRepository: jest.Mocked<MongoRepository<FileEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileJobService,
        {
          provide: getRepositoryToken(FileEntity),
          useValue: {
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FileJobService>(FileJobService);
    mockRepository = module.get(getRepositoryToken(FileEntity));
  });

  describe('processFile', () => {
    it('should process .xlsx file and update the entity', async () => {
      const fileEntity = new FileEntity();
      fileEntity.id = 'some-file-id';

      const fileBuffer = Buffer.from('file-content');
      const mockFile = {
        buffer: fileBuffer,
      } as Multer.File;

      // Configuração do mock para o retorno de `sheet_to_json`
      const mockData = [
        {
          cancellation_date: '2020-02-01',
          charge_quantity: '10',
          charged_every_x_days: '30',
          next_cycle: '2020-03-01',
          start_date: '2020-01-01',
          status: 'Ativa',
          status_date: '2020-01-01',
          subscriber_id: '123',
          value: '100.00',
        },
      ];
      (xlsx.utils.sheet_to_json as jest.Mock).mockReturnValue([
        [
          'quantidade cobranças',
          'cobrada a cada X dias',
          'data início',
          'status',
          'data status',
          'data cancelamento',
          'valor',
          'próximo ciclo',
          'ID assinante',
        ],
        [
          '10',
          '30',
          '2020-01-01',
          'Ativa',
          '2020-01-01',
          '2020-02-01',
          '100.00',
          '2020-03-01',
          '123',
        ],
      ]) as any;

      await service.processFile(fileEntity, mockFile, '.xlsx');

      expect(mockRepository.update).toHaveBeenCalledWith(fileEntity.id, {
        data: mockData,
        status: FileEntityStatus.Completed,
      });
    });

    it('should process .csv file and update the entity', async () => {
      const fileEntity = new FileEntity();
      fileEntity.id = 'some-file-id';

      const fileBuffer = Buffer.from('file-content');
      const mockFile = {
        buffer: fileBuffer,
      } as Multer.File;

      const mockData = [{ columnName: 'value1' }, { columnName: 'value2' }];
      (papa.parse as jest.Mock).mockImplementation((fileContent, config) => {
        config.complete({
          data: mockData,
        });
      });

      await service.processFile(fileEntity, mockFile, '.csv');

      expect(papa.parse).toHaveBeenCalled();
      expect(mockRepository.update).toHaveBeenCalledWith(fileEntity.id, {
        data: mockData,
        status: FileEntityStatus.Completed,
      });
    });

    it('should throw an error for unsupported file formats', async () => {
      const fileEntity = new FileEntity();
      fileEntity.id = 'some-file-id';

      const mockFile = {
        buffer: Buffer.from('file-content'),
      } as Multer.File;

      await expect(
        service.processFile(fileEntity, mockFile, '.txt'),
      ).rejects.toThrow('Formato de arquivo não suportado.');
    });
  });
});
