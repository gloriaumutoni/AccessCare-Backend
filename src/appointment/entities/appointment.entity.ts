import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Admin } from '../../admin/admin.entity';

@Entity('appointment')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Admin, { eager: true })
  @JoinColumn()
  owner: Admin;

  @ManyToOne(() => Admin, { eager: true })
  @JoinColumn()
  provider: Admin;

  @Column({ type: 'varchar', length: 255 })
  start_date: string;

  @Column({ type: 'varchar', length: 255 })
  end_date: string;

  @Column('text', { nullable: true })
  notes: string;
}
