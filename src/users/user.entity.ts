import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
// import { Role } from '../enums/role.enum';
import { rawListeners } from 'process';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // @Column({
  //   type: 'enum',
  //   enum: Role,
  //   default: Role.PATIENT,
  // })
  // role: Role;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
}
