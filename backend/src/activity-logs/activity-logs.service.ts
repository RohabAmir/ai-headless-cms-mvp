import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './activity-log.entity';

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
  ) {}

  async log(params: {
    userId?: string | null;
    entity: string;
    entityId?: string | null;
    action: string;
    metadata?: Record<string, unknown> | null;
  }): Promise<ActivityLog> {
    const log = this.activityLogRepository.create({
      userId: params.userId ?? null,
      entity: params.entity,
      entityId: params.entityId ?? null,
      action: params.action,
      metadata: params.metadata ?? null,
    });
    return this.activityLogRepository.save(log);
  }

  async findAll(limit = 50): Promise<ActivityLog[]> {
    return this.activityLogRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: Math.min(limit, 200),
    });
  }

  async findByEntity(entity: string, entityId: string): Promise<ActivityLog[]> {
    return this.activityLogRepository.find({
      where: { entity, entityId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getActivityOverTime(days = 30): Promise<{ date: string; count: number }[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const rows = await this.activityLogRepository
      .createQueryBuilder('log')
      .select(`TO_CHAR(log.createdAt, 'YYYY-MM-DD')`, 'date')
      .addSelect('COUNT(*)', 'count')
      .where('log.createdAt >= :since', { since })
      .groupBy(`TO_CHAR(log.createdAt, 'YYYY-MM-DD')`)
      .orderBy('date', 'ASC')
      .getRawMany<{ date: string; count: string }>();

    return rows.map((row) => ({
      date: row.date,
      count: Number(row.count),
    }));
  }
}
