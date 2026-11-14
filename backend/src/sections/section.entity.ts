import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PageSection } from './page-section.entity';

@Entity('sections')
export class Section {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  type!: string;

  @Column({ type: 'jsonb', default: {} })
  content!: Record<string, unknown>;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @OneToMany(() => PageSection, (pageSection) => pageSection.section)
  pageSections!: PageSection[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
