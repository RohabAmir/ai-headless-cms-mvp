import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeoSetting } from './seo-setting.entity';
import { UpsertSeoDto } from './dto/upsert-seo.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { SeoEntityType } from '../common/enums/seo-entity.enum';

@Injectable()
export class SeoService {
  constructor(
    @InjectRepository(SeoSetting)
    private readonly seoRepository: Repository<SeoSetting>,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  findAll(): Promise<SeoSetting[]> {
    return this.seoRepository.find({ order: { updatedAt: 'DESC' } });
  }

  async findOne(id: string): Promise<SeoSetting> {
    const seo = await this.seoRepository.findOne({ where: { id } });
    if (!seo) {
      throw new NotFoundException('SEO setting not found');
    }
    return seo;
  }

  async findByEntity(
    entityType: SeoEntityType,
    entityId: string,
  ): Promise<SeoSetting | null> {
    return this.seoRepository.findOne({ where: { entityType, entityId } });
  }

  async upsert(dto: UpsertSeoDto, actorId?: string): Promise<SeoSetting> {
    let seo = await this.findByEntity(dto.entityType, dto.entityId);
    const isCreate = !seo;

    if (!seo) {
      seo = this.seoRepository.create({
        entityType: dto.entityType,
        entityId: dto.entityId,
      });
    }

    if (dto.title !== undefined) seo.title = dto.title;
    if (dto.description !== undefined) seo.description = dto.description;
    if (dto.keywords !== undefined) seo.keywords = dto.keywords;
    if (dto.ogImage !== undefined) seo.ogImage = dto.ogImage;

    const saved = await this.seoRepository.save(seo);
    await this.activityLogsService.log({
      userId: actorId,
      entity: 'SeoSetting',
      entityId: saved.id,
      action: isCreate ? 'CREATE' : 'UPDATE',
      metadata: {
        entityType: dto.entityType,
        entityId: dto.entityId,
      },
    });
    return saved;
  }

  async remove(id: string, actorId?: string): Promise<void> {
    const seo = await this.findOne(id);
    await this.seoRepository.remove(seo);
    await this.activityLogsService.log({
      userId: actorId,
      entity: 'SeoSetting',
      entityId: id,
      action: 'DELETE',
      metadata: {
        entityType: seo.entityType,
        entityId: seo.entityId,
      },
    });
  }
}
