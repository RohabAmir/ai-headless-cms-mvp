import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { PostStatus } from '../common/enums/post-status.enum';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  async create(
    dto: CreatePostDto,
    authorId?: string,
  ): Promise<Post> {
    const existing = await this.postsRepository.findOne({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('Post slug already exists');
    }

    const status = dto.status ?? PostStatus.DRAFT;
    const post = this.postsRepository.create({
      ...dto,
      status,
      excerpt: dto.excerpt ?? null,
      categoryId: dto.categoryId ?? null,
      authorId: authorId ?? null,
      publishedAt: status === PostStatus.PUBLISHED ? new Date() : null,
    });
    const saved = await this.postsRepository.save(post);
    await this.activityLogsService.log({
      userId: authorId,
      entity: 'Post',
      entityId: saved.id,
      action: 'CREATE',
      metadata: { slug: saved.slug, status: saved.status },
    });
    return this.findOne(saved.id);
  }

  findAll(categoryId?: string): Promise<Post[]> {
    return this.postsRepository.find({
      where: categoryId ? { categoryId } : undefined,
      relations: ['category', 'author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['category', 'author'],
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async update(
    id: string,
    dto: UpdatePostDto,
    actorId?: string,
  ): Promise<Post> {
    const post = await this.findOne(id);

    if (dto.slug && dto.slug !== post.slug) {
      const existing = await this.postsRepository.findOne({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException('Post slug already exists');
      }
    }

    const previousStatus = post.status;
    Object.assign(post, {
      ...dto,
      excerpt: dto.excerpt === undefined ? post.excerpt : dto.excerpt,
      categoryId:
        dto.categoryId === undefined ? post.categoryId : dto.categoryId,
    });

    if (
      dto.status === PostStatus.PUBLISHED &&
      previousStatus !== PostStatus.PUBLISHED
    ) {
      post.publishedAt = new Date();
    }

    const saved = await this.postsRepository.save(post);
    await this.activityLogsService.log({
      userId: actorId,
      entity: 'Post',
      entityId: id,
      action: 'UPDATE',
      metadata: { ...dto },
    });
    return this.findOne(saved.id);
  }

  async remove(id: string, actorId?: string): Promise<void> {
    const post = await this.findOne(id);
    await this.postsRepository.remove(post);
    await this.activityLogsService.log({
      userId: actorId,
      entity: 'Post',
      entityId: id,
      action: 'DELETE',
      metadata: { slug: post.slug },
    });
  }

  async count(): Promise<number> {
    return this.postsRepository.count();
  }
}
