import { Controller, Get, Param } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('metris')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('/:fileId/mrr')
  async getMRR(@Param('fileId') fileId: string) {
    return await this.metricsService.calculateMRR(fileId);
  }

  @Get('/:fileId/churn-rate')
  async getChurnRate(@Param('fileId') fileId: string) {
    return await this.metricsService.calculateChurnRate(fileId);
  }

  @Get('/:fileId/group-by-status')
  async getGroupByStatus(@Param('fileId') fileId: string) {
    return await this.metricsService.groupByStatus(fileId);
  }

  @Get('/:fileId/group-by-users-per-value')
  async getGroupByUsersPerValue(@Param('fileId') fileId: string) {
    return await this.metricsService.groupByUsersPerValue(fileId);
  }
}
