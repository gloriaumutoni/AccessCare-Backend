import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
// import { Role } from '../common/enums/role.enum';

@Entity('admin')
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

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
