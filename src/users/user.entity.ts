import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../auth/enums/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.PATIENT,
  })
  role: Role;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
}
