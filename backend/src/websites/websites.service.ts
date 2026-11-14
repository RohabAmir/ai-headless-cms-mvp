import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Website } from './website.entity';
import { CreateWebsiteDto } from './dto/create-website.dto';
import { UpdateWebsiteDto } from './dto/update-website.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Injectable()
export class WebsitesService {
  constructor(
    @InjectRepository(Website)
    private readonly websitesRepository: Repository<Website>,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  async create(dto: CreateWebsiteDto, actorId?: string): Promise<Website> {
    const existing = await this.websitesRepository.findOne({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('Website slug already exists');
    }

    const website = this.websitesRepository.create(dto);
    const saved = await this.websitesRepository.save(website);
    await this.activityLogsService.log({
      userId: actorId,
      entity: 'Website',
      entityId: saved.id,
      action: 'CREATE',
      metadata: { slug: saved.slug },
    });
    return saved;
  }

  findAll(): Promise<Website[]> {
    return this.websitesRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Website> {
    const website = await this.websitesRepository.findOne({
      where: { id },
      relations: ['pages'],
    });
    if (!website) {
      throw new NotFoundException('Website not found');
    }
    return website;
  }

  async findBySlug(slug: string): Promise<Website> {
    const website = await this.websitesRepository.findOne({ where: { slug } });
    if (!website) {
      throw new NotFoundException('Website not found');
    }
    return website;
  }

  async update(
    id: string,
    dto: UpdateWebsiteDto,
    actorId?: string,
  ): Promise<Website> {
    const website = await this.findOne(id);

    if (dto.slug && dto.slug !== website.slug) {
      const existing = await this.websitesRepository.findOne({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException('Website slug already exists');
      }
    }

    Object.assign(website, dto);
    const saved = await this.websitesRepository.save(website);
    await this.activityLogsService.log({
      userId: actorId,
      entity: 'Website',
      entityId: id,
      action: 'UPDATE',
      metadata: { ...dto },
    });
    return saved;
  }

  async remove(id: string, actorId?: string): Promise<void> {
    const website = await this.findOne(id);
    await this.websitesRepository.remove(website);
    await this.activityLogsService.log({
      userId: actorId,
      entity: 'Website',
      entityId: id,
      action: 'DELETE',
      metadata: { slug: website.slug },
    });
  }

  count(): Promise<number> {
    return this.websitesRepository.count();
  }
}
