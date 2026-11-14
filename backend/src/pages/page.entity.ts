import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Website } from '../websites/website.entity';
import { PageStatus } from '../common/enums/page-status.enum';
import { PageSection } from '../sections/page-section.entity';

@Entity('pages')
export class Page {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  slug!: string;

  @Column({ type: 'enum', enum: PageStatus, default: PageStatus.ACTIVE })
  status!: PageStatus;

  @Column({ type: 'uuid' })
  websiteId!: string;

  @ManyToOne(() => Website, (website) => website.pages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'websiteId' })
  website!: Website;

  @Column({ type: 'uuid', nullable: true })
  parentId!: string | null;

  @ManyToOne(() => Page, (page) => page.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parentId' })
  parent!: Page | null;

  @OneToMany(() => Page, (page) => page.parent)
  children!: Page[];

  @OneToMany(() => PageSection, (pageSection) => pageSection.page)
  pageSections!: PageSection[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
