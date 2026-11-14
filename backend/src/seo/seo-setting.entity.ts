import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { SeoEntityType } from '../common/enums/seo-entity.enum';

@Entity('seo_settings')
@Unique(['entityType', 'entityId'])
export class SeoSetting {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: SeoEntityType })
  entityType!: SeoEntityType;

  @Column({ type: 'uuid' })
  entityId!: string;

  @Column({ type: 'varchar', nullable: true })
  title!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'simple-array', nullable: true })
  keywords!: string[] | null;

  @Column({ type: 'varchar', nullable: true })
  ogImage!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
