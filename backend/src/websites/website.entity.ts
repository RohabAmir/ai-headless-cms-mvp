import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Page } from '../pages/page.entity';

@Entity('websites')
export class Website {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column()
  url!: string;

  @Column({ type: 'text', nullable: true, default: null })
  description!: string | null;

  @OneToMany(() => Page, (page) => page.website)
  pages!: Page[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
