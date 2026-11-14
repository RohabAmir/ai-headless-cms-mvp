import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  async create(dto: CreateCategoryDto, actorId?: string): Promise<Category> {
    const existing = await this.categoriesRepository.findOne({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('Category slug already exists');
    }

    const category = this.categoriesRepository.create({
      ...dto,
      description: dto.description ?? null,
    });
    const saved = await this.categoriesRepository.save(category);
    await this.activityLogsService.log({
      userId: actorId,
      entity: 'Category',
      entityId: saved.id,
      action: 'CREATE',
      metadata: { slug: saved.slug },
    });
    return saved;
  }

  findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['posts'],
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
    actorId?: string,
  ): Promise<Category> {
    const category = await this.findOne(id);
    if (dto.slug && dto.slug !== category.slug) {
      const existing = await this.categoriesRepository.findOne({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException('Category slug already exists');
      }
    }
    Object.assign(category, dto);
    const saved = await this.categoriesRepository.save(category);
    await this.activityLogsService.log({
      userId: actorId,
      entity: 'Category',
      entityId: id,
      action: 'UPDATE',
      metadata: { ...dto },
    });
    return saved;
  }

  async remove(id: string, actorId?: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoriesRepository.remove(category);
    await this.activityLogsService.log({
      userId: actorId,
      entity: 'Category',
      entityId: id,
      action: 'DELETE',
      metadata: { slug: category.slug },
    });
  }
}
