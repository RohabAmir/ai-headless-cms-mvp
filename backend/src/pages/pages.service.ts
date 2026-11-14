import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from './page.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { PageStatus } from '../common/enums/page-status.enum';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private readonly pagesRepository: Repository<Page>,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  async create(dto: CreatePageDto, actorId?: string): Promise<Page> {
    const existing = await this.pagesRepository.findOne({
      where: { websiteId: dto.websiteId, slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('Page slug already exists for this website');
    }

    if (dto.parentId) {
      const parent = await this.pagesRepository.findOne({
        where: { id: dto.parentId, websiteId: dto.websiteId },
      });
      if (!parent) {
        throw new NotFoundException('Parent page not found on this website');
      }
    }

    const page = this.pagesRepository.create({
      ...dto,
      parentId: dto.parentId ?? null,
      status: dto.status ?? PageStatus.ACTIVE,
    });
    const saved = await this.pagesRepository.save(page);
    await this.activityLogsService.log({
      userId: actorId,
      entity: 'Page',
      entityId: saved.id,
      action: 'CREATE',
      metadata: { slug: saved.slug, websiteId: saved.websiteId },
    });
    return saved;
  }

  findAll(websiteId?: string): Promise<Page[]> {
    return this.pagesRepository.find({
      where: websiteId ? { websiteId } : undefined,
      relations: ['website', 'parent'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Page> {
    const page = await this.pagesRepository.findOne({
      where: { id },
      relations: ['website', 'parent', 'children', 'pageSections', 'pageSections.section'],
    });
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    return page;
  }

  async findByWebsiteAndSlug(
    websiteId: string,
    slug: string,
  ): Promise<Page | null> {
    return this.pagesRepository.findOne({
      where: { websiteId, slug, status: PageStatus.ACTIVE },
      relations: ['pageSections', 'pageSections.section'],
    });
  }

  async update(
    id: string,
    dto: UpdatePageDto,
    actorId?: string,
  ): Promise<Page> {
    const page = await this.findOne(id);

    if (dto.slug && dto.slug !== page.slug) {
      const existing = await this.pagesRepository.findOne({
        where: { websiteId: page.websiteId, slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException(
          'Page slug already exists for this website',
        );
      }
    }

    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new ConflictException('Page cannot be its own parent');
      }
      const parent = await this.pagesRepository.findOne({
        where: { id: dto.parentId, websiteId: page.websiteId },
      });
      if (!parent) {
        throw new NotFoundException('Parent page not found on this website');
      }
    }

    Object.assign(page, {
      ...dto,
      parentId: dto.parentId === undefined ? page.parentId : dto.parentId,
    });
    const saved = await this.pagesRepository.save(page);
    await this.activityLogsService.log({
      userId: actorId,
      entity: 'Page',
      entityId: id,
      action: 'UPDATE',
      metadata: { ...dto },
    });
    return saved;
  }

  async remove(id: string, actorId?: string): Promise<void> {
    const page = await this.findOne(id);
    await this.pagesRepository.remove(page);
    await this.activityLogsService.log({
      userId: actorId,
      entity: 'Page',
      entityId: id,
      action: 'DELETE',
      metadata: { slug: page.slug },
    });
  }

  async count(): Promise<number> {
    return this.pagesRepository.count();
  }
}
