import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../common/enums/role.enum';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  async create(
    dto: CreateUserDto,
    actorId?: string,
  ): Promise<Omit<User, 'password'>> {
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const user = this.usersRepository.create({
      email: dto.email.toLowerCase(),
      name: dto.name,
      role: dto.role ?? Role.VIEWER,
      password: await bcrypt.hash(dto.password, 10),
    });

    const saved = await this.usersRepository.save(user);
    await this.activityLogsService.log({
      userId: actorId ?? saved.id,
      entity: 'User',
      entityId: saved.id,
      action: 'CREATE',
      metadata: { email: saved.email, role: saved.role },
    });

    return this.sanitize(saved);
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.usersRepository.find({
      order: { createdAt: 'DESC' },
    });
    return users.map((u) => this.sanitize(u));
  }

  async findOne(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.sanitize(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async findByIdWithPassword(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    actorId?: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email.toLowerCase() !== user.email) {
      const existing = await this.usersRepository.findOne({
        where: { email: dto.email.toLowerCase() },
      });
      if (existing) {
        throw new ConflictException('Email already in use');
      }
      user.email = dto.email.toLowerCase();
    }

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;

    const saved = await this.usersRepository.save(user);
    await this.activityLogsService.log({
      userId: actorId ?? id,
      entity: 'User',
      entityId: id,
      action: 'UPDATE',
      metadata: { ...dto },
    });

    return this.sanitize(saved);
  }

  async remove(id: string, actorId?: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.remove(user);
    await this.activityLogsService.log({
      userId: actorId ?? null,
      entity: 'User',
      entityId: id,
      action: 'DELETE',
      metadata: { email: user.email },
    });
  }

  async count(): Promise<number> {
    return this.usersRepository.count();
  }

  private sanitize(user: User): Omit<User, 'password'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user;
    return rest;
  }
}
