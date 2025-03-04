import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Appointment } from '../appointment/entities/appointment.entity';
import { Role } from '../common/enums/role.enum';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  role: Role;

  @OneToMany(() => Appointment, (appointment) => appointment.provider)
  appointmentsAsProvider: Appointment[];

  @OneToMany(() => Appointment, (appointment) => appointment.owner)
  appointmentsAsOwner: Appointment[];
}
