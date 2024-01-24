import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MetricsService } from './metrics.service';
import { FileEntity } from 'src/file/entities/file.entity';
import { MongoRepository } from 'typeorm';

describe('MetricsService', () => {
  let service: MetricsService;
  let mockRepository: jest.Mocked<MongoRepository<FileEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        {
          provide: getRepositoryToken(FileEntity),
          // Usamos o `jest.fn` para criar uma função que simula o repositório
          useValue: {
            aggregate: jest.fn().mockReturnThis(),
            toArray: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
    mockRepository = module.get(getRepositoryToken(FileEntity));
  });

  describe('calculateMRR', () => {
    it('should calculate monthly recurring revenue', async () => {
      const fileId = 'some-file-id';
      const mockData = [{ _id: { year: 2022, month: 5 }, totalValue: 100 }];

      jest.spyOn(mockRepository, 'aggregate').mockImplementation(
        () =>
          ({
            toArray: jest.fn().mockResolvedValue(mockData),
          }) as any,
      );

      const result = await service.calculateMRR(fileId);
      expect(mockRepository.aggregate).toHaveBeenCalled();
      expect(result).toEqual([{ period: '05/2022', totalValue: 100 }]);
    });
  });

  describe('calculateChurnRate', () => {
    it('should calculate churn rate', async () => {
      const fileId = 'some-file-id';
      const mockData = [
        { _id: { year: 2022, month: 5 }, total: 10, cancellations: 2 },
      ];

      jest.spyOn(mockRepository, 'aggregate').mockImplementation(
        () =>
          ({
            toArray: jest.fn().mockResolvedValue(mockData),
          }) as any,
      );

      const result = await service.calculateChurnRate(fileId);
      expect(mockRepository.aggregate).toHaveBeenCalled();
      expect(result).toEqual([{ period: '05/2022', churnRate: 20 }]);
    });
  });

  describe('groupByStatus', () => {
    it('should group data by status', async () => {
      const fileId = 'some-file-id';
      const mockData = [{ _id: 'Ativa', total: 5 }];

      jest.spyOn(mockRepository, 'aggregate').mockImplementation(
        () =>
          ({
            toArray: jest.fn().mockResolvedValue(mockData),
          }) as any,
      );

      const result = await service.groupByStatus(fileId);
      expect(mockRepository.aggregate).toHaveBeenCalled();
      expect(result).toEqual(mockData); // Assumindo que o resultado esperado é o mockData diretamente
    });
  });

  describe('groupByUsersPerValue', () => {
    it('should group users by total spent', async () => {
      const fileId = 'some-file-id';
      const mockData = [{ _id: 'user1', totalSpent: 150 }];

      jest.spyOn(mockRepository, 'aggregate').mockImplementation(
        () =>
          ({
            toArray: jest.fn().mockResolvedValue(mockData),
          }) as any,
      );

      const result = await service.groupByUsersPerValue(fileId);
      expect(mockRepository.aggregate).toHaveBeenCalled();
      expect(result).toEqual([{ subscriberId: 'user1', totalSpent: 150 }]);
    });
  });
});
