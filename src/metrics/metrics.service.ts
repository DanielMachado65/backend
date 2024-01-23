import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { FileEntity } from 'src/file/entities/file.entity';
import { MongoRepository } from 'typeorm';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(FileEntity)
    private _fileRepository: MongoRepository<FileEntity>,
  ) {}

  async getMetrics(fileId: string) {
    const file: FileEntity = await this._fileRepository.findOne({
      where: {
        _id: new ObjectId(fileId),
      },
    });

    if (!file.data) {
      return {
        status: file.status,
        mrr: {},
        churnRate: {},
        groupByStatus: {},
      };
    }

    const mrr = await this.calculateMRR(file.id);
    const churnRate = await this.calculateChurnRate(file.id);
    const groupByStatus = await this.groupByStatus(file.id);

    return {
      status: file.status,
      mrr,
      churnRate,
      groupByStatus,
    };
  }

  async calculateMRR(fileId: string) {
    const aggregationResult = await this._fileRepository
      .aggregate([
        {
          $match: {
            _id: new ObjectId(fileId),
          },
        },
        {
          $unwind: {
            path: '$data',
          },
        },
        {
          $match: {
            'data.status': 'Ativa',
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$data.start_date' },
              month: { $month: '$data.start_date' },
            },
            totalValue: {
              $sum: '$data.value',
            },
          },
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.month': 1,
          },
        },
      ])
      .toArray();

    const transformedData = aggregationResult.map((item: any) => {
      return {
        period: `${item._id.month.toString().padStart(2, '0')}/${item._id.year}`,
        totalValue: item.totalValue,
      };
    });

    return transformedData;
  }

  async calculateChurnRate(fileId: string) {
    const aggregationResult = await this._fileRepository
      .aggregate([
        {
          $match: {
            _id: new ObjectId(fileId),
          },
        },
        {
          $unwind: {
            path: '$data',
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$data.start_date' },
              month: { $month: '$data.start_date' },
            },
            total: { $sum: 1 },
            cancellations: {
              $sum: {
                $cond: [{ $eq: ['$data.status', 'Cancelada'] }, 1, 0],
              },
            },
          },
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.month': 1,
          },
        },
      ])
      .toArray();

    const churnRates = aggregationResult.map((item: any) => {
      const churnRate =
        item.total > 0 ? (item.cancellations / item.total) * 100 : 0;
      return {
        period: `${item._id.month.toString().padStart(2, '0')}/${item._id.year}`,
        churnRate,
      };
    });

    return churnRates;
  }

  async groupByStatus(fileId: string) {
    const aggregationResult = await this._fileRepository
      .aggregate([
        {
          $match: {
            _id: new ObjectId(fileId),
          },
        },
        {
          $unwind: {
            path: '$data',
          },
        },
        {
          $group: {
            _id: '$data.status',
            total: { $sum: 1 },
          },
        },
        {
          $sort: {
            total: -1,
          },
        },
      ])
      .toArray();

    return aggregationResult;
  }
}
