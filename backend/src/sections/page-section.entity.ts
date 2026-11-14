import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Page } from '../pages/page.entity';
import { Section } from './section.entity';

@Entity('page_sections')
export class PageSection {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  pageId!: string;

  @ManyToOne(() => Page, (page) => page.pageSections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pageId' })
  page!: Page;

  @Column({ type: 'uuid' })
  sectionId!: string;

  @ManyToOne(() => Section, (section) => section.pageSections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sectionId' })
  section!: Section;

  @Column({ type: 'int', default: 0 })
  order!: number;

  /** Optional per-page content override; falls back to section.content */
  @Column({ type: 'jsonb', nullable: true })
  contentOverride!: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
