import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Section } from './section.entity';
import { PageSection } from './page-section.entity';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { AttachSectionDto } from './dto/attach-section.dto';
import { ReorderSectionsDto } from './dto/reorder-sections.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { Page } from '../pages/page.entity';

@Injectable()
export class SectionsService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionsRepository: Repository<Section>,
    @InjectRepository(PageSection)
    private readonly pageSectionsRepository: Repository<PageSection>,
    @InjectRepository(Page)
    private readonly pagesRepository: Repository<Page>,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  async create(dto: CreateSectionDto, actorId?: string): Promise<Section> {
    const section = this.sectionsRepository.create({
      ...dto,
      content: dto.content ?? {},
      description: dto.description ?? null,
    });
    const saved = await this.sectionsRepository.save(section);
    await this.activityLogsService.log({
      userId: actorId,
      entity: 'Section',
      entityId: saved.id,
      action: 'CREATE',
      metadata: { name: saved.name, type: saved.type },
    });
    return saved;
  }

  findAll(): Promise<Section[]> {
    return this.sectionsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Section> {
    const section = await this.sectionsRepository.findOne({ where: { id } });
    if (!section) {
      throw new NotFoundException('Section not found');
    }
    return section;
  }

  async update(
    id: string,
    dto: UpdateSectionDto,
    actorId?: string,
  ): Promise<Section> {
    const section = await this.findOne(id);
    Object.assign(section, dto);
    const saved = await this.sectionsRepository.save(section);
    await this.activityLogsService.log({
      userId: actorId,
      entity: 'Section',
      entityId: id,
      action: 'UPDATE',
      metadata: { ...dto },
    });
    return saved;
  }

  async remove(id: string, actorId?: string): Promise<void> {
    const section = await this.findOne(id);
    await this.sectionsRepository.remove(section);
    await this.activityLogsService.log({
      userId: actorId,
      entity: 'Section',
      entityId: id,
      action: 'DELETE',
      metadata: { name: section.name },
    });
  }

  async attachToPage(
    pageId: string,
    dto: AttachSectionDto,
    actorId?: string,
  ): Promise<PageSection> {
    const page = await this.pagesRepository.findOne({ where: { id: pageId } });
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    await this.findOne(dto.sectionId);

    let order = dto.order;
    if (order === undefined) {
      const max = await this.pageSectionsRepository
        .createQueryBuilder('ps')
        .select('MAX(ps.order)', 'max')
        .where('ps.pageId = :pageId', { pageId })
        .getRawOne<{ max: number | null }>();
      order = (max?.max ?? -1) + 1;
    }

    const pageSection = this.pageSectionsRepository.create({
      pageId,
      sectionId: dto.sectionId,
      order,
      contentOverride: dto.contentOverride ?? null,
    });
    const saved = await this.pageSectionsRepository.save(pageSection);
    await this.activityLogsService.log({
      userId: actorId,
      entity: 'PageSection',
      entityId: saved.id,
      action: 'CREATE',
      metadata: { pageId, sectionId: dto.sectionId, order },
    });
    return this.pageSectionsRepository.findOneOrFail({
      where: { id: saved.id },
      relations: ['section'],
    });
  }

  async getPageSections(pageId: string): Promise<PageSection[]> {
    const page = await this.pagesRepository.findOne({ where: { id: pageId } });
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    return this.pageSectionsRepository.find({
      where: { pageId },
      relations: ['section'],
      order: { order: 'ASC' },
    });
  }

  async reorder(
    pageId: string,
    dto: ReorderSectionsDto,
    actorId?: string,
  ): Promise<PageSection[]> {
    const page = await this.pagesRepository.findOne({ where: { id: pageId } });
    if (!page) {
      throw new NotFoundException('Page not found');
    }

    const ids = dto.items.map((i) => i.pageSectionId);
    const existing = await this.pageSectionsRepository.find({
      where: { pageId, id: In(ids) },
    });

    if (existing.length !== ids.length) {
      throw new BadRequestException(
        'One or more page sections do not belong to this page',
      );
    }

    for (const item of dto.items) {
      await this.pageSectionsRepository.update(
        { id: item.pageSectionId, pageId },
        { order: item.order },
      );
    }

    await this.activityLogsService.log({
      userId: actorId,
      entity: 'PageSection',
      entityId: pageId,
      action: 'REORDER',
      metadata: { items: dto.items },
    });

    return this.getPageSections(pageId);
  }

  async detachFromPage(
    pageId: string,
    pageSectionId: string,
    actorId?: string,
  ): Promise<void> {
    const pageSection = await this.pageSectionsRepository.findOne({
      where: { id: pageSectionId, pageId },
    });
    if (!pageSection) {
      throw new NotFoundException('Page section not found');
    }
    await this.pageSectionsRepository.remove(pageSection);
    await this.activityLogsService.log({
      userId: actorId,
      entity: 'PageSection',
      entityId: pageSectionId,
      action: 'DELETE',
      metadata: { pageId },
    });
  }

  async updatePageSection(
    pageId: string,
    pageSectionId: string,
    data: { order?: number; contentOverride?: Record<string, unknown> | null },
    actorId?: string,
  ): Promise<PageSection> {
    const pageSection = await this.pageSectionsRepository.findOne({
      where: { id: pageSectionId, pageId },
      relations: ['section'],
    });
    if (!pageSection) {
      throw new NotFoundException('Page section not found');
    }
    if (data.order !== undefined) pageSection.order = data.order;
    if (data.contentOverride !== undefined) {
      pageSection.contentOverride = data.contentOverride;
    }
    const saved = await this.pageSectionsRepository.save(pageSection);
    await this.activityLogsService.log({
      userId: actorId,
      entity: 'PageSection',
      entityId: pageSectionId,
      action: 'UPDATE',
      metadata: { ...data },
    });
    return saved;
  }

  async count(): Promise<number> {
    return this.sectionsRepository.count();
  }
}
