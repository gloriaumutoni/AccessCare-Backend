import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/user.entity';
import { AppointmentStatus } from '../../common/enums/appointment-status.enum';

@Entity('appointment')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  owner: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  provider: User;

  @Column({ type: 'varchar', length: 255 })
  start_date: string;

  @Column({ type: 'varchar', length: 255 })
  end_date: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;
}
